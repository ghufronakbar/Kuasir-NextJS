/*
  Warnings:

  - You are about to drop the column `additional` on the `Operational` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Operational" DROP COLUMN "additional",
ADD COLUMN     "note" TEXT;
