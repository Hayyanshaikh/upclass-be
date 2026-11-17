DROP INDEX IF EXISTS "Teacher_employeeId_key";

CREATE UNIQUE INDEX "Teacher_schoolId_employeeId_key" ON "Teacher"("schoolId", "employeeId");
