/*
  Warnings:

  - You are about to drop the column `recipient` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "recipient",
ADD COLUMN     "sender" "TransactionCategoryType";
