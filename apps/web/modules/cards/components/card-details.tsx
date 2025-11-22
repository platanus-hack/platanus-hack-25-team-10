"use client";

import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { StripeIssuingCard } from "../lib/mock-card-data";
import { formatCurrency } from "./card-overview";

function getBrandIcon(brand: string) {
  switch (brand) {
    case "visa":
      return "VISA";
    case "mastercard":
      return "MC";
    case "amex":
      return "AMEX";
    default:
      return "CARD";
  }
}

interface CardDetailsProps {
  cardData: StripeIssuingCard;
}

export function CardDetails({ cardData }: CardDetailsProps) {
  const spendingPercentage =
    (cardData.currentSpending / cardData.spendingLimit) * 100;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const cardNumber = cardData.pan || `000000000000${cardData.last4}`;
    const expiryDate = `${String(cardData.expiryMonth).padStart(2, "0")}/${String(cardData.expiryYear).slice(-2)}`;
    const cvv = cardData.cvv || "123";
    const cardDetails = `Card Number: ${cardNumber}\nExpiry: ${expiryDate}\nCVV: ${cvv}`;

    try {
      await navigator.clipboard.writeText(cardDetails);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card className="overflow-hidden p-4">
      <div className="border p-4">
        <div className="mb-10 py-4">
          <p className="text-lg font-mono tracking-wider">
            •••• •••• •••• {cardData.last4}
          </p>
        </div>

        <div className="flex items-end justify-between mt-6">
          <div className="space-y-1">
            <p className="text-xs font-medium opacity-80">Cardholder</p>
            <p className="text-sm font-semibold">{cardData.cardholder}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium opacity-80">Expires</p>
            <p className="text-sm font-semibold">
              {String(cardData.expiryMonth).padStart(2, "0")}/
              {String(cardData.expiryYear).slice(-2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium opacity-80">Brand</p>
            <p className="text-sm font-semibold">
              {getBrandIcon(cardData.brand)}
            </p>
          </div>
        </div>
      </div>

      {/* Spending Progress Bar */}
      <div className="space-y-2 border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(cardData.currentSpending, cardData.currency)}/
            {formatCurrency(cardData.spendingLimit, cardData.currency)}
          </span>
          <span className="text-muted-foreground">50%</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${spendingPercentage}%` }}
          />
        </div>
      </div>

      {/* Copy button */}
      <Button
        type="button"
        onClick={handleCopy}
        className="relative flex w-full items-center justify-center gap-2 p-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Icon container */}
        <div className="relative flex size-4 items-center justify-center">
          {/* Copy icon */}
          <div
            className={cn(
              "absolute transition-all",
              copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
            )}
          >
            <Copy className="size-4" />
          </div>
          {/* Check icon */}
          <div
            className={cn(
              "absolute transition-all",
              copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
            )}
          >
            <Check className="size-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        {/* Text */}
        <span className="relative inline-block min-w-[140px] text-center">
          <span
            className={cn(
              "block transition-all",
              copied
                ? "scale-0 opacity-0 absolute inset-0"
                : "scale-100 opacity-100",
            )}
          >
            Copy to clipboard
          </span>
          <span
            className={cn(
              "block transition-all",
              copied
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0 absolute inset-0",
            )}
          >
            Copied
          </span>
        </span>
      </Button>
    </Card>
  );
}

