"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { setupStripeCustomer } from "@/modules/shared/actions/user-actions";
import { Button } from "@/modules/shared/components/ui/button";

export function SetupCustomerButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSetup = () => {
    startTransition(async () => {
      try {
        await setupStripeCustomer();
        toast.success("Stripe customer created!");
        router.refresh();
      } catch (_error) {
        toast.error("Failed to setup customer");
      }
    });
  };

  return (
    <Button onClick={handleSetup} disabled={isPending}>
      {isPending ? "Setting up..." : "Setup Customer"}
    </Button>
  );
}
