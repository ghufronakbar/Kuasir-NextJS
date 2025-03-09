/*
  Warnings:

  - Made the column `parentBusinessId` on table `Business` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_parentBusinessId_fkey";

-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "parentBusinessId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ParentBusiness" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_parentBusinessId_fkey" FOREIGN KEY ("parentBusinessId") REFERENCES "ParentBusiness"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
