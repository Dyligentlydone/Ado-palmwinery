-- Guest checkout: orders and addresses can exist without a user account
ALTER TABLE "orders" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "orders" ADD COLUMN "guestEmail" TEXT;
ALTER TABLE "orders" ADD COLUMN "guestName" TEXT;
ALTER TABLE "addresses" ALTER COLUMN "userId" DROP NOT NULL;
