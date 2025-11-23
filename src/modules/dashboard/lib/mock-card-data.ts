export interface StripeIssuingCard {
  id: string;
  last4: string;
  cardholder: string;
  expiryMonth: number;
  expiryYear: number;
  brand: "visa" | "mastercard" | "amex";
  currentSpending: number;
  spendingLimit: number;
  currency: string;
  pan?: string;
  cvv?: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  merchant: string;
  date: Date;
  amount: number;
  type: "charge" | "refund";
  category?: string;
}

export function generateMockCardData(): StripeIssuingCard {
  const now = new Date();
  const transactions: Transaction[] = [
    {
      id: "txn_1",
      merchant: "Amazon",
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      amount: 45.99,
      type: "charge",
      category: "Shopping",
    },
    {
      id: "txn_2",
      merchant: "Starbucks",
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      amount: 5.75,
      type: "charge",
      category: "Food & Drink",
    },
    {
      id: "txn_3",
      merchant: "Uber",
      date: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      amount: 23.5,
      type: "charge",
      category: "Transportation",
    },
    {
      id: "txn_4",
      merchant: "Amazon Refund",
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      amount: 29.99,
      type: "refund",
      category: "Shopping",
    },
    {
      id: "txn_5",
      merchant: "Netflix",
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      amount: 15.99,
      type: "charge",
      category: "Entertainment",
    },
    {
      id: "txn_6",
      merchant: "Whole Foods",
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      amount: 87.23,
      type: "charge",
      category: "Groceries",
    },
  ];

  return {
    id: "card_1234567890",
    last4: "4242",
    cardholder: "John Doe",
    expiryMonth: 12,
    expiryYear: 2025,
    brand: "visa",
    currentSpending: 5000.0,
    spendingLimit: 10000.0,
    currency: "USD",
    pan: "4242424242424242",
    cvv: "123",
    transactions,
  };
}
