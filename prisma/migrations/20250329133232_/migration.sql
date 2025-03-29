/*
  Warnings:

  - You are about to drop the `Capital` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Finance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Operational` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('Order', 'Operational', 'Capital', 'Finance');

-- CreateEnum
CREATE TYPE "TransactionSubCategoryType" AS ENUM ('Order', 'Salary', 'Rent', 'Utility', 'Marketing', 'Asset', 'RnD', 'Legal', 'Loan', 'Investment', 'Dividend', 'Transaction');

-- CreateEnum
CREATE TYPE "TransactionCategoryType" AS ENUM ('Order', 'Operational', 'Capital', 'Finance', 'Transaction');

-- DropTable
DROP TABLE "Capital";

-- DropTable
DROP TABLE "Finance";

-- DropTable
DROP TABLE "Operational";

-- DropEnum
DROP TYPE "CapitalType";

-- DropEnum
DROP TYPE "FinanceType";

-- DropEnum
DROP TYPE "OperationalType";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "category" "TransactionCategoryType" NOT NULL,
    "subCategory" "TransactionSubCategoryType" NOT NULL,
    "description" TEXT,
    "note" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "transaction" "TransactionType" NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
