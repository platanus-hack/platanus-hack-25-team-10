<!-- 84cf1ede-4434-4fc8-ab65-3023495631af f9e4330b-1a91-4f74-93b6-a4e0e19c17db -->
# JIT Funding MVP - Proxy Card Service

## Architecture Overview

Tech Stack:

- Next.js 16 App Router + TypeScript
- Better Auth for authentication
- Drizzle ORM + Neon PostgreSQL
- Stripe Issuing for virtual cards
- Stripe Payment Intents for charging real cards
- Server Actions for most operations
- API Routes only for webhooks

Current State: POC with basic virtual card creation working, webhook auto-approving all transactions.

Target: Full production-ready MVP with user accounts, real card linking, JIT funding, and transaction history.

---

## Phase 1: Database Setup & Schema

Create a new workspace package for database:

### 1.1 Create Database Package Structure

**Directory**: `packages/db/`

Files to create:

- `package.json` - Package config with Drizzle dependencies
- `tsconfig.json` - TypeScript config extending base
- `drizzle.config.ts` - Drizzle configuration for Neon
- `src/index.ts` - Export db client and schema
- `src/schema/` - Schema definitions
- `.env.example` - Example environment variables

### 1.2 Define Database Schema

**File**: `packages/db/src/schema/users.ts`

```typescript
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeCardholderId: text("stripe_cardholder_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**File**: `packages/db/src/schema/sessions.ts` - Better Auth session tables

**File**: `packages/db/src/schema/accounts.ts` - Better Auth account tables

**File**: `packages/db/src/schema/verifications.ts` - Better Auth verification tables

**File**: `packages/db/src/schema/payment-methods.ts`

```typescript
export const paymentMethods = pgTable("payment_methods", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull(),
  last4: text("last4").notNull(),
  brand: text("brand").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**File**: `packages/db/src/schema/virtual-cards.ts`

```typescript
export const virtualCards = pgTable("virtual_cards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  stripeCardId: text("stripe_card_id").notNull().unique(),
  name: text("name").notNull(),
  last4: text("last4").notNull(),
  status: text("status").notNull(), // active, inactive, canceled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**File**: `packages/db/src/schema/transactions.ts`

```typescript
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  virtualCardId: text("virtual_card_id").notNull().references(() => virtualCards.id),
  stripeAuthorizationId: text("stripe_authorization_id").notNull().unique(),
  merchantAmount: integer("merchant_amount").notNull(), // in cents
  userAmount: integer("user_amount").notNull(), // in cents
  profit: integer("profit").notNull(), // in cents
  merchantName: text("merchant_name"),
  merchantCategory: text("merchant_category"),
  status: text("status").notNull(), // approved, declined, pending
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 1.3 Initialize Database Client

**File**: `packages/db/src/index.ts`

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export * from "./schema";
```

### 1.4 Setup Migrations

- Configure `drizzle-kit` in `drizzle.config.ts`
- Add migration scripts to `package.json`
- Generate initial migration
- Push to Neon database

### 1.5 Update Root Configuration

**File**: `package.json` (root)

- Add `@repo/db` to workspace references

**File**: `apps/web/package.json`

- Add dependency: `"@repo/db": "workspace:*"`

---

## Phase 2: Authentication with Better Auth

### 2.1 Install Better Auth

Dependencies for `apps/web/package.json`:

- `better-auth`
- `@better-auth/drizzle-adapter`

### 2.2 Configure Better Auth

**File**: `apps/web/lib/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@repo/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
});
```

**File**: `apps/web/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { useSession, signIn, signOut, signUp } = authClient;
```

### 2.3 Create Auth API Route

**File**: `apps/web/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";

export const { GET, POST } = auth.handler;
```

### 2.4 Update Providers

**File**: `apps/web/components/providers.tsx`

- Add Better Auth session provider wrapper

### 2.5 Create Auth Pages

**File**: `apps/web/app/(auth)/layout.tsx` - Auth layout (centered, no nav)

**File**: `apps/web/app/(auth)/signin/page.tsx` - Sign in form with email/password

**File**: `apps/web/app/(auth)/signup/page.tsx` - Sign up form

### 2.6 Middleware for Route Protection

**File**: `apps/web/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("better-auth.session_token");
  
  const isAuthPage = request.nextUrl.pathname.startsWith("/signin") || 
                     request.nextUrl.pathname.startsWith("/signup");
  const isPublicPage = request.nextUrl.pathname === "/" || isAuthPage;
  
  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Phase 3: Onboarding - Link Real Card

