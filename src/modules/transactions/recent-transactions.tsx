import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Transaction } from "@/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { Separator } from "@/modules/shared/components/ui/separator";

function formatDate(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${month} ${day}, ${year} at ${displayHours}:${displayMinutes} ${ampm}`;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest card activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            No transactions yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest card activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => {
            const isLast = index === transactions.length - 1;

            return (
              <div key={transaction.id}>
                <div className="flex items-center gap-4">
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <div className="flex-1 space-y-0.5">
                      <p className="font-medium">
                        {transaction.merchantName || "Unknown Merchant"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date(transaction.createdAt))}
                        {transaction.merchantCategory &&
                          ` • ${transaction.merchantCategory}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowUpRightIcon
                        weight="duotone"
                        className="size-4 text-primary"
                      />
                      <p className="font-semibold tabular-nums text-foreground">
                        ${(transaction.merchantAmount / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                {!isLast && <Separator className="mt-4" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
