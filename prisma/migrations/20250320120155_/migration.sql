/*
  Warnings:

  - Made the column `businessId` on table `Outcome` required. This step will fail if there are existing NULL values in that column.
  - Made the column `businessId` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `businessId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Outcome" ALTER COLUMN "businessId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "businessId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "businessId" SET NOT NULL;