### 3.1 Create Stripe Customer on Signup

**File**: `apps/web/actions/user-actions.ts`

```typescript
"use server";

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db, users } from "@repo/db";
import { eq } from "drizzle-orm";

export async function setupStripeCustomer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  
  if (user?.stripeCustomerId) {
    return { customerId: user.stripeCustomerId };
  }
  
  const customer = await stripe.customers.create({
    email: session.user.email,
    name: session.user.name,
    metadata: { userId: session.user.id },
  });
  
  await db.update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, session.user.id));
  
  return { customerId: customer.id };
}
```

### 3.2 Payment Method Form with Stripe Elements

**File**: `apps/web/components/payment-method-form.tsx`

- Client component with Stripe Elements
- CardElement for card input
- Submit handler calling Server Action

**File**: `apps/web/actions/payment-actions.ts`

```typescript
"use server";

export async function attachPaymentMethod(paymentMethodId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  
  // Attach to Stripe Customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: user.stripeCustomerId,
  });
  
  // Set as default
  await stripe.customers.update(user.stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });
  
  // Save to DB
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  await db.insert(paymentMethods).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    stripePaymentMethodId: paymentMethodId,
    last4: pm.card.last4,
    brand: pm.card.brand,
    isDefault: true,
  });
  
  // Create Issuing Cardholder if doesn't exist
  if (!user.stripeCardholderId) {
    const cardholder = await stripe.issuing.cardholders.create({
      name: session.user.name || "User",
      email: session.user.email,
      phone_number: "+18008675309",
      type: "individual",
      billing: { address: { /* ... */ } },
      individual: {
        first_name: session.user.name?.split(" ")[0] || "User",
        last_name: session.user.name?.split(" ")[1] || "Name",
        dob: { year: 1990, month: 1, day: 1 },
        card_issuing: {
          user_terms_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: "127.0.0.1",
          },
        },
      },
    });
    
    await db.update(users)
      .set({ stripeCardholderId: cardholder.id })
      .where(eq(users.id, session.user.id));
  }
  
  return { success: true };
}
```

### 3.3 Onboarding Page

**File**: `apps/web/app/(dashboard)/onboarding/page.tsx`

- Check if user has payment method
- If yes, redirect to dashboard
- If no, show PaymentMethodForm

---

## Phase 4: Virtual Card Management

### 4.1 Create Virtual Card Server Action

**File**: `apps/web/actions/card-actions.ts`

```typescript
"use server";

export async function createVirtualCard(name: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  
  if (!user?.stripeCardholderId) {
    throw new Error("Complete onboarding first");
  }
  
  const card = await stripe.issuing.cards.create({
    cardholder: user.stripeCardholderId,
    currency: "usd",
    type: "virtual",
    status: "active",
    spending_controls: {
      spending_limits: [
        { amount: 100000, interval: "daily" },
        { amount: 500000, interval: "monthly" },
      ],
    },
  });
  
  await db.insert(virtualCards).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    stripeCardId: card.id,
    name,
    last4: card.last4,
    status: "active",
  });
  
  return { cardId: card.id, last4: card.last4 };
}

export async function getCardDetails(cardId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  
  // Verify card belongs to user
  const card = await db.query.virtualCards.findFirst({
    where: and(
      eq(virtualCards.stripeCardId, cardId),
      eq(virtualCards.userId, session.user.id)
    ),
  });
  
  if (!card) throw new Error("Card not found");
  
  const stripeCard = await stripe.issuing.cards.retrieve(cardId, {
    expand: ["number", "cvc"],
  });
  
  return {
    number: stripeCard.number,
    cvc: stripeCard.cvc,
    exp_month: stripeCard.exp_month,
    exp_year: stripeCard.exp_year,
    last4: stripeCard.last4,
  };
}

export async function listVirtualCards() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  
  return await db.query.virtualCards.findMany({
    where: eq(virtualCards.userId, session.user.id),
    orderBy: desc(virtualCards.createdAt),
  });
}
```

### 4.2 Dashboard Page

**File**: `apps/web/app/(dashboard)/layout.tsx` - Dashboard layout with nav

**File**: `apps/web/app/(dashboard)/dashboard/page.tsx`

- List of user's virtual cards
- "Create New Card" button with dialog
- Card display component showing details

