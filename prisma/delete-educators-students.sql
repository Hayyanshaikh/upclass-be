-- Deletes all students of The Educators and the 7 classes created for the CSV import.
-- Classes Class 1-3 and everything else is left untouched.
BEGIN;

DELETE FROM "Student"
WHERE "schoolId" = 'cmwlwf9ip0000x4sf68jbcc8x';

DELETE FROM "Class"
WHERE "schoolId" = 'cmwlwf9ip0000x4sf68jbcc8x'
  AND id IN (
    'edu-class-6th-grade',
    'edu-class-7th-grade',
    'edu-class-8th-grade',
    'edu-class-9th-science',
    'edu-class-9th-arts',
    'edu-class-10th-science',
    'edu-class-10th-arts'
  );

COMMIT;
