import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import { db } from "@/db";
import { paymentMethod, transaction, user, virtualCard } from "@/db/schema";
import { stripe } from "@/modules/shared/lib/stripe";

// Disable Next.js body parsing so we can access the raw body
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  console.log("🔍 Webhook Debug:");
  console.log("- Has signature:", !!sig);
  console.log("- Has secret:", !!process.env.STRIPE_WEBHOOK_SECRET);
  console.log(
    "- Secret prefix:",
    process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 7),
  );
  console.log("- Body length:", body.length);

  if (!sig) {
    return Response.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Webhook received:", event.type);

  // Handle setup intent success - save payment method
  if (event.type === "setup_intent.succeeded") {
    const setupIntent = event.data.object;
    const paymentMethodId = setupIntent.payment_method as string;
    const customerId = setupIntent.customer as string;

    try {
      // Find user by stripe customer ID
      const currentUser = await db.query.user.findFirst({
        where: eq(user.stripeCustomerId, customerId),
      });

      if (!currentUser) {
        console.error("User not found for customer:", customerId);
        return Response.json({ received: true });
      }

      // Get payment method details
      const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

      // Check if already exists
      const existing = await db.query.paymentMethod.findFirst({
        where: eq(paymentMethod.stripePaymentMethodId, paymentMethodId),
      });

      if (!existing) {
        // Unset other defaults
        await db
          .update(paymentMethod)
          .set({ isDefault: false })
          .where(eq(paymentMethod.userId, currentUser.id));

        if (!pm.card?.last4 || !pm.card?.brand) {
          throw new Error("Invalid payment method: missing card details");
        }

        // Save to DB
        await db.insert(paymentMethod).values({
          userId: currentUser.id,
          stripePaymentMethodId: paymentMethodId,
          last4: pm.card.last4,
          brand: pm.card.brand,
          isDefault: true,
        });

        console.log("Payment method saved:", paymentMethodId);

        // Create cardholder if doesn't exist
        if (!currentUser.stripeCardholderId) {
          const cardholder = await stripe.issuing.cardholders.create({
            name: currentUser.name || "User",
            email: currentUser.email,
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
              first_name: currentUser.name?.split(" ")[0] || "User",
              last_name: currentUser.name?.split(" ")[1] || "Name",
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
            .where(eq(user.id, currentUser.id));

          console.log("Cardholder created:", cardholder.id);
        }
      }
    } catch (error) {
      console.error("Error handling setup intent:", error);
    }

    return Response.json({ received: true });
  }

  if (event.type === "issuing_authorization.request") {
    const authorization = event.data.object;
    const amount =
      authorization.pending_request?.amount || authorization.amount;

    try {
      // 1. Find virtual card and user
      const card = await db.query.virtualCard.findFirst({
        where: eq(virtualCard.stripeCardId, authorization.card.id),
      });

      if (!card) {
        console.error("Virtual card not found");
        return Response.json(
          { approved: false },
          { status: 200, headers: { "Stripe-Version": "2024-06-20" } },
        );
      }

      // 2. Calculate markup: 5% + $0.50
      const userAmount = Math.round(amount * 1.05 + 50);

      // 3. Get user's default payment method
      const pm = await db.query.paymentMethod.findFirst({
        where: and(
          eq(paymentMethod.userId, card.userId),
          eq(paymentMethod.isDefault, true),
        ),
      });

      if (!pm) {
        console.error("No payment method found");
        return Response.json(
          { approved: false },
          { status: 200, headers: { "Stripe-Version": "2024-06-20" } },
        );
      }

      const currentUser = await db.query.user.findFirst({
        where: eq(user.id, card.userId),
      });

      // 4. Charge user's real card (JIT Funding)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: userAmount,
        currency: "usd",
        customer: currentUser?.stripeCustomerId || undefined,
        payment_method: pm.stripePaymentMethodId,
        confirm: true,
        off_session: true,
        description: `Purchase at ${authorization.merchant_data?.name || "merchant"}`,
        metadata: {
          authorizationId: authorization.id,
          virtualCardId: card.id,
          merchantAmount: amount.toString(),
        },
      });

      // Check if transaction already exists
      const existingTransaction = await db.query.transaction.findFirst({
        where: eq(transaction.stripeAuthorizationId, authorization.id),
      });

      if (existingTransaction) {
        console.log("Transaction already exists, skipping insert");
        return Response.json(
          { approved: existingTransaction.status === "approved" },
          { status: 200, headers: { "Stripe-Version": "2024-06-20" } },
        );
      }

      if (paymentIntent.status === "succeeded") {
        // 5. Log transaction
        await db.insert(transaction).values({
          virtualCardId: card.id,
          stripeAuthorizationId: authorization.id,
          merchantAmount: amount,
          userAmount: userAmount,
          profit: userAmount - amount,
          merchantName: authorization.merchant_data?.name,
          merchantCategory: authorization.merchant_data?.category,
          status: "approved",
          stripePaymentIntentId: paymentIntent.id,
        });

        console.log("JIT Funding successful");
        console.log(`Merchant: $${(amount / 100).toFixed(2)}`);
        console.log(`User charged: $${(userAmount / 100).toFixed(2)}`);
        console.log(`Profit: $${((userAmount - amount) / 100).toFixed(2)}`);

        return Response.json(
          { approved: true },
          {
            status: 200,
            headers: {
              "Stripe-Version": "2024-06-20",
              "Content-Type": "application/json",
            },
          },
        );
      } else {
        await db.insert(transaction).values({
          virtualCardId: card.id,
          stripeAuthorizationId: authorization.id,
          merchantAmount: amount,
          userAmount: userAmount,
          profit: 0,
          merchantName: authorization.merchant_data?.name,
          status: "declined",
        });

        return Response.json(
          { approved: false },
          { status: 200, headers: { "Stripe-Version": "2024-06-20" } },
        );
      }
    } catch (error) {
      console.error("JIT Funding error:", error);
      return Response.json(
        { approved: false },
        { status: 200, headers: { "Stripe-Version": "2024-06-20" } },
      );
    }
  }

  // Handle charge.failed - update transaction status
  if (event.type === "charge.failed") {
    const charge = event.data.object;
    const paymentIntentId = charge.payment_intent as string;

    if (paymentIntentId) {
      try {
        const existingTransaction = await db.query.transaction.findFirst({
          where: eq(transaction.stripePaymentIntentId, paymentIntentId),
        });

        if (existingTransaction && existingTransaction.status === "approved") {
          await db
            .update(transaction)
            .set({ status: "declined", profit: 0 })
            .where(eq(transaction.id, existingTransaction.id));

          console.log(
            `Transaction ${existingTransaction.id} updated to declined due to charge failure`,
          );
        }
      } catch (error) {
        console.error("Error handling charge.failed:", error);
      }
    }

    return Response.json({ received: true });
  }

  // Handle payment_intent.payment_failed - update transaction status
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;

    try {
      const existingTransaction = await db.query.transaction.findFirst({
        where: eq(transaction.stripePaymentIntentId, paymentIntent.id),
      });

      if (existingTransaction && existingTransaction.status === "approved") {
        await db
          .update(transaction)
          .set({ status: "declined", profit: 0 })
          .where(eq(transaction.id, existingTransaction.id));

        console.log(
          `Transaction ${existingTransaction.id} updated to declined due to payment intent failure`,
        );
      }
    } catch (error) {
      console.error("Error handling payment_intent.payment_failed:", error);
    }

    return Response.json({ received: true });
  }

  return Response.json({ received: true });
}
