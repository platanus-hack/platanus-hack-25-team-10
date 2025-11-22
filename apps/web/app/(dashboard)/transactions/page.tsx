import { getUserTransactions } from "@/actions/transaction-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";

export default async function TransactionsPage() {
  const transactions = await getUserTransactions();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Transactions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead className="text-right">Merchant Amount</TableHead>
                  <TableHead className="text-right">You Paid</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{tx.merchantName || "Unknown"}</TableCell>
                    <TableCell className="text-right">
                      ${(tx.merchantAmount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(tx.userAmount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      ${(tx.profit / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.status === "approved" ? "default" : "destructive"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

