import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const paymentMethod = pgTable("paymentMethod", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  stripePaymentMethodId: text("stripePaymentMethodId").notNull(),
  last4: text("last4").notNull(),
  brand: text("brand").notNull(),
  isDefault: boolean("isDefault").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type PaymentMethod = typeof paymentMethod.$inferSelect;
export type NewPaymentMethod = typeof paymentMethod.$inferInsert;

