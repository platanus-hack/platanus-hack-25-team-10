"use client";

import { Suspense } from "react";
import type { Transaction, VirtualCard } from "@/db/schema";
import { TransactionFilters } from "./transaction-filters";
import { TransactionsTable } from "./transactions-table";

interface TransactionsContentProps {
  transactions: (Transaction & { virtualCard: VirtualCard })[];
  cards: VirtualCard[];
}

function TransactionsContentInner({
  transactions,
  cards,
}: TransactionsContentProps) {
  return (
    <div className="space-y-6">
      {cards.length > 0 && (
        <div className="flex items-center justify-between">
          <TransactionFilters cards={cards} />
          <div className="text-sm text-muted-foreground">
            {transactions.length} transacción
            {transactions.length !== 1 ? "es" : ""}
          </div>
        </div>
      )}
      <TransactionsTable transactions={transactions} />
    </div>
  );
}

export function TransactionsContent(props: TransactionsContentProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <TransactionsContentInner {...props} />
    </Suspense>
  );
}
