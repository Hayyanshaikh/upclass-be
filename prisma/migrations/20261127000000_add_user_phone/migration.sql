-- Add phone to User for email-or-phone login
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- Backfill from teacher records, skipping numbers shared by more than one teacher
UPDATE "User" u
SET "phone" = btrim(t."phone")
FROM "Teacher" t
WHERE t."userId" = u."id"
  AND t."phone" IS NOT NULL
  AND btrim(t."phone") <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM "Teacher" t2
    WHERE btrim(t2."phone") = btrim(t."phone")
      AND t2."userId" <> u."id"
  );

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
