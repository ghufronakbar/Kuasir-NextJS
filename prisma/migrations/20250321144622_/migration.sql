/*
  Warnings:

  - You are about to drop the column `productId` on the `Defect` table. All the data in the column will be lost.
  - Added the required column `stockId` to the `Defect` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Defect" DROP CONSTRAINT "Defect_productId_fkey";

-- AlterTable
ALTER TABLE "Defect" DROP COLUMN "productId",
ADD COLUMN     "stockId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Defect" ADD CONSTRAINT "Defect_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
