import { prisma } from './prisma-client.ts';
import { seedPermissions } from './seeds/permission.seed.ts';
import { seedRoles } from './seeds/role.seed.ts';
import { seedRolePermissions } from './seeds/role-permission.seed.ts';
import { seedUsers } from './seeds/user.seed.ts';
import { seedSubjects } from './seeds/subject.seed.ts';

async function main() {
  await seedPermissions();

  const roles = await seedRoles();

  await seedRolePermissions();

  await seedSubjects();

  const superAdminRole = roles.find((role) => role.slug === 'super_admin');

  if (!superAdminRole) {
    throw new Error('Super Admin role not found.');
  }

  await seedUsers(superAdminRole.id);

  console.log('All seeds completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
