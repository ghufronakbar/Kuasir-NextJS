/*
  Warnings:

  - You are about to drop the `Information` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Business" AS ENUM ('Haykatuju', 'Majapahit');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "business" "Business" NOT NULL DEFAULT 'Haykatuju';

-- DropTable
DROP TABLE "Information";
