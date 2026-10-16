import { seedUsers } from './seeds/user.seed';

async function main() {
  await seedUsers();
}

main().catch((error) => {
  console.error('Seeding failed:', error);
  process.exitCode = 1;
});
