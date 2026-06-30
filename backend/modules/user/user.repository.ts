import { prisma } from '../../lib/db';

export const userInclude = {
  roleRelation: true,
};

export const UserRepository = {
  findAll(where: any = {}) {
    return prisma.user.findMany({
      where,
      include: userInclude,
      orderBy: { id: 'desc' },
    });
  },

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
  },

  create(data: any) {
    return prisma.user.create({
      data,
      include: userInclude,
    });
  },
};
