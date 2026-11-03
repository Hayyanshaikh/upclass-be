-- Replace the legacy ClassSubject.subject string with a Subject relation.

ALTER TABLE "ClassSubject"
ADD COLUMN "subjectId" TEXT;

-- Backfill from the stored subject name within the same school.
UPDATE "ClassSubject" AS cs
SET "subjectId" = (
  SELECT s."id"
  FROM "Subject" AS s
  JOIN "Class" AS c ON c."schoolId" = s."schoolId"
  WHERE c."id" = cs."classId"
    AND (
      lower(trim(s."name")) = lower(trim(cs."subject"))
      OR lower(trim(s."code")) = lower(trim(cs."subject"))
    )
  ORDER BY s."id"
  LIMIT 1
)
WHERE cs."subjectId" IS NULL;

-- Fallback for classes without a school context.
UPDATE "ClassSubject" AS cs
SET "subjectId" = (
  SELECT s."id"
  FROM "Subject" AS s
  WHERE (
    lower(trim(s."name")) = lower(trim(cs."subject"))
    OR lower(trim(s."code")) = lower(trim(cs."subject"))
  )
  ORDER BY s."id"
  LIMIT 1
)
WHERE cs."subjectId" IS NULL;

-- Keep one row per class and subject before enforcing the new unique key.
DELETE FROM "ClassSubject" AS duplicate
USING "ClassSubject" AS keeper
WHERE duplicate."classId" = keeper."classId"
  AND duplicate."subjectId" = keeper."subjectId"
  AND (
    duplicate."createdAt" > keeper."createdAt"
    OR (duplicate."createdAt" = keeper."createdAt" AND duplicate."id" > keeper."id")
  );

-- Drop rows that cannot be linked to an existing Subject.
DELETE FROM "ClassSubject"
WHERE "subjectId" IS NULL;

ALTER TABLE "ClassSubject"
ALTER COLUMN "subjectId" SET NOT NULL;

DROP INDEX IF EXISTS "ClassSubject_classId_subject_key";

ALTER TABLE "ClassSubject"
DROP COLUMN "subject";

CREATE UNIQUE INDEX "ClassSubject_classId_subjectId_key"
ON "ClassSubject"("classId", "subjectId");

ALTER TABLE "ClassSubject"
ADD CONSTRAINT "ClassSubject_subjectId_fkey"
FOREIGN KEY ("subjectId") REFERENCES "Subject"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
