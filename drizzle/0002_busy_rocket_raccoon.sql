ALTER TABLE "virtualCard" ADD COLUMN "cardType" text DEFAULT 'permanent' NOT NULL;
ALTER TABLE "virtualCard" ADD COLUMN "spendingLimit" integer;
ALTER TABLE "virtualCard" ADD COLUMN "expirationDate" timestamp;