"use server";

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@repo/database/connection";
import { user, virtualCard } from "@repo/database/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function createVirtualCard(name: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser?.stripeCardholderId) {
    throw new Error("Complete onboarding first");
  }

  const card = await stripe.issuing.cards.create({
    cardholder: currentUser.stripeCardholderId,
    currency: "usd",
    type: "virtual",
    status: "active",
    spending_controls: {
      spending_limits: [
        { amount: 100000, interval: "daily" },
        { amount: 500000, interval: "monthly" },
      ],
    },
  });

  await db.insert(virtualCard).values({
    userId: session.user.id,
    stripeCardId: card.id,
    name,
    last4: card.last4,
    status: "active",
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
      eq(virtualCard.userId, session.user.id)
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

  return await db.query.virtualCard.findMany({
    where: eq(virtualCard.userId, session.user.id),
    orderBy: [desc(virtualCard.createdAt)],
  });
}

