"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import type { Transaction, VirtualCard } from "@/db/schema";
import { Badge } from "@/modules/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";

interface TransactionsTableProps {
  transactions: (Transaction & { virtualCard: VirtualCard })[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted p-4 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-1">No transactions</h3>
        <p className="text-sm text-muted-foreground">
          Transactions will appear here when you make purchases with your
          virtual cards.
        </p>
      </div>
    );
  }

  return (
    <div className="border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead>Card</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Fee</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const commission = tx.userAmount - tx.merchantAmount;

            return (
              <TableRow key={tx.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {format(new Date(tx.createdAt), "dd MMM yyyy", {
                    locale: enUS,
                  })}
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(tx.createdAt), "HH:mm")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {tx.merchantName || "Unknown merchant"}
                    </span>
                    {tx.merchantCategory && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {tx.merchantCategory.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {tx.virtualCard.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ••••{tx.virtualCard.last4}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${(tx.userAmount / 100).toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  -${(commission / 100).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tx.status === "approved" ? "default" : "destructive"
                    }
                    className="capitalize"
                  >
                    {tx.status === "approved" ? "Approved" : tx.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
