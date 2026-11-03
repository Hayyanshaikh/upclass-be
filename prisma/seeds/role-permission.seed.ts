import { rolePermissions } from '../../src/common/constants/role-permissions.ts';
import { prisma } from '../prisma-client.ts';

export async function seedRolePermissions() {
  const permissions = await prisma.permission.findMany();
  const roles = await prisma.role.findMany();

  for (const role of roles) {
    const keys = rolePermissions[role.slug];

    if (!keys) continue;

    const allowedPermissions = keys.includes('*')
      ? permissions
      : permissions.filter((permission: any) => keys.includes(permission.key));

    await prisma.rolePermission.createMany({
      data: allowedPermissions.map((permission: any) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  console.log('Role permissions seeded successfully');
}
