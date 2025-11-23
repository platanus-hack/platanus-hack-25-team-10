"use client";

import { AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createVirtualCard } from "@/modules/shared/actions/card-actions";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/modules/shared/components/ui/alert";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/shared/components/ui/dialog";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import { Slider } from "@/modules/shared/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/shared/components/ui/tabs";

export function AddCardButton() {
  const [open, setOpen] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardType, setCardType] = useState<"single_use" | "permanent">(
    "permanent",
  );
  const [spendingLimit, setSpendingLimit] = useState(500);
  const [expirationDate, setExpirationDate] = useState("");
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreateCard = async () => {
    if (!cardName.trim()) {
      toast.error("Please enter a card name");
      return;
    }

    startTransition(async () => {
      setOnboardingRequired(false);
      try {
        await createVirtualCard(cardName, cardType, spendingLimit);
        toast.success("Virtual card created successfully!");
        setCardName("");
        setCardType("permanent");
        setSpendingLimit(500);
        setExpirationDate("");
        setOpen(false);
        router.refresh();
      } catch (error) {
        if (error instanceof Error && error.message === "ONBOARDING_REQUIRED") {
          setOnboardingRequired(true);
          toast.error("Please complete onboarding first");
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create card";
          toast.error(errorMessage);
        }
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset state when opening dialog
      setOnboardingRequired(false);
      setCardName("");
      setCardType("permanent");
      setSpendingLimit(500);
      setExpirationDate("");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove currency symbols and formatting, keep only numbers
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (rawValue === "") {
      setSpendingLimit(0);
      return;
    }
    const numValue = parseInt(rawValue, 10);
    if (!Number.isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, 0), 1000);
      setSpendingLimit(clampedValue);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Virtual Card</DialogTitle>
          <DialogDescription>
            Create a new virtual card for secure online purchases
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {onboardingRequired && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Onboarding Required</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  You need to complete the onboarding process before creating
                  virtual cards. This includes setting up your Stripe customer
                  account and adding a payment method.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/onboarding" onClick={() => setOpen(false)}>
                    Go to Onboarding
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Card Name</Label>
            <Input
              id="name"
              placeholder="e.g., Shopping Card, Holiday Buys, etc."
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isPending) {
                  handleCreateCard();
                }
              }}
              disabled={onboardingRequired || isPending}
            />
          </div>
          <Tabs
            value={cardType}
            onValueChange={(value) =>
              setCardType(value as "single_use" | "permanent")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single_use">One-time</TabsTrigger>
              <TabsTrigger value="permanent">Permanent</TabsTrigger>
            </TabsList>
            <TabsContent value="single_use" className="mt-2">
              <p className="text-xs text-muted-foreground">
                Dies after first use. Perfect for one-time purchases or
                subscriptions you want to cancel easily.
              </p>
            </TabsContent>
            <TabsContent value="permanent" className="mt-2">
              <p className="text-xs text-muted-foreground">
                Reusable until expiration. Ideal for regular purchases and
                ongoing subscriptions.
              </p>
            </TabsContent>
          </Tabs>
          <div className="space-y-2">
            <Label htmlFor="spending-limit">Monthly Spending Limit</Label>
            <div className="flex items-center gap-4">
              <Input
                id="spending-limit"
                type="text"
                value={formatCurrency(spendingLimit)}
                onChange={handleInputChange}
                className="w-32"
                disabled={onboardingRequired || isPending}
              />
              <div className="flex-1">
                <Slider
                  value={[spendingLimit]}
                  onValueChange={(values) => setSpendingLimit(values[0] ?? 500)}
                  min={0}
                  max={1000}
                  step={10}
                  disabled={onboardingRequired || isPending}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Set a monthly spending limit for this card ($
              {spendingLimit.toLocaleString()})
            </p>
          </div>

          {cardType === "permanent" && (
            <div className="space-y-2">
              <Label htmlFor="expiration-date">Expiration Date</Label>
              <Input
                id="expiration-date"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                disabled={onboardingRequired || isPending}
              />
              <p className="text-xs text-muted-foreground">
                Set when this card should expire (optional)
              </p>
            </div>
          )}

          <Button
            onClick={handleCreateCard}
            disabled={isPending || onboardingRequired}
            className="w-full"
          >
            {isPending ? "Creating..." : "Create Card"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
