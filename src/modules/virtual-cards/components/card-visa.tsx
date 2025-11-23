"use client";

import { useState } from "react";
import { getCardDetails } from "@/modules/shared/actions/card-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/modules/shared/components/ui/tooltip";

interface CardVisaProps {
  stripeCardId: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

export function CardVisa({
  stripeCardId,
  last4,
  expiryMonth,
  expiryYear,
}: CardVisaProps) {
  const [cardDetails, setCardDetails] = useState<{
    number: string | undefined;
    cvc: string | undefined;
  } | null>(null);
  const [copied, setCopied] = useState({
    number: false,
    expiry: false,
    cvv: false,
  });
  const [tooltipOpen, setTooltipOpen] = useState({
    number: false,
    expiry: false,
    cvv: false,
  });

  // Format expiry to show last 2 digits of year
  const expiryFormatted = `${expiryMonth.toString().padStart(2, "0")}/${expiryYear.toString().slice(-2)}`;

  const handleCopyNumber = async () => {
    try {
      let details = cardDetails;
      if (!details) {
        const fetchedDetails = await getCardDetails(stripeCardId);
        details = {
          number: fetchedDetails.number,
          cvc: fetchedDetails.cvc,
        };
        setCardDetails(details);
      }

      if (!details.number || details.number.length < 13) {
        throw new Error(
          "Could not get real card numbers from Stripe. The full numbers are only available for a limited time after creating the card.",
        );
      }

      await navigator.clipboard.writeText(details.number);
      setCopied((prev) => ({ ...prev, number: true }));
      setTooltipOpen((prev) => ({ ...prev, number: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, number: false }));
        setTooltipOpen((prev) => ({ ...prev, number: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy card number:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error copying card number";
      alert(errorMessage);
    }
  };

  const handleCopyExpiry = async () => {
    try {
      await navigator.clipboard.writeText(expiryFormatted);
      setCopied((prev) => ({ ...prev, expiry: true }));
      setTooltipOpen((prev) => ({ ...prev, expiry: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, expiry: false }));
        setTooltipOpen((prev) => ({ ...prev, expiry: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy expiry date:", err);
      alert("Error copying expiry date");
    }
  };

  const handleCopyCVV = async () => {
    try {
      let details = cardDetails;
      if (!details) {
        const fetchedDetails = await getCardDetails(stripeCardId);
        details = {
          number: fetchedDetails.number,
          cvc: fetchedDetails.cvc,
        };
        setCardDetails(details);
      }

      if (!details.cvc || details.cvc.length < 3) {
        throw new Error(
          "Could not get real CVC from Stripe. The CVC is only available for a limited time after creating the card.",
        );
      }

      await navigator.clipboard.writeText(details.cvc);
      setCopied((prev) => ({ ...prev, cvv: true }));
      setTooltipOpen((prev) => ({ ...prev, cvv: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, cvv: false }));
        setTooltipOpen((prev) => ({ ...prev, cvv: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy CVV:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error copying CVV";
      alert(errorMessage);
    }
  };

  return (
    <div className="w-[320px] h-[200px] bg-linear-to-br from-slate-800 to-slate-900 rounded-xl p-8 mb-6 relative overflow-hidden flex flex-col justify-between">
      {/* Spacer */}
      <div className="h-14 w-14" />

      {/* Card Number */}
      <TooltipProvider delayDuration={0}>
        <Tooltip
          open={tooltipOpen.number}
          onOpenChange={(open) =>
            !copied.number &&
            setTooltipOpen((prev) => ({ ...prev, number: open }))
          }
        >
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="text-white text-xl tracking-widest cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0 text-left w-fit"
            >
              •••• •••• •••• {last4}
            </button>
          </TooltipTrigger>
          <TooltipContent className="px-2 py-1 text-xs">
            {copied.number ? "Copied!" : "Copy card number"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Exp and CVC */}
      <div className="flex gap-8 text-white/70 text-sm">
        <TooltipProvider delayDuration={0}>
          <Tooltip
            open={tooltipOpen.expiry}
            onOpenChange={(open) =>
              !copied.expiry &&
              setTooltipOpen((prev) => ({ ...prev, expiry: open }))
            }
          >
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopyExpiry}
                className="cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0 text-left"
              >
                <div className="text-xs mb-1">Exp</div>
                <div className="tracking-wider">{expiryFormatted}</div>
              </button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs">
              {copied.expiry ? "Copied!" : "Copy expiry date"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip
            open={tooltipOpen.cvv}
            onOpenChange={(open) =>
              !copied.cvv && setTooltipOpen((prev) => ({ ...prev, cvv: open }))
            }
          >
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopyCVV}
                className="cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0 text-left"
              >
                <div className="text-xs mb-1">CVC</div>
                <div className="tracking-wider">•••</div>
              </button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs">
              {copied.cvv ? "Copied!" : "Copy CVV"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Brand Logo */}
      <div className="absolute bottom-8 right-8">
        <svg
          className="h-8 text-white"
          viewBox="0 0 36 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Visa</title>
          <path d="M18.5 2L15.8 14H12.9L15.6 2H18.5Z" fill="currentColor" />
          <path
            d="M27.9 2.3C27.3 2.1 26.3 1.9 25.1 1.9C22.2 1.9 20.2 3.4 20.2 5.5C20.2 7.1 21.6 7.9 22.7 8.4C23.8 8.9 24.2 9.2 24.2 9.7C24.2 10.4 23.3 10.7 22.5 10.7C21.4 10.7 20.8 10.5 19.9 10.1L19.6 10L19.2 12.1C19.9 12.4 21.2 12.7 22.6 12.7C25.7 12.7 27.6 11.2 27.6 9C27.6 7.8 26.8 6.9 25.1 6.2C24.1 5.7 23.5 5.4 23.5 4.9C23.5 4.4 24.1 3.9 25.3 3.9C26.2 3.9 26.9 4.1 27.5 4.3L27.8 4.4L28.2 2.4L27.9 2.3Z"
            fill="currentColor"
          />
          <path
            d="M32.8 2H30.5C29.8 2 29.3 2.2 29 2.8L24.8 14H27.9L28.5 12.3H32.3L32.7 14H35.4L32.8 2ZM29.4 10.1L30.7 6.4L31.5 10.1H29.4Z"
            fill="currentColor"
          />
          <path
            d="M11.7 2L8.9 10.5L8.6 8.9C8.1 7.2 6.5 5.3 4.7 4.3L7.3 13.9H10.4L15.1 2H11.7Z"
            fill="currentColor"
          />
          <path
            d="M6.2 2H1.1L1 2.2C4.7 3.1 7.3 5.3 8.4 8.1L7.3 2.8C7.1 2.2 6.7 2 6.2 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
