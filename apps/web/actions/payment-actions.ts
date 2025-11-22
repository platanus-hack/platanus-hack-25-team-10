"use server";

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@repo/database/connection";
import { user, paymentMethod } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function createSetupSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser?.stripeCustomerId) {
    throw new Error("Setup Stripe customer first");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: currentUser.stripeCustomerId,
    mode: "setup",
    payment_method_types: ["card"],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding?setup=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding?setup=cancelled`,
  });

  return { url: checkoutSession.url };
}

export async function attachPaymentMethod(paymentMethodId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser?.stripeCustomerId) {
    throw new Error("Setup Stripe customer first");
  }

  // Attach to Stripe customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: currentUser.stripeCustomerId,
  });

  // Set as default
  await stripe.customers.update(currentUser.stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // Save to DB
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  
  // Unset other defaults
  await db
    .update(paymentMethod)
    .set({ isDefault: false })
    .where(eq(paymentMethod.userId, session.user.id));

  await db.insert(paymentMethod).values({
    userId: session.user.id,
    stripePaymentMethodId: paymentMethodId,
    last4: pm.card!.last4,
    brand: pm.card!.brand,
    isDefault: true,
  });

  // Create cardholder if doesn't exist
  if (!currentUser.stripeCardholderId) {
    const cardholder = await stripe.issuing.cardholders.create({
      name: session.user.name || "User",
      email: session.user.email,
      phone_number: "+18008675309",
      type: "individual",
      billing: {
        address: {
          line1: "123 Main St",
          city: "San Francisco",
          state: "CA",
          postal_code: "94111",
          country: "US",
        },
      },
      individual: {
        first_name: session.user.name?.split(" ")[0] || "User",
        last_name: session.user.name?.split(" ")[1] || "Name",
        dob: { year: 1990, month: 1, day: 1 },
        card_issuing: {
          user_terms_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: "127.0.0.1",
          },
        },
      },
    });

    await db
      .update(user)
      .set({ stripeCardholderId: cardholder.id })
      .where(eq(user.id, session.user.id));
  }

  return { success: true };
}