**File**: `apps/web/components/virtual-card-display.tsx`

- Component to show card number, CVV, expiry
- Copy-to-clipboard functionality
- Masking/revealing sensitive data

---

## Phase 5: JIT Funding - The Core Logic

### 5.1 Update Webhook with JIT Funding

**File**: `apps/web/app/api/webhooks/stripe/route.ts`

Replace current auto-approve logic with:

```typescript
if (event.type === "issuing_authorization.request") {
  const authorization = event.data.object;
  const amount = authorization.pending_request?.amount || authorization.amount;
  
  try {
    // 1. Find virtual card and user
    const virtualCard = await db.query.virtualCards.findFirst({
      where: eq(virtualCards.stripeCardId, authorization.card.id),
      with: { user: true },
    });
    
    if (!virtualCard) {
      console.error("Virtual card not found");
      return Response.json(
        { approved: false },
        { status: 200, headers: { "Stripe-Version": "2024-06-20" } }
      );
    }
    
    // 2. Calculate markup: 5% + $0.50
    const userAmount = Math.round(amount * 1.05 + 50);
    
    // 3. Get user's default payment method
    const paymentMethod = await db.query.paymentMethods.findFirst({
      where: and(
        eq(paymentMethods.userId, virtualCard.userId),
        eq(paymentMethods.isDefault, true)
      ),
    });
    
    if (!paymentMethod) {
      console.error("No payment method found");
      return Response.json(
        { approved: false },
        { status: 200, headers: { "Stripe-Version": "2024-06-20" } }
      );
    }
    
    // 4. Charge user's real card (JIT Funding)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: userAmount,
      currency: "usd",
      customer: virtualCard.user.stripeCustomerId,
      payment_method: paymentMethod.stripePaymentMethodId,
      confirm: true,
      off_session: true,
      description: `Purchase at ${authorization.merchant_data?.name || "merchant"}`,
      metadata: {
        authorizationId: authorization.id,
        virtualCardId: virtualCard.id,
        merchantAmount: amount.toString(),
      },
    });
    
    if (paymentIntent.status === "succeeded") {
      // 5. Log transaction
      await db.insert(transactions).values({
        id: crypto.randomUUID(),
        virtualCardId: virtualCard.id,
        stripeAuthorizationId: authorization.id,
        merchantAmount: amount,
        userAmount: userAmount,
        profit: userAmount - amount,
        merchantName: authorization.merchant_data?.name,
        merchantCategory: authorization.merchant_data?.category,
        status: "approved",
        stripePaymentIntentId: paymentIntent.id,
      });
      
      console.log("✅ JIT Funding successful");
      console.log(`Merchant: $${(amount / 100).toFixed(2)}`);
      console.log(`User charged: $${(userAmount / 100).toFixed(2)}`);
      console.log(`Profit: $${((userAmount - amount) / 100).toFixed(2)}`);
      
      // 6. Approve authorization
      return Response.json(
        { approved: true },
        {
          status: 200,
          headers: {
            "Stripe-Version": "2024-06-20",
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      console.error("Payment Intent failed:", paymentIntent.status);
      
      await db.insert(transactions).values({
        id: crypto.randomUUID(),
        virtualCardId: virtualCard.id,
        stripeAuthorizationId: authorization.id,
        merchantAmount: amount,
        userAmount: userAmount,
        profit: 0,
        merchantName: authorization.merchant_data?.name,
        status: "declined",
      });
      
      return Response.json(
        { approved: false },
        {
          status: 200,
          headers: {
            "Stripe-Version": "2024-06-20",
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("❌ JIT Funding error:", error);
    
    return Response.json(
      { approved: false },
      {
        status: 200,
        headers: {
          "Stripe-Version": "2024-06-20",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
```

### 5.2 Handle Additional Webhook Events

Add handlers for:

- `issuing_transaction.created` - Log completed transactions
- `payment_intent.payment_failed` - Handle failed charges
- `issuing_card.updated` - Sync card status changes

---

## Phase 6: Transaction History & Dashboard

### 6.1 Transaction History Server Action

**File**: `apps/web/actions/transaction-actions.ts`

