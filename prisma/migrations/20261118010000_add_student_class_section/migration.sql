-- Add student section (class section) link
ALTER TABLE "Student" ADD COLUMN "classSectionId" TEXT;

CREATE INDEX "Student_classSectionId_idx" ON "Student"("classSectionId");

ALTER TABLE "Student"
  ADD CONSTRAINT "Student_classSectionId_fkey"
  FOREIGN KEY ("classSectionId") REFERENCES "ClassSection"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
