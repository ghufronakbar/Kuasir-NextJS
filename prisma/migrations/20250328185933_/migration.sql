-- CreateEnum
CREATE TYPE "CapitalType" AS ENUM ('Asset', 'RnD', 'Legal', 'Transaction');

-- CreateTable
CREATE TABLE "Capital" (
    "id" TEXT NOT NULL,
    "type" "CapitalType" NOT NULL,
    "description" TEXT,
    "note" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "transaction" "TransactionType" NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Capital_pkey" PRIMARY KEY ("id")
);
