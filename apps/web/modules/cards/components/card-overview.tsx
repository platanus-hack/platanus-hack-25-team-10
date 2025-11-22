"use client";

import { Plus } from "lucide-react";
import {
  generateMockCardData,
  type StripeIssuingCard,
} from "../lib/mock-card-data";
import { CardDetails } from "./card-details";
import { RecentTransactions } from "./recent-transactions";
import { Button } from "@repo/ui/components/button";

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Math.abs(amount));
}

export default function CardOverview() {
  const cardData: StripeIssuingCard = generateMockCardData();

  return (
    <div className="space-y-6 border-none">
      <div className="space-y-2 flex flex-row justify-between items-center">
        <div>
        <h1 className="text-3xl font-bold">Cards Overview</h1>
        <p className="text-muted-foreground">
          Manage your virtual cards and spending
        </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Add Card
        </Button>
      </div>
      {/* Main Card Container */}
      <CardDetails cardData={cardData} />

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={cardData.transactions}
        currency={cardData.currency}
      />
    </div>
  );
}
