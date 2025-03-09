-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "parentBusinessId" TEXT;

-- CreateTable
CREATE TABLE "ParentBusiness" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ParentBusiness_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_parentBusinessId_fkey" FOREIGN KEY ("parentBusinessId") REFERENCES "ParentBusiness"("id") ON DELETE SET NULL ON UPDATE CASCADE;
