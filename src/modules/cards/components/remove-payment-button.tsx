"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { removePaymentMethod } from "@/modules/cards/actions/payment-method-actions";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/shared/components/ui/dialog";

interface RemovePaymentButtonProps {
  paymentMethodId: string;
  last4: string;
  brand: string;
}

export function RemovePaymentButton({
  paymentMethodId,
  last4,
  brand,
}: RemovePaymentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    startTransition(async () => {
      try {
        await removePaymentMethod(paymentMethodId);
        toast.success("Payment method removed successfully");
        setIsOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error removing payment method:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to remove payment method",
        );
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Remove</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Payment Method</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this payment method?
            <br />
            <br />
            <strong>
              {brand.toUpperCase()} •••• {last4}
            </strong>
            <br />
            <br />
            This action cannot be undone. The payment method will be removed
            from your account and{" "}
            <strong>all your virtual cards will be permanently canceled</strong>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleRemove();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
