"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/modules/shared/components/ui/button";
import { AddPaymentButton } from "./add-payment-button";
import { OnboardingCard } from "./onboarding-card";
import { SetupCustomerButton } from "./setup-customer-button";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  isDefault: boolean;
}

interface OnboardingContentProps {
  hasStripeCustomer: boolean;
  hasPaymentMethod: boolean;
  stripeCustomerId: string | null;
  userPaymentMethods: PaymentMethod[];
}

export function OnboardingContent({
  hasStripeCustomer,
  hasPaymentMethod,
  stripeCustomerId,
  userPaymentMethods,
}: OnboardingContentProps) {
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const prevStep1Ref = useRef(hasStripeCustomer);

  // Auto-scroll to next incomplete step
  useEffect(() => {
    if (hasStripeCustomer && !prevStep1Ref.current) {
      // Step 1 was just completed - scroll to step 2 if incomplete
      setTimeout(() => {
        if (!hasPaymentMethod) {
          step2Ref.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 500);
    }
    prevStep1Ref.current = hasStripeCustomer;
  }, [hasStripeCustomer, hasPaymentMethod]);

  return (
    <div className="space-y-8">
      <div ref={step1Ref}>
        <OnboardingCard
          stepNumber={1}
          title="Step 1: Setup Stripe Customer"
          description="Create your customer account in Stripe"
          isCompleted={hasStripeCustomer}
        >
          {hasStripeCustomer ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">✓ Completed</p>
              <p className="text-xs text-muted-foreground">
                Customer ID: {stripeCustomerId}
              </p>
            </div>
          ) : (
            <SetupCustomerButton />
          )}
        </OnboardingCard>
      </div>

      <div ref={step2Ref}>
        <OnboardingCard
          stepNumber={2}
          title="Step 2: Link Your Real Card"
          description="Add a payment method to fund your virtual card purchases"
          isCompleted={hasPaymentMethod}
        >
          {hasPaymentMethod ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">✓ Completed</p>
              {userPaymentMethods.map((pm) => (
                <p key={pm.id} className="text-xs text-muted-foreground">
                  {pm.brand} •••• {pm.last4} {pm.isDefault && "(Default)"}
                </p>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Securely add your payment method to fund your virtual card
                purchases. You'll be redirected to a secure checkout page where
                you can safely enter your card details.
              </p>
              {hasStripeCustomer ? (
                <AddPaymentButton />
              ) : (
                <Button disabled>Complete Step 1 First</Button>
              )}
            </div>
          )}
        </OnboardingCard>
      </div>
    </div>
  );
}
