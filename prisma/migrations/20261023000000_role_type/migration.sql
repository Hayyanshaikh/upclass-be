DO $$
BEGIN
  CREATE TYPE "RoleType" AS ENUM ('SYSTEM_ROLE', 'CUSTOM');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Role"
  ADD COLUMN IF NOT EXISTS "type" "RoleType" NOT NULL DEFAULT 'CUSTOM';

UPDATE "Role"
SET "type" = 'SYSTEM_ROLE'
WHERE "slug" = 'super_admin';
