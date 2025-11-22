import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const virtualCard = pgTable("virtualCard", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCardId: text("stripeCardId").notNull().unique(),
  name: text("name").notNull(),
  last4: text("last4").notNull(),
  status: text("status").notNull(), // active, inactive, canceled
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type VirtualCard = typeof virtualCard.$inferSelect;
export type NewVirtualCard = typeof virtualCard.$inferInsert;

