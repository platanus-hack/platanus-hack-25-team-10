import { auth } from "@/lib/auth";
import { db } from "@repo/database/connection";
import { user, paymentMethod } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { SetupCustomerButton } from "./setup-customer-button";
import { AddPaymentButton } from "./add-payment-button";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser) {
    redirect("/login");
  }

  const userPaymentMethods = await db.query.paymentMethod.findMany({
    where: eq(paymentMethod.userId, session.user.id),
  });

  const hasStripeCustomer = !!currentUser.stripeCustomerId;
  const hasCardholder = !!currentUser.stripeCardholderId;
  const hasPaymentMethod = userPaymentMethods.length > 0;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Onboarding</h1>
        <p className="text-muted-foreground mt-2">
          Complete these steps to start using virtual cards
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Setup Stripe Customer</CardTitle>
          <CardDescription>
            Create your customer account in Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasStripeCustomer ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">✓ Completed</p>
              <p className="text-xs text-muted-foreground">Customer ID: {currentUser.stripeCustomerId}</p>
            </div>
          ) : (
            <SetupCustomerButton />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: Link Your Real Card</CardTitle>
          <CardDescription>
            Add a payment method to fund your virtual card purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                Click below to add a payment method via Stripe Checkout. You'll be redirected to a secure form.
              </p>
              <p className="text-sm font-mono bg-muted p-4 rounded">
                Test Card: 4242 4242 4242 4242
                <br />
                Expiry: Any future date
                <br />
                CVC: Any 3 digits
              </p>
              {hasStripeCustomer ? (
                <AddPaymentButton />
              ) : (
                <Button disabled>Complete Step 1 First</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 3: Create Virtual Cards</CardTitle>
          <CardDescription>
            Once setup is complete, you can create virtual cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled={!hasPaymentMethod || !hasCardholder} asChild={hasPaymentMethod && hasCardholder}>
            {hasPaymentMethod && hasCardholder ? (
              <Link href="/cards">Go to Cards</Link>
            ) : (
              <span>Complete Steps 1 & 2 First</span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

