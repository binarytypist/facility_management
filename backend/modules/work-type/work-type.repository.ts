import { prisma } from '../../lib/db';

export const WorkTypeRepository = {
  findAll(category?: string) {
    return prisma.workType.findMany({
      where: category ? { category } : undefined,
      orderBy: [
        { category: 'asc' },
        { id: 'asc' },
      ],
    });
  },

  findById(id: number) {
    return prisma.workType.findUnique({
      where: { id },
    });
  },

  create(name: string, code: string, category?: string) {
    return prisma.workType.create({
      data: {
        name,
        code: code.toUpperCase(),
        category,
      },
    });
  },

  update(id: number, name: string, code: string, category?: string) {
    return prisma.workType.update({
      where: { id },
      data: {
        name,
        code: code.toUpperCase(),
        category,
      },
    });
  },

  delete(id: number) {
    return prisma.workType.delete({
      where: { id },
    });
  },
};
