import { Prisma } from '../../../generated/prisma/client.ts';

export type SchoolWithUserCount = Prisma.SchoolGetPayload<{
  include: {
    _count: {
      select: {
        users: true;
      };
    };
  };
}>;