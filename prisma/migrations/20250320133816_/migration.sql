/*
  Warnings:

  - Added the required column `category` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('Operational_Salary', 'Operational_Rent', 'Operational_Utilities', 'Operational_Marketing', 'Capex_Asset', 'Capex_RnD', 'Capex_Legal', 'Financing_Loan', 'Financing_Investment', 'Financing_Debt', 'Financing_Dividend');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'Online';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "category" "TransactionCategory" NOT NULL;
