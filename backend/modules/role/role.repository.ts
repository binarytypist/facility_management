import { prisma } from '../../lib/db';

export const RoleRepository = {
  findAll() {
    return prisma.role.findMany({
      orderBy: { id: 'asc' },
    });
  },
};
