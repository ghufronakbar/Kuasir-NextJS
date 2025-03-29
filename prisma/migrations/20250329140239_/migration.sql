/*
  Warnings:

  - The values [Order,Transaction] on the enum `TransactionCategoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionCategoryType_new" AS ENUM ('Product', 'Operational', 'Capital', 'Finance');
ALTER TABLE "Transaction" ALTER COLUMN "category" TYPE "TransactionCategoryType_new" USING ("category"::text::"TransactionCategoryType_new");
ALTER TYPE "TransactionCategoryType" RENAME TO "TransactionCategoryType_old";
ALTER TYPE "TransactionCategoryType_new" RENAME TO "TransactionCategoryType";
DROP TYPE "TransactionCategoryType_old";
COMMIT;

-- DropEnum
DROP TYPE "TransactionCategory";
