-- AlterEnum
ALTER TYPE "Currency" ADD VALUE 'CRC';

-- AlterTable
ALTER TABLE "products" ADD COLUMN "priceCRC" DECIMAL(10,2);
