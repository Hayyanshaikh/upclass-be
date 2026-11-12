-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('PERIOD', 'BREAK');

-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Period" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "type" "PeriodType" NOT NULL DEFAULT 'PERIOD',
    "sortOrder" INTEGER NOT NULL,
    "status" "PeriodStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Period_schoolId_sortOrder_idx" ON "Period"("schoolId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Period_schoolId_name_key" ON "Period"("schoolId", "name");

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
