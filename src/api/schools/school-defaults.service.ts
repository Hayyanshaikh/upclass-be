import { Injectable } from '@nestjs/common';
import { Prisma, RoleType } from '../../generated/prisma/client.ts';
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
  }
}
