/*
  Warnings:

  - You are about to drop the column `categoryProductId` on the `Product` table. All the data in the column will be lost.
  - Added the required column `productCategoryId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryProductId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryProductId",
ADD COLUMN     "productCategoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
