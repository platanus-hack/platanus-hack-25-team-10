
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
const nowUTC = () => new Date();


export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  // Admin plugin fields
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  // Stripe fields
  stripeCustomerId: text("stripeCustomerId"),
  stripeCardholderId: text("stripeCardholderId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => nowUTC()),
});

export const session = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => nowUTC()),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("activeOrganizationId"),
  // Admin plugin field for impersonation
  impersonatedBy: text("impersonatedBy"),
});

export const account = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => nowUTC()),
});

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => nowUTC()),
});

export const prorationStrategyEnum = pgEnum("proration_strategy", [
  "hourly",
  "daily",
  "none",
]);

export const lateEventPolicyEnum = pgEnum("late_event_policy", [
  "next_period",
  "current_period",
  "ignore",
]);

export const billingTimezoneStrategyEnum = pgEnum("billing_timezone_strategy", [
  "customer_timezone",
  "organization_timezone",
]);

export const seatProrationDirectionEnum = pgEnum("seat_proration_direction", [
  "both",
  "up_only",
  "none",
]);

export const businessTypeEnum = pgEnum("business_type", [
  "individual",
  "company",
]);

export const organization = pgTable("organization", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  // Stripe Connect payout configuration
  country: text("country").notNull().default("US"), // ISO-2 country code (e.g., "US", "MX", "BR") - default for Better Auth compatibility
  businessType: businessTypeEnum("business_type").notNull().default("company"),
  // Billing configuration
  timezone: text("timezone").notNull().default("UTC"),
  lateEventPolicy: lateEventPolicyEnum("late_event_policy")
    .notNull()
    .default("next_period"),
  billingTimezoneStrategy: billingTimezoneStrategyEnum(
    "billing_timezone_strategy",
  )
    .notNull()
    .default("customer_timezone"),
  // Seat billing configuration
  seatProrationStrategy: prorationStrategyEnum("seat_proration_strategy")
    .notNull()
    .default("daily"),
  seatProrationDirection: seatProrationDirectionEnum("seat_proration_direction")
    .notNull()
    .default("both"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => nowUTC()),
});

export const member = pgTable("member", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => nowUTC()),
});

export const invitation = pgTable("invitation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  inviterId: text("inviterId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  status: text("status").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => nowUTC()),
});

export const apikey = pgTable("apikey", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  start: text("start"),
  prefix: text("prefix"),
  key: text("key").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organizationId").references(() => organization.id, {
    onDelete: "cascade",
  }),
  refillInterval: integer("refillInterval"),
  refillAmount: integer("refillAmount"),
  lastRefillAt: timestamp("lastRefillAt"),
  enabled: boolean("enabled").notNull().default(true),
  rateLimitEnabled: boolean("rateLimitEnabled").notNull().default(true),
  rateLimitTimeWindow: integer("rateLimitTimeWindow"),
  rateLimitMax: integer("rateLimitMax"),
  requestCount: integer("requestCount").notNull().default(0),
  remaining: integer("remaining"),
  lastRequest: timestamp("lastRequest"),
  expiresAt: timestamp("expiresAt"),
  permissions: text("permissions"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => nowUTC()),
});

// Device Authorization (Better Auth plugin - RFC 8628)
export const deviceCode = pgTable("deviceCode", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  deviceCode: text("deviceCode").notNull(),
  userCode: text("userCode").notNull(),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  clientId: text("clientId"),
  scope: text("scope"),
  status: text("status").notNull().default("pending"), // pending, approved, denied
  expiresAt: timestamp("expiresAt").notNull(),
  lastPolledAt: timestamp("lastPolledAt"),
  pollingInterval: integer("pollingInterval"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => nowUTC()),
});

export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;
export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;
export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type ApiKey = typeof apikey.$inferSelect;
export type NewApiKey = typeof apikey.$inferInsert;
export type DeviceCode = typeof deviceCode.$inferSelect;
export type NewDeviceCode = typeof deviceCode.$inferInsert;
