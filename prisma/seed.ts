import { seedUsers } from './seeds/user.seed';
import { seedSuperAdminRole } from './seeds/role.seed';
import { prisma } from './prisma-client';

async function main() {
  const superAdminRole = await seedSuperAdminRole();
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
