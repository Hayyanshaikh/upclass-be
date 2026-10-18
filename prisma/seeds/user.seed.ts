import { Gendar } from '../../src/generated/prisma/client';
import { prisma } from '../prisma-client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(superAdminRoleId: string) {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Super Admin credentials missing in .env');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { roleId: superAdminRoleId, isSystem: true },
    create: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      roleId: superAdminRoleId,
      gender: Gendar.MALE,
      isActive: true,
      isSystem: true,
    },
  });

  console.log('Super Admin seeded successfully');
}
