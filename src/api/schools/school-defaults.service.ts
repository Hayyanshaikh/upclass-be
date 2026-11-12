import { Injectable } from '@nestjs/common';
import {
  AcademicYearStatus,
  PeriodStatus,
  PeriodType,
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
    await this.createRoles(tx, schoolId, schoolName);
    await this.createSubjects(tx, schoolId);
    const academicYear = await this.createAcademicYear(tx, schoolId);
    await this.createAcademicTerms(tx, schoolId, academicYear);
    await this.createLeavePolicies(tx, schoolId);
    await this.createLeavePolicySettings(tx, schoolId);
    await this.createPeriods(tx, schoolId);
  }

  private async createRoles(
    tx: Prisma.TransactionClient,
    schoolId: string,
    schoolName: string,
  ): Promise<void> {
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
  }

  private async createSubjects(
    tx: Prisma.TransactionClient,
    schoolId: string,
  ): Promise<void> {
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
  }

  private async createAcademicYear(
    tx: Prisma.TransactionClient,
    schoolId: string,
  ) {
    return (
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
      }))
    );
  }

  private async createAcademicTerms(
    tx: Prisma.TransactionClient,
    schoolId: string,
    academicYear: { id: string; startDate: Date; endDate: Date },
  ): Promise<void> {
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
  }

  private async createLeavePolicies(
    tx: Prisma.TransactionClient,
    schoolId: string,
  ): Promise<void> {
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
  }

  private async createLeavePolicySettings(
    tx: Prisma.TransactionClient,
    schoolId: string,
  ): Promise<void> {
    await tx.leavePolicySetting.upsert({
      where: { schoolId },
      update: {},
      create: { schoolId },
    });
  }

  private async createPeriods(
    tx: Prisma.TransactionClient,
    schoolId: string,
  ): Promise<void> {
    const defaultPeriods = [
      {
        name: 'Period 1',
        startTime: '08:00',
        endTime: '08:40',
        type: PeriodType.PERIOD,
        sortOrder: 1,
      },
      {
        name: 'Period 2',
        startTime: '08:40',
        endTime: '09:20',
        type: PeriodType.PERIOD,
        sortOrder: 2,
      },
      {
        name: 'Period 3',
        startTime: '09:20',
        endTime: '10:00',
        type: PeriodType.PERIOD,
        sortOrder: 3,
      },
      {
        name: 'Period 4',
        startTime: '10:00',
        endTime: '10:40',
        type: PeriodType.PERIOD,
        sortOrder: 4,
      },
      {
        name: 'Break',
        startTime: '10:40',
        endTime: '11:10',
        type: PeriodType.BREAK,
        sortOrder: 5,
      },
      {
        name: 'Period 5',
        startTime: '11:10',
        endTime: '11:50',
        type: PeriodType.PERIOD,
        sortOrder: 6,
      },
      {
        name: 'Period 6',
        startTime: '11:50',
        endTime: '12:30',
        type: PeriodType.PERIOD,
        sortOrder: 7,
      },
      {
        name: 'Period 7',
        startTime: '12:30',
        endTime: '13:10',
        type: PeriodType.PERIOD,
        sortOrder: 8,
      },
    ];

    await tx.period.createMany({
      data: defaultPeriods.map((period) => ({
        ...period,
        status: PeriodStatus.ACTIVE,
        schoolId,
      })),
      skipDuplicates: true,
    });
  }
}
