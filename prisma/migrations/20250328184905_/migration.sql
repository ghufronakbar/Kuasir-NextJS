/*
  Warnings:

  - The values [Imbursement] on the enum `OperationalType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OperationalType_new" AS ENUM ('Salary', 'Rent', 'Utility', 'Marketing', 'Transaction');
ALTER TABLE "Operational" ALTER COLUMN "type" TYPE "OperationalType_new" USING ("type"::text::"OperationalType_new");
ALTER TYPE "OperationalType" RENAME TO "OperationalType_old";
ALTER TYPE "OperationalType_new" RENAME TO "OperationalType";
DROP TYPE "OperationalType_old";
COMMIT;
