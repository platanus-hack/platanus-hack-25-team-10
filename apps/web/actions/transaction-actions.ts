"use server";

import { auth } from "@/lib/auth";
import { db } from "@repo/database/connection";
import { virtualCard, transaction } from "@repo/database/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { headers } from "next/headers";

export async function getUserTransactions(limit = 50) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const userCards = await db.query.virtualCard.findMany({
    where: eq(virtualCard.userId, session.user.id),
  });

  const cardIds = userCards.map((c) => c.id);

  if (cardIds.length === 0) return [];

  return await db.query.transaction.findMany({
    where: inArray(transaction.virtualCardId, cardIds),
    orderBy: [desc(transaction.createdAt)],
    limit,
  });
}

export async function getTransactionStats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const userCards = await db.query.virtualCard.findMany({
    where: eq(virtualCard.userId, session.user.id),
  });

  const cardIds = userCards.map((c) => c.id);

  if (cardIds.length === 0) {
    return { totalProfit: 0, totalSpent: 0, transactionCount: 0, approvedCount: 0 };
  }

  const allTransactions = await db.query.transaction.findMany({
    where: inArray(transaction.virtualCardId, cardIds),
  });

  const totalProfit = allTransactions.reduce((sum, t) => sum + t.profit, 0);
  const totalSpent = allTransactions.reduce((sum, t) => sum + t.merchantAmount, 0);
  const approvedCount = allTransactions.filter((t) => t.status === "approved").length;

  return {
    totalProfit,
    totalSpent,
    transactionCount: allTransactions.length,
    approvedCount,
  };
}

