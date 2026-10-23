import { seedUsers } from './seeds/user.seed.ts';
import { seedSuperAdminRole } from './seeds/role.seed.ts';
import { seedPermissions } from './seeds/permission.seed.ts';
import { prisma } from './prisma-client.ts';

async function main() {
  const permissions = await seedPermissions();
  const superAdminRole = await seedSuperAdminRole();
  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: superAdminRole.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });
  await seedUsers(superAdminRole.id);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
