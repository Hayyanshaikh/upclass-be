-- Creates 20 students in The Educators (academic year 2026-27) using the existing
-- Class 1, Class 2 and Class 3 only, each placed in one of that class's sections.
-- Idempotent: reruns skip existing (schoolId, roll).
BEGIN;

WITH data (id, first_name, last_name, class_name, section_name, roll, guardian, relation, phone) AS (
  VALUES
    ('edu-stu-001', 'Ahmed',    'Raza',    'Class 1', 'Section A', 'R-101', 'Khalid Raza',    'Father', '0300-1000001'),
    ('edu-stu-002', 'Sana',     'Yousaf',  'Class 1', 'Section B', 'R-102', 'Yousaf Khan',    'Father', '0300-1000002'),
    ('edu-stu-003', 'Bilal',    'Hussain', 'Class 1', 'Section A', 'R-103', 'Imran Hussain',  'Father', '0300-1000003'),
    ('edu-stu-004', 'Mahnoor',  'Fatima',  'Class 1', 'Section B', 'R-104', 'Asif Mehmood',   'Father', '0300-1000004'),
    ('edu-stu-005', 'Ali',      'Hassan',  'Class 1', 'Section A', 'R-105', 'Nadeem Hassan',  'Father', '0300-1000005'),
    ('edu-stu-006', 'Rabia',    'Aslam',   'Class 1', 'Section B', 'R-106', 'Aslam Sheikh',   'Father', '0300-1000006'),
    ('edu-stu-007', 'Usman',    'Tariq',   'Class 1', 'Section A', 'R-107', 'Tariq Javed',    'Father', '0300-1000007'),
    ('edu-stu-008', 'Fatima',   'Zahra',   'Class 2', 'Section A', 'R-108', 'Zahid Ali',      'Father', '0300-1000008'),
    ('edu-stu-009', 'Hamza',    'Iqbal',   'Class 2', 'Section A', 'R-109', 'Iqbal Ahmed',    'Father', '0300-1000009'),
    ('edu-stu-010', 'Ayesha',   'Malik',   'Class 2', 'Section A', 'R-110', 'Rashid Malik',   'Father', '0300-1000010'),
    ('edu-stu-011', 'Abdullah', 'Nadeem',  'Class 2', 'Section A', 'R-111', 'Nadeem Akhtar',  'Father', '0300-1000011'),
    ('edu-stu-012', 'Hira',     'Shahid',  'Class 2', 'Section A', 'R-112', 'Shahid Anwar',   'Father', '0300-1000012'),
    ('edu-stu-013', 'Muhammad', 'Saad',    'Class 2', 'Section A', 'R-113', 'Waseem Abbas',   'Father', '0300-1000013'),
    ('edu-stu-014', 'Zainab',   'Noor',    'Class 2', 'Section A', 'R-114', 'Noor Muhammad',  'Father', '0300-1000014'),
    ('edu-stu-015', 'Ibrahim',  'Khalil',  'Class 3', 'Section A', 'R-115', 'Khalil Ahmed',   'Father', '0300-1000015'),
    ('edu-stu-016', 'Maryam',   'Nawaz',   'Class 3', 'Section B', 'R-116', 'Nawaz Ali',      'Father', '0300-1000016'),
    ('edu-stu-017', 'Hassan',   'Raza',    'Class 3', 'Section A', 'R-117', 'Raza Hussain',   'Father', '0300-1000017'),
    ('edu-stu-018', 'Nimra',    'Batool',  'Class 3', 'Section B', 'R-118', 'Ashraf Ali',     'Father', '0300-1000018'),
    ('edu-stu-019', 'Daniyal',  'Khan',    'Class 3', 'Section A', 'R-119', 'Shahid Khan',    'Father', '0300-1000019'),
    ('edu-stu-020', 'Laiba',    'Amin',    'Class 3', 'Section B', 'R-120', 'Amin Ullah',     'Father', '0300-1000020')
)
INSERT INTO "Student" (
  id, "schoolId", "firstName", "lastName", "classId", "classSectionId", roll, status,
  guardian, relation, phone, "createdAt", "updatedAt"
)
SELECT
  d.id,
  'cmwlwf9ip0000x4sf68jbcc8x',
  d.first_name,
  d.last_name,
  c.id,
  cs.id,
  d.roll,
  'ACTIVE'::"StudentStatus",
  d.guardian,
  d.relation,
  d.phone,
  now(),
  now()
FROM data d
JOIN "Class" c
  ON c."schoolId" = 'cmwlwf9ip0000x4sf68jbcc8x'
 AND c."academicYearId" = 'cmwlwf9kt000hx4sf8msrmdmn'
 AND c.name = d.class_name
JOIN "ClassSection" cs
  ON cs."classId" = c.id
JOIN "Section" s
  ON s.id = cs."sectionId"
 AND s."schoolId" = c."schoolId"
 AND s.name = d.section_name
ON CONFLICT ("schoolId", roll) DO NOTHING;

COMMIT;
