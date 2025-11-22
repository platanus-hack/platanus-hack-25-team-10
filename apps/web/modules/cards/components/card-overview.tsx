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
import {
  generateMockCardData,
  type StripeIssuingCard,
  type Transaction,
} from "../lib/mock-card-data";
import { CardDetails } from "./card-details";

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Math.abs(amount));
}

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


export default function CardOverview() {
  const cardData: StripeIssuingCard = generateMockCardData();

  return (
    <div className="space-y-6 border-none">
      {/* Main Card Container */}
      <CardDetails cardData={cardData} />


      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest card activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cardData.transactions.slice(0, 5).map((transaction: Transaction, index: number) => {
              const isRefund = transaction.type === "refund";
              const isLast =
                index === cardData.transactions.slice(0, 5).length - 1;

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
                          {formatCurrency(
                            transaction.amount,
                            cardData.currency,
                          )}
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
    </div>
  );
}
