"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/modules/shared/lib/auth";
import { stripe } from "@/modules/shared/lib/stripe";

export async function setupStripeCustomer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser) throw new Error("User not found");

  if (currentUser.stripeCustomerId) {
    return { customerId: currentUser.stripeCustomerId };
  }

  const customer = await stripe.customers.create({
    email: session.user.email,
    name: session.user.name,
    metadata: { userId: session.user.id },
  });

  await db
    .update(user)
    .set({ stripeCustomerId: customer.id })
    .where(eq(user.id, session.user.id));

  return { customerId: customer.id };
}
