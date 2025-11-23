import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { paymentMethod, user } from "@/db/schema";
import { OnboardingContent } from "@/modules/onboarding/onboarding-content";
import { AdminContainer } from "@/modules/shared/components/admin-container";
import { auth } from "@/modules/shared/lib/auth";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser) {
    redirect("/sign-in");
  }

  const userPaymentMethods = await db.query.paymentMethod.findMany({
    where: eq(paymentMethod.userId, session.user.id),
  });

  const hasStripeCustomer = !!currentUser.stripeCustomerId;
  const hasPaymentMethod = userPaymentMethods.length > 0;

  return (
    <AdminContainer
      breadcrumbItems={[{ href: "/onboarding", label: "Onboarding" }]}
      className="space-y-8"
    >
      <OnboardingContent
        hasStripeCustomer={hasStripeCustomer}
        hasPaymentMethod={hasPaymentMethod}
        stripeCustomerId={currentUser.stripeCustomerId}
        userPaymentMethods={userPaymentMethods.map((pm) => ({
          id: pm.id,
          brand: pm.brand,
          last4: pm.last4,
          isDefault: pm.isDefault,
        }))}
      />
    </AdminContainer>
  );
}
