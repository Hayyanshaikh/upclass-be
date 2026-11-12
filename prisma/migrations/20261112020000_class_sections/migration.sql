-- CreateTable
CREATE TABLE "ClassSection" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSection_pkey" PRIMARY KEY ("id")
);

-- Backfill the missing school context from the academic year.
UPDATE "Class" AS c
SET "schoolId" = ay."schoolId"
FROM "AcademicYear" AS ay
WHERE ay."id" = c."academicYearId"
  AND c."schoolId" IS NULL;

ALTER TABLE "Class" ALTER COLUMN "schoolId" SET NOT NULL;

-- Backfill the existing single section of every class as a Section record.
INSERT INTO "Section" ("id", "schoolId", "name", "status", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, c."schoolId", upper(trim(c."section")), 'ACTIVE', now(), now()
FROM (
    SELECT DISTINCT "schoolId", "section"
    FROM "Class"
    WHERE "schoolId" IS NOT NULL AND trim("section") <> ''
) AS c
ON CONFLICT ("schoolId", "name") DO NOTHING;

-- Backfill one ClassSection row per existing class.
INSERT INTO "ClassSection" ("id", "classId", "sectionId", "teacherId", "room", "capacity", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, c."id", s."id", c."teacherId", c."room", c."capacity", now(), now()
FROM "Class" AS c
JOIN "Section" AS s
    ON s."schoolId" = c."schoolId"
    AND s."name" = upper(trim(c."section"))
WHERE c."schoolId" IS NOT NULL;

-- Merge classes that only differed by section into a single class.
UPDATE "Student" AS st
SET "classId" = keepers."keepId"
FROM (
    SELECT
        "id",
        first_value("id") OVER (
            PARTITION BY "schoolId", "name", "academicYearId"
            ORDER BY "createdAt", "id"
        ) AS "keepId"
    FROM "Class"
    WHERE "schoolId" IS NOT NULL
) AS keepers
WHERE st."classId" = keepers."id"
  AND keepers."id" <> keepers."keepId";

UPDATE "ClassSection" AS cs
SET "classId" = keepers."keepId"
FROM (
    SELECT
        "id",
        first_value("id") OVER (
            PARTITION BY "schoolId", "name", "academicYearId"
            ORDER BY "createdAt", "id"
        ) AS "keepId"
    FROM "Class"
    WHERE "schoolId" IS NOT NULL
) AS keepers
WHERE cs."classId" = keepers."id"
  AND keepers."id" <> keepers."keepId";

DELETE FROM "Class" AS c
USING (
    SELECT
        "id",
        first_value("id") OVER (
            PARTITION BY "schoolId", "name", "academicYearId"
            ORDER BY "createdAt", "id"
        ) AS "keepId"
    FROM "Class"
    WHERE "schoolId" IS NOT NULL
) AS keepers
WHERE c."id" = keepers."id"
  AND keepers."id" <> keepers."keepId";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_teacherId_fkey";

ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_assistantTeacherId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Class_name_section_academicYearId_key";

-- AlterTable
ALTER TABLE "Class"
DROP COLUMN "section",
DROP COLUMN "room",
DROP COLUMN "capacity",
DROP COLUMN "teacherId",
DROP COLUMN "assistantTeacherId";

-- CreateIndex
CREATE UNIQUE INDEX "ClassSection_classId_sectionId_key" ON "ClassSection"("classId", "sectionId");

CREATE UNIQUE INDEX "Class_schoolId_name_academicYearId_key" ON "Class"("schoolId", "name", "academicYearId");

-- AddForeignKey
ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
