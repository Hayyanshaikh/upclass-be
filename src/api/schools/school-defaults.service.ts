import { Injectable } from '@nestjs/common';
import {
  AcademicYearStatus,
  Prisma,
  RoleType,
  SubjectStatus,
  SubjectType,
} from '../../generated/prisma/client.ts';
import { rolePermissions } from '../../common/constants/role-permissions.ts';

@Injectable()
export class SchoolDefaultsService {
  async createDefaults(
    tx: Prisma.TransactionClient,
    schoolId: string,
    schoolName: string,
  ) {
    const defaultRoles = [
      {
        name: 'School Admin',
        slug: 'school_admin',
        description: 'Manage school operations and users.',
      },
      {
        name: 'Teacher',
        slug: 'teacher',
        description: 'Manage teaching and academic activities.',
      },
      // {
      //   name: 'Parent',
      //   slug: 'parent',
      //   description: 'View student progress and attendance.',
      // },
      // {
      //   name: 'Student',
      //   slug: 'student',
      //   description: 'Access personal academic information.',
      // },
    ];

    const permissions = await tx.permission.findMany();

    for (const roleData of defaultRoles) {
      const role = await tx.role.create({
        data: {
          ...roleData,
          description: `${roleData.description} (${schoolName})`,
          schoolId,
          type: 'SYSTEM_ROLE',
        },
      });

      const keys = rolePermissions[role.slug] ?? [];

      const allowedPermissions = permissions.filter((permission) =>
        keys.includes(permission.key),
      );

      await tx.rolePermission.createMany({
        data: allowedPermissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      });
    }

    const defaultSubjects = [
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

    await tx.subject.createMany({
      data: defaultSubjects.map((subject) => ({
        ...subject,
        schoolId,
      })),
      skipDuplicates: true,
    });

    const academicYear =
      (await tx.academicYear.findFirst({
        where: { schoolId },
        orderBy: { startDate: 'desc' },
      })) ??
      (await tx.academicYear.create({
        data: (() => {
          const now = new Date();
          const startYear =
            now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

          return {
            schoolId,
            year: `${startYear}-${String(startYear + 1).slice(-2)}`,
            startDate: new Date(Date.UTC(startYear, 3, 1)),
            endDate: new Date(Date.UTC(startYear + 1, 2, 31, 23, 59, 59, 999)),
            status: AcademicYearStatus.ACTIVE,
          };
        })(),
      }));

    const termStartYear = academicYear.startDate.getUTCFullYear();
    const termStartMonth = academicYear.startDate.getUTCMonth();

    const defaultTerms = [
      {
        name: '1st Term',
        startDate: new Date(Date.UTC(termStartYear, termStartMonth, 1)),
        endDate: new Date(
          Date.UTC(termStartYear, termStartMonth + 6, 0, 23, 59, 59, 999),
        ),
      },
      {
        name: '2nd Term',
        startDate: new Date(Date.UTC(termStartYear, termStartMonth + 6, 1)),
        endDate: new Date(
          Date.UTC(termStartYear, termStartMonth + 9, 0, 23, 59, 59, 999),
        ),
      },
      {
        name: 'Final Term',
        startDate: new Date(Date.UTC(termStartYear, termStartMonth + 9, 1)),
        endDate: academicYear.endDate,
      },
    ];

    for (const term of defaultTerms) {
      const academicTerm = await tx.academicTerm.create({
        data: {
          schoolId,
          name: term.name,
        },
      });

      await tx.academicYearTerm.create({
        data: {
          academicYearId: academicYear.id,
          academicTermId: academicTerm.id,
          startDate: term.startDate,
          endDate: term.endDate,
        },
      });
    }

    const defaultLeavePolicies = [
      { name: 'Casual Leave', daysPerYear: 12 },
      { name: 'Sick Leave', daysPerYear: 10 },
      { name: 'Annual Leave', daysPerYear: 15 },
      { name: 'Maternity Leave', daysPerYear: 90 },
    ];

    await tx.leavePolicy.createMany({
      data: defaultLeavePolicies.map((policy) => ({
        ...policy,
        schoolId,
      })),
      skipDuplicates: true,
    });

    await tx.leavePolicySetting.upsert({
      where: { schoolId },
      update: {},
      create: { schoolId },
    });
  }
}
