import { prisma } from '../../lib/db';

export const DesignationRepository = {
  findAll() {
    return prisma.designation.findMany({
      orderBy: { name: 'asc' },
    });
  },

  create(code: string, name: string) {
    return prisma.designation.create({
      data: { code, name },
    });
  },

  update(id: number, code: string, name: string) {
    return prisma.designation.update({
      where: { id },
      data: { code, name },
    });
  },

  delete(id: number) {
    return prisma.designation.delete({
      where: { id },
    });
  },
};
