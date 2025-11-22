"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "../lib/mock-card-data";
import { formatCurrency } from "./card-overview";

function formatDate(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${month} ${day}, ${year} at ${displayHours}:${displayMinutes} ${ampm}`;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency?: string;
  limit?: number;
}

export function RecentTransactions({
  transactions,
  currency = "USD",
  limit = 5,
}: RecentTransactionsProps) {
  const displayedTransactions = transactions.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest card activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedTransactions.map((transaction: Transaction, index: number) => {
            const isRefund = transaction.type === "refund";
            const isLast = index === displayedTransactions.length - 1;

            return (
              <div key={transaction.id}>
                <div className="flex items-center gap-4">
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <div className="flex-1 space-y-0.5">
                      <p className="font-medium">{transaction.merchant}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                        {transaction.category && ` • ${transaction.category}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isRefund ? (
                        <ArrowDownLeft className="size-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpRight className="size-4 text-muted-foreground" />
                      )}
                      <p
                        className={cn(
                          "font-semibold tabular-nums",
                          isRefund
                            ? "text-green-600 dark:text-green-400"
                            : "text-foreground",
                        )}
                      >
                        {isRefund ? "+" : "-"}
                        {formatCurrency(transaction.amount, currency)}
                      </p>
                    </div>
                  </div>
                </div>
                {!isLast && <Separator className="mt-4" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

