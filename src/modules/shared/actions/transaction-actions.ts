"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { transaction, virtualCard } from "@/db/schema";
import { auth } from "@/modules/shared/lib/auth";

export async function getUserTransactions(limit = 50, cardId?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const userCards = await db.query.virtualCard.findMany({
    where: eq(virtualCard.userId, session.user.id),
  });

  const cardIds = userCards.map((c) => c.id);

  if (cardIds.length === 0) return [];

  const conditions = [
    inArray(transaction.virtualCardId, cardIds),
    eq(transaction.status, "approved"),
  ];

  // Add card filter if specified
  if (cardId) {
    conditions.push(eq(transaction.virtualCardId, cardId));
  }

  const transactions = await db.query.transaction.findMany({
    where: and(...conditions),
    orderBy: [desc(transaction.createdAt)],
    limit,
    with: {
      virtualCard: true,
    },
  });

  return transactions;
}

export async function getTotalSpent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const userCards = await db.query.virtualCard.findMany({
    where: eq(virtualCard.userId, session.user.id),
  });

  const cardIds = userCards.map((c) => c.id);

  if (cardIds.length === 0) {
    return 0;
  }

  const allTransactions = await db.query.transaction.findMany({
    where: and(
      inArray(transaction.virtualCardId, cardIds),
      eq(transaction.status, "approved"),
    ),
  });

  const totalSpent = allTransactions.reduce(
    (sum, t) => sum + t.merchantAmount,
    0,
  );
  return totalSpent;
}
