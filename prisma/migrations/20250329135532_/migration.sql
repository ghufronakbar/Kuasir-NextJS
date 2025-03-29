/*
  Warnings:

  - The values [Order] on the enum `TransactionCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [Order] on the enum `TransactionSubCategoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionCategory_new" AS ENUM ('Product', 'Operational', 'Capital', 'Finance');
ALTER TYPE "TransactionCategory" RENAME TO "TransactionCategory_old";
ALTER TYPE "TransactionCategory_new" RENAME TO "TransactionCategory";
DROP TYPE "TransactionCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionSubCategoryType_new" AS ENUM ('Sell', 'Expenditure', 'Salary', 'Rent', 'Utility', 'Marketing', 'Asset', 'RnD', 'Legal', 'Loan', 'Investment', 'Dividend', 'Transaction');
ALTER TABLE "Transaction" ALTER COLUMN "subCategory" TYPE "TransactionSubCategoryType_new" USING ("subCategory"::text::"TransactionSubCategoryType_new");
ALTER TYPE "TransactionSubCategoryType" RENAME TO "TransactionSubCategoryType_old";
ALTER TYPE "TransactionSubCategoryType_new" RENAME TO "TransactionSubCategoryType";
DROP TYPE "TransactionSubCategoryType_old";
COMMIT;