```typescript
"use server";

export async function getUserTransactions(limit = 50) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  
  const userCards = await db.query.virtualCards.findMany({
    where: eq(virtualCards.userId, session.user.id),
  });
  
  const cardIds = userCards.map(c => c.id);
  
  return await db.query.transactions.findMany({
    where: inArray(transactions.virtualCardId, cardIds),
    orderBy: desc(transactions.createdAt),
    limit,
    with: {
      virtualCard: true,
    },
  });
}

export async function getTransactionStats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  
  const userCards = await db.query.virtualCards.findMany({
    where: eq(virtualCards.userId, session.user.id),
  });
  
  const cardIds = userCards.map(c => c.id);
  
  const allTransactions = await db.query.transactions.findMany({
    where: inArray(transactions.virtualCardId, cardIds),
  });
  
  const totalProfit = allTransactions.reduce((sum, t) => sum + t.profit, 0);
  const totalSpent = allTransactions.reduce((sum, t) => sum + t.merchantAmount, 0);
  const approvedCount = allTransactions.filter(t => t.status === "approved").length;
  
  return {
    totalProfit,
    totalSpent,
    transactionCount: allTransactions.length,
    approvedCount,
  };
}
```

### 6.2 Transactions Page

**File**: `apps/web/app/(dashboard)/transactions/page.tsx`

- Table showing all transactions
- Columns: Date, Merchant, Merchant Amount, User Amount, Profit, Status
- Filtering and sorting

### 6.3 Enhanced Dashboard

Update `apps/web/app/(dashboard)/dashboard/page.tsx`:

- Stats cards: Total Profit, Total Transactions, Active Cards
- Recent transactions list
- Quick actions: Create Card, View All Transactions

---

## Phase 7: Refinements & Production Readiness

### 7.1 Error Handling & Notifications

- Add error boundaries
- Toast notifications for actions
- Proper error messages

### 7.2 Loading States

- Skeleton loaders for lists
- Loading states for actions
- Optimistic updates where appropriate

### 7.3 Environment Variables

**File**: `apps/web/.env.example`

```
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
BETTER_AUTH_SECRET=
```

### 7.4 Testing Utilities

**File**: `apps/web/app/(dashboard)/test/page.tsx`

- Protected page for testing virtual card purchases
- Form to simulate transactions
- View webhook logs

### 7.5 Documentation

Update `apps/web/README-POC.md` with:

- Full setup instructions
- Database migration steps
- Environment setup
- Testing guide
- Architecture diagram

---

## Critical Implementation Notes

### Performance Requirements

- Webhook MUST respond within 2-3 seconds
- Payment Intent creation should be fast
- Consider caching user/card lookups

### Security Considerations

- Never expose full card numbers in logs
- Validate webhook signatures
- Protect sensitive card endpoints
- Use `off_session: true` for Payment Intents
- Rate limit card creation

### Database Indexes

Add indexes for:

- `virtual_cards.stripe_card_id` (unique, for webhook lookups)
- `payment_methods.user_id` + `is_default` (for JIT funding)
- `transactions.virtual_card_id` (for history queries)
- `transactions.created_at` (for sorting)

### Monitoring & Observability

Log key events:

- Card creation
- Authorization requests
- Payment Intent results (success/failure)
- Webhook processing time
- JIT Funding failures

---

## Success Criteria

The MVP is complete when:

1. User can sign up and sign in
2. User can link their real credit card
3. User can create virtual cards
4. User can view full card details (number, CVV, expiry)
5. Webhook receives authorization requests
6. System charges user's real card with markup
7. System approves/declines based on charge result
8. User can view transaction history
9. Dashboard shows profit and stats
10. All error cases handled gracefully

---

## Migration from Current POC

Existing files to preserve:

- `apps/web/lib/stripe.ts` - Keep as is
- `apps/web/app/api/webhooks/stripe/route.ts` - Enhance with JIT logic
- `apps/web/components/providers.tsx` - Add auth provider

Files to archive/remove:

- `apps/web/actions/stripe-actions.ts` - Replace with new actions
- `apps/web/app/page.tsx` - Replace with proper landing/dashboard
- `apps/web/README-POC.md` - Update with full instructions

New environment variables needed:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Random secret for Better Auth
- `NEXT_PUBLIC_APP_URL` - App URL for auth callbacks

### To-dos

- [ ] Create database package with Drizzle, PostgreSQL, and migrations
- [ ] Configure Better Auth with email/password and Drizzle adapter
- [ ] Build signin/signup pages with forms
- [ ] Setup Stripe client and payment method linking
- [ ] Build onboarding page for linking real card and creating cardholder
- [ ] Implement virtual card creation and display with API routes
- [ ] Build JIT funding webhook handler for authorization requests