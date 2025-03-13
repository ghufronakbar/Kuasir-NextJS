/*
  Warnings:

  - You are about to drop the column `outcomeCategoryId` on the `Outcome` table. All the data in the column will be lost.
  - You are about to drop the `OutcomeCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Outcome` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Outcome" DROP CONSTRAINT "Outcome_outcomeCategoryId_fkey";

-- AlterTable
ALTER TABLE "Outcome" DROP COLUMN "outcomeCategoryId",
ADD COLUMN     "category" TEXT NOT NULL;

-- DropTable
DROP TABLE "OutcomeCategory";
