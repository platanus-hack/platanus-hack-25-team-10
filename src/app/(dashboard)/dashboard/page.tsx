import type { Metadata } from "next";
import SimpleCardView from "@/modules/dashboard/components/simple-card-view";
import {
  getTotalSpent,
  getUserTransactions,
} from "@/modules/shared/actions/transaction-actions";
import { AdminContainer } from "@/modules/shared/components/admin-container";
import { Card, CardContent } from "@/modules/shared/components/ui/card";
import { RecentTransactions } from "@/modules/transactions/recent-transactions";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your spending overview, virtual cards, and recent transactions.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const [totalSpent, recentTransactions] = await Promise.all([
    getTotalSpent(),
    getUserTransactions(5),
  ]);

  return (
    <AdminContainer
      breadcrumbItems={[{ href: "/dashboard", label: "Dashboard" }]}
      className="space-y-8"
    >
      <Card>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">This Month's Spending</p>
          <div className="text-5xl ">${(totalSpent / 100).toFixed(2)}</div>
          <span className="ml- text-xs text-muted-foreground">
            {new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </CardContent>
      </Card>
      <SimpleCardView />
      <RecentTransactions transactions={recentTransactions} />
    </AdminContainer>
  );
}
