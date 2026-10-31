import { prisma } from '../prisma-client.ts';
import {
  SubjectType,
  SubjectStatus,
} from '../../src/generated/prisma/enums.ts';

const subjects = [
  {
    name: 'English',
    code: 'ENG',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Urdu',
    code: 'URD',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Mathematics',
    code: 'MATH',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Science',
    code: 'SCI',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Islamiat',
    code: 'ISL',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Social Studies',
    code: 'SST',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Computer',
    code: 'COMP',
    type: SubjectType.MIXED,
    status: SubjectStatus.ACTIVE,
    hasPractical: true,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Pakistan Studies',
    code: 'PST',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Sindhi',
    code: 'SIND',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Arabic',
    code: 'ARAB',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Drawing',
    code: 'DRAW',
    type: SubjectType.PRACTICAL,
    status: SubjectStatus.ACTIVE,
    hasPractical: true,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Physics',
    code: 'PHY',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Chemistry',
    code: 'CHEM',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
  {
    name: 'Biology',
    code: 'BIO',
    type: SubjectType.THEORY,
    status: SubjectStatus.ACTIVE,
    hasPractical: false,
    defaultTotalMarks: 100,
    defaultPassingMarks: 40,
  },
];

export async function seedSubjects() {
  const seededSubjects = [];

  for (const subject of subjects) {
    const seededSubject = await prisma.subject.upsert({
      where: { code: subject.code },
      update: subject,
      create: subject,
    });

    seededSubjects.push(seededSubject);
  }

  console.log(`Seeded ${seededSubjects.length} subjects successfully.`);
  return seededSubjects;
}
