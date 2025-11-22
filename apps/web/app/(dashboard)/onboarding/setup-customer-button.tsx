"use client";

import { useTransition } from "react";
import { setupStripeCustomer } from "@/actions/user-actions";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SetupCustomerButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSetup = () => {
    startTransition(async () => {
      try {
        await setupStripeCustomer();
        toast.success("Stripe customer created!");
        router.refresh();
      } catch (error) {
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

