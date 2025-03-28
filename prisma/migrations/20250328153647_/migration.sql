/*
  Warnings:

  - You are about to drop the column `businessId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `businessId` on the `Outcome` table. All the data in the column will be lost.
  - You are about to drop the column `businessId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Business` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParentBusiness` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_parentBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Outcome" DROP CONSTRAINT "Outcome_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_businessId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "businessId";

-- AlterTable
ALTER TABLE "Outcome" DROP COLUMN "businessId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "businessId";

-- DropTable
DROP TABLE "Business";

-- DropTable
DROP TABLE "ParentBusiness";

-- DropTable
DROP TABLE "Transaction";

-- DropEnum
DROP TYPE "TransactionCategory";

-- DropEnum
DROP TYPE "TransactionType";
