import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  stripeCustomerId: text("stripeCustomerId"),
  stripeCardholderId: text("stripeCardholderId"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

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
  cardType: text("cardType").notNull().default("permanent"), // single_use, permanent
  spendingLimit: integer("spendingLimit"), // in cents, null means no limit
  expirationDate: timestamp("expirationDate"), // null means no expiration
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type VirtualCard = typeof virtualCard.$inferSelect;
export type NewVirtualCard = typeof virtualCard.$inferInsert;

export const transactionRelations = relations(transaction, ({ one }) => ({
  virtualCard: one(virtualCard, {
    fields: [transaction.virtualCardId],
    references: [virtualCard.id],
  }),
}));

export const virtualCardRelations = relations(virtualCard, ({ many }) => ({
  transactions: many(transaction),
}));
