-- Replace the legacy Class.academicYear string with an AcademicYear relation.

ALTER TABLE "Class"
ADD COLUMN "academicYearId" TEXT;

-- Backfill from the stored year label within the same school.
UPDATE "Class" AS c
SET "academicYearId" = (
  SELECT ay."id"
  FROM "AcademicYear" AS ay
  WHERE ay."schoolId" = c."schoolId"
    AND lower(trim(ay."year")) = lower(trim(c."academicYear"))
  ORDER BY ay."id"
  LIMIT 1
)
WHERE c."academicYearId" IS NULL;

-- Fallback for classes without a school context.
UPDATE "Class" AS c
SET "academicYearId" = (
  SELECT ay."id"
  FROM "AcademicYear" AS ay
  WHERE lower(trim(ay."year")) = lower(trim(c."academicYear"))
  ORDER BY ay."id"
  LIMIT 1
)
WHERE c."academicYearId" IS NULL;

-- Stop before enforcing NOT NULL if any class cannot be linked.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Class" WHERE "academicYearId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot link Class.academicYear to AcademicYear: create matching AcademicYear records for every class year first.';
  END IF;
END $$;

ALTER TABLE "Class"
ALTER COLUMN "academicYearId" SET NOT NULL;

DROP INDEX IF EXISTS "Class_name_section_academicYear_key";

ALTER TABLE "Class"
DROP COLUMN "academicYear";

CREATE UNIQUE INDEX "Class_name_section_academicYearId_key"
ON "Class"("name", "section", "academicYearId");

CREATE INDEX "Class_academicYearId_idx" ON "Class"("academicYearId");

ALTER TABLE "Class"
ADD CONSTRAINT "Class_academicYearId_fkey"
FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
