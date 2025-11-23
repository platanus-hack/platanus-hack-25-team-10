import type { Metadata } from "next";
import { listVirtualCards } from "@/modules/shared/actions/card-actions";
import { getUserTransactions } from "@/modules/shared/actions/transaction-actions";
import { AdminContainer } from "@/modules/shared/components/admin-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { TransactionsContent } from "@/modules/transactions/components/transactions-content";

export const metadata: Metadata = {
  title: "Transactions",
  description: "View all your transactions made with virtual cards.",
  robots: {
    index: false,
    follow: false,
  },
};

interface TransactionsPageProps {
  searchParams: Promise<{ cardId?: string }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const cardId =
    params.cardId && params.cardId !== "all" ? params.cardId : undefined;

  const [transactions, cards] = await Promise.all([
    getUserTransactions(100, cardId),
    listVirtualCards(),
  ]);

  return (
    <AdminContainer
      breadcrumbItems={[{ href: "/transactions", label: "Transactions" }]}
      className="space-y-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All your transactions made with virtual cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsContent transactions={transactions} cards={cards} />
        </CardContent>
      </Card>
    </AdminContainer>
  );
}
