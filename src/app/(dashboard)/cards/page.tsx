import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserPaymentMethod } from "@/modules/cards/actions/payment-method-actions";
import { AddPaymentButton } from "@/modules/cards/components/add-payment-button";
import { RemovePaymentButton } from "@/modules/cards/components/remove-payment-button";
import { UpdatePaymentButton } from "@/modules/cards/components/update-payment-button";
import { AdminContainer } from "@/modules/shared/components/admin-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { auth } from "@/modules/shared/lib/auth";

export default async function PersonalCardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const paymentMethod = await getUserPaymentMethod();

  if (!paymentMethod) {
    return (
      <AdminContainer
        breadcrumbItems={[{ href: "/cards", label: "Cards" }]}
        className="space-y-8"
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Personal Card</h1>
            <p className="text-muted-foreground mt-2">
              Link your payment method to fund virtual cards
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Link Your Payment Method</CardTitle>
              <CardDescription>
                Add a payment method to fund your virtual card purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AddPaymentButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer
      breadcrumbItems={[{ href: "/cards", label: "Cards" }]}
      className="space-y-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            This card is used to fund your virtual card purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border ">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold uppercase">
                  {paymentMethod.brand}
                </div>
                <div>
                  <p className="font-medium">
                    •••• •••• •••• {paymentMethod.last4}
                  </p>
                  {paymentMethod.isDefault && (
                    <p className="text-xs text-muted-foreground">
                      Default payment method
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <UpdatePaymentButton />
                <RemovePaymentButton
                  paymentMethodId={paymentMethod.id}
                  last4={paymentMethod.last4}
                  brand={paymentMethod.brand}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminContainer>
  );
}
