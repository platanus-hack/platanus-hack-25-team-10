import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { virtualCard } from "./virtual-cards";

export const transaction = pgTable("transaction", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  virtualCardId: text("virtualCardId")
    .notNull()
    .references(() => virtualCard.id, { onDelete: "cascade" }),
  stripeAuthorizationId: text("stripeAuthorizationId").notNull().unique(),
  merchantAmount: integer("merchantAmount").notNull(), // in cents
  userAmount: integer("userAmount").notNull(), // in cents
  profit: integer("profit").notNull(), // in cents
  merchantName: text("merchantName"),
  merchantCategory: text("merchantCategory"),
  status: text("status").notNull(), // approved, declined
  stripePaymentIntentId: text("stripePaymentIntentId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Transaction = typeof transaction.$inferSelect;
export type NewTransaction = typeof transaction.$inferInsert;

