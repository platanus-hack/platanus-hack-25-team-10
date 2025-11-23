"use server";

import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { db } from "@/db";
import { transaction, user, virtualCard } from "@/db/schema";
import { auth } from "@/modules/shared/lib/auth";
import { stripe } from "@/modules/shared/lib/stripe";

export async function createVirtualCard(
  name: string,
  cardType: "single_use" | "permanent" = "permanent",
  monthlyLimit: number | null,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser?.stripeCardholderId) {
    throw new Error("Complete onboarding first");
  }

  // Configure spending limits based on card type
  // Convert monthly limit from dollars to cents
  const monthlyLimitCents = monthlyLimit
    ? Math.round(monthlyLimit * 100)
    : null;

  // Only create spending limits if monthlyLimit is provided
  const spendingLimits:
    | Stripe.Issuing.CardCreateParams.SpendingControls.SpendingLimit[]
    | undefined = monthlyLimitCents
    ? [
        // Daily limit is 20% of monthly limit (or minimum $100)
        {
          amount: Math.max(Math.round(monthlyLimitCents * 0.2), 10000),
          interval: "daily",
        },
        { amount: monthlyLimitCents, interval: "monthly" },
      ]
    : undefined;

  const card = await stripe.issuing.cards.create({
    cardholder: currentUser.stripeCardholderId,
    currency: "usd",
    type: "virtual",
    status: "active",
    ...(spendingLimits && {
      spending_controls: {
        spending_limits: spendingLimits,
      },
    }),
  });

  await db.insert(virtualCard).values({
    userId: session.user.id,
    stripeCardId: card.id,
    name,
    last4: card.last4,
    status: "active",
    cardType,
    spendingLimit: monthlyLimitCents, // Store in DB (in cents)
  });

  return { cardId: card.id, last4: card.last4 };
}

export async function getCardDetails(cardId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  // Verify card belongs to user
  const card = await db.query.virtualCard.findFirst({
    where: and(
      eq(virtualCard.stripeCardId, cardId),
      eq(virtualCard.userId, session.user.id),
    ),
  });

  if (!card) throw new Error("Card not found");

  const stripeCard = await stripe.issuing.cards.retrieve(cardId, {
    expand: ["number", "cvc"],
  });

  return {
    number: stripeCard.number,
    cvc: stripeCard.cvc,
    exp_month: stripeCard.exp_month,
    exp_year: stripeCard.exp_year,
    last4: stripeCard.last4,
  };
}

export async function listVirtualCards() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const cards = await db.query.virtualCard.findMany({
    where: eq(virtualCard.userId, session.user.id),
    orderBy: [desc(virtualCard.createdAt)],
  });
  return cards;
}

export async function getEnrichedCardData(stripeCardId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  // Verify card belongs to user
  const card = await db.query.virtualCard.findFirst({
    where: and(
      eq(virtualCard.stripeCardId, stripeCardId),
      eq(virtualCard.userId, session.user.id),
    ),
  });

  if (!card) throw new Error("Card not found");

  // Fetch card details from Stripe
  const stripeCard = await stripe.issuing.cards.retrieve(stripeCardId, {
    expand: ["cardholder"],
  });

  // Get cardholder name
  const cardholder =
    typeof stripeCard.cardholder === "object" && stripeCard.cardholder !== null
      ? stripeCard.cardholder.name || "Cardholder"
      : "Cardholder";

  // Get spending limit from DB (in cents), convert to dollars if exists
  const spendingLimit = card.spendingLimit ? card.spendingLimit / 100 : null;

  // Get current spending from transactions
  const transactions = await db.query.transaction.findMany({
    where: and(
      eq(transaction.virtualCardId, card.id),
      eq(transaction.status, "approved"),
    ),
  });

  // Sum up all approved transaction amounts (in cents), convert to dollars
  const currentSpending =
    transactions.reduce((sum, tx) => sum + tx.merchantAmount, 0) / 100;

  // Normalize brand from Stripe (handles null, undefined, and unknown values)
  const brand: string = stripeCard.brand || "unknown";

  return {
    id: card.id,
    stripeCardId: card.stripeCardId,
    name: card.name,
    last4: card.last4,
    status: card.status,
    createdAt: card.createdAt,
    expiryMonth: stripeCard.exp_month,
    expiryYear: stripeCard.exp_year,
    brand,
    cardholder,
    spendingLimit,
    currentSpending,
    currency: stripeCard.currency,
  };
}

export async function pauseCard(stripeCardId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  // Verify card belongs to user
  const card = await db.query.virtualCard.findFirst({
    where: and(
      eq(virtualCard.stripeCardId, stripeCardId),
      eq(virtualCard.userId, session.user.id),
    ),
  });

  if (!card) throw new Error("Card not found");
  if (card.status === "canceled")
    throw new Error("Cannot pause a canceled card");

  // Update card status in Stripe
  await stripe.issuing.cards.update(stripeCardId, {
    status: "inactive",
  });

  // Update card status in DB
  await db
    .update(virtualCard)
    .set({ status: "inactive" })
    .where(eq(virtualCard.id, card.id));

  return { success: true };
}

export async function activateCard(stripeCardId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  // Verify card belongs to user
  const card = await db.query.virtualCard.findFirst({
    where: and(
      eq(virtualCard.stripeCardId, stripeCardId),
      eq(virtualCard.userId, session.user.id),
    ),
  });

  if (!card) throw new Error("Card not found");
  if (card.status === "canceled")
    throw new Error("Cannot activate a canceled card");

  // Update card status in Stripe
  await stripe.issuing.cards.update(stripeCardId, {
    status: "active",
  });

  // Update card status in DB
  await db
    .update(virtualCard)
    .set({ status: "active" })
    .where(eq(virtualCard.id, card.id));

  return { success: true };
}

export async function cancelCard(stripeCardId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  // Verify card belongs to user
  const card = await db.query.virtualCard.findFirst({
    where: and(
      eq(virtualCard.stripeCardId, stripeCardId),
      eq(virtualCard.userId, session.user.id),
    ),
  });

  if (!card) throw new Error("Card not found");
  if (card.status === "canceled") throw new Error("Card is already canceled");

  // Update card status in Stripe
  await stripe.issuing.cards.update(stripeCardId, {
    status: "canceled",
  });

  // Update card status in DB
  await db
    .update(virtualCard)
    .set({ status: "canceled" })
    .where(eq(virtualCard.id, card.id));

  return { success: true };
}
