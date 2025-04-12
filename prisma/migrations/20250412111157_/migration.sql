/*
  Warnings:

  - You are about to drop the column `code` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customer_code_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "code";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_id_key" ON "Customer"("id");
