import { prisma } from '../prisma-client';
import { RoleType } from '../../src/generated/prisma/client';

const superAdminRole = {
  name: 'Super Admin',
  slug: 'super_admin',
  description: 'Full access to the system.',
  type: RoleType.SYSTEM_ROLE,
};

export async function seedSuperAdminRole() {
  const roleBySlug = await prisma.role.findUnique({
    where: { slug: superAdminRole.slug },
  });

  if (roleBySlug) {
    return prisma.role.update({
      where: { id: roleBySlug.id },
      data: superAdminRole,
    });
  }

  const roleByName = await prisma.role.findUnique({
    where: { name: superAdminRole.name },
  });

  if (roleByName) {
    return prisma.role.update({
      where: { id: roleByName.id },
      data: superAdminRole,
    });
  }

  return prisma.role.create({ data: superAdminRole });
}
