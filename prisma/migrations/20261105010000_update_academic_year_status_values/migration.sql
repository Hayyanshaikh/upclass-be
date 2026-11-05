-- Replace enum values CLOSED -> COMPLETED and add UPCOMING.
-- The partial unique index depends on the enum type, so drop and recreate it.

DROP INDEX IF EXISTS "AcademicYear_schoolId_active_key";

ALTER TABLE "AcademicYear" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "AcademicYearStatus_new" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');

ALTER TABLE "AcademicYear"
    ALTER COLUMN "status" TYPE "AcademicYearStatus_new"
    USING (
        CASE "status"::text
            WHEN 'CLOSED' THEN 'COMPLETED'
            ELSE "status"::text
        END
    )::"AcademicYearStatus_new";

DROP TYPE "AcademicYearStatus";

ALTER TYPE "AcademicYearStatus_new" RENAME TO "AcademicYearStatus";

ALTER TABLE "AcademicYear" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

CREATE UNIQUE INDEX "AcademicYear_schoolId_active_key" ON "AcademicYear"("schoolId") WHERE "status" = 'ACTIVE';
