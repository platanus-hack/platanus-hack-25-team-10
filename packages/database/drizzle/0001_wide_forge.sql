CREATE TABLE "paymentMethod" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"stripePaymentMethodId" text NOT NULL,
	"last4" text NOT NULL,
	"brand" text NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virtualCard" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"stripeCardId" text NOT NULL,
	"name" text NOT NULL,
	"last4" text NOT NULL,
	"status" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "virtualCard_stripeCardId_unique" UNIQUE("stripeCardId")
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"virtualCardId" text NOT NULL,
	"stripeAuthorizationId" text NOT NULL,
	"merchantAmount" integer NOT NULL,
	"userAmount" integer NOT NULL,
	"profit" integer NOT NULL,
	"merchantName" text,
	"merchantCategory" text,
	"status" text NOT NULL,
	"stripePaymentIntentId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_stripeAuthorizationId_unique" UNIQUE("stripeAuthorizationId")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripeCustomerId" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripeCardholderId" text;--> statement-breakpoint
ALTER TABLE "paymentMethod" ADD CONSTRAINT "paymentMethod_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtualCard" ADD CONSTRAINT "virtualCard_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_virtualCardId_virtualCard_id_fk" FOREIGN KEY ("virtualCardId") REFERENCES "public"."virtualCard"("id") ON DELETE cascade ON UPDATE no action;