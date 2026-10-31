import { prisma } from '../prisma-client.ts';
import { RoleType } from '../../src/generated/prisma/client.ts';

const roles = [
  {
    name: 'Super Admin',
    slug: 'super_admin',
    description: 'Manage the SaaS platform and all schools.',
    type: RoleType.SYSTEM_ROLE,
  },
  {
    name: 'School Admin',
    slug: 'school_admin',
    description: 'Manage school operations and users.',
    type: RoleType.SYSTEM_ROLE,
  },
  {
    name: 'Teacher',
    slug: 'teacher',
    description: 'Manage teaching and academic activities.',
    type: RoleType.SYSTEM_ROLE,
  },
  {
    name: 'Parent',
    slug: 'parent',
    description: 'View student progress and attendance.',
    type: RoleType.SYSTEM_ROLE,
  },
  {
    name: 'Student',
    slug: 'student',
    description: 'Access personal academic information.',
    type: RoleType.SYSTEM_ROLE,
  },
];

export async function seedRoles() {
  const seededRoles = [];

  for (const role of roles) {
    const seededRole = await prisma.role.upsert({
      where: { slug: role.slug },
      update: role,
      create: role,
    });

    seededRoles.push(seededRole);
  }

  return seededRoles;
}
