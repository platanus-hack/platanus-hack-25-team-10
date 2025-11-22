"use client";

import { useTransition } from "react";
import { createSetupSession } from "@/actions/payment-actions";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";

export function AddPaymentButton() {
  const [isPending, startTransition] = useTransition();

  const handleAddPayment = () => {
    startTransition(async () => {
      try {
        const { url } = await createSetupSession();
        if (url) {
          window.location.href = url;
        }
      } catch (error) {
        toast.error("Failed to create setup session");
      }
    });
  };

  return (
    <Button onClick={handleAddPayment} disabled={isPending}>
      {isPending ? "Redirecting..." : "Add Payment Method"}
    </Button>
  );
}

