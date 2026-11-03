import { Injectable } from '@nestjs/common';
import {
  Prisma,
  RoleType,
  SubjectStatus,
  SubjectType,
} from '../../generated/prisma/client.ts';
import { rolePermissions } from '../../common/constants/role-permissions.ts';

@Injectable()
export class SchoolDefaultsService {
  async createDefaults(tx: Prisma.TransactionClient, schoolId: string) {
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
      {
        name: 'Parent',
        slug: 'parent',
        description: 'View student progress and attendance.',
      },
      {
        name: 'Student',
        slug: 'student',
        description: 'Access personal academic information.',
      },
    ];

    const permissions = await tx.permission.findMany();

    for (const roleData of defaultRoles) {
      const role = await tx.role.create({
        data: {
          ...roleData,
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
  }
}
