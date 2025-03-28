-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Income', 'Expense');

-- CreateEnum
CREATE TYPE "OperationalType" AS ENUM ('Salary', 'Rent', 'Utility', 'Marketing');

-- CreateTable
CREATE TABLE "Operational" (
    "id" TEXT NOT NULL,
    "type" "OperationalType" NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "transaction" "TransactionType" NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Operational_pkey" PRIMARY KEY ("id")
);
