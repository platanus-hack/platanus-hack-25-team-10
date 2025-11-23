"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { createSetupSession } from "@/modules/cards/actions/payment-method-actions";
import { Button } from "@/modules/shared/components/ui/button";

export function UpdatePaymentButton() {
  const [isPending, startTransition] = useTransition();

  const handleUpdatePayment = () => {
    startTransition(async () => {
      try {
        const { url } = await createSetupSession();
        if (url) {
          window.location.href = url;
        }
      } catch (_error) {
        toast.error("Failed to create setup session");
      }
    });
  };

  return (
    <Button
      onClick={handleUpdatePayment}
      disabled={isPending}
      variant="outline"
    >
      {isPending ? "Redirecting..." : "Update"}
    </Button>
  );
}
