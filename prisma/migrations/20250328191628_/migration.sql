-- CreateEnum
CREATE TYPE "FinanceType" AS ENUM ('Loan', 'Investment', 'Dividend');

-- CreateTable
CREATE TABLE "Finance" (
    "id" TEXT NOT NULL,
    "type" "FinanceType" NOT NULL,
    "description" TEXT,
    "note" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "transaction" "TransactionType" NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finance_pkey" PRIMARY KEY ("id")
);
