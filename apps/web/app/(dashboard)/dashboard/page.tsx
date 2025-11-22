import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { listVirtualCards } from "@/actions/card-actions";
import { getTransactionStats } from "@/actions/transaction-actions";

export default async function DashboardPage() {
  const stats = await getTransactionStats();
  const cards = await listVirtualCards();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your virtual cards and spending
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalProfit / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactionCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cards.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalSpent / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
