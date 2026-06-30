import { prisma } from '../../lib/db';

export const ServiceCategoryRepository = {
  findAll() {
    return prisma.serviceCategory.findMany({
      orderBy: { id: 'asc' },
    });
  },

  findById(id: number) {
    return prisma.serviceCategory.findUnique({
      where: { id },
    });
  },

  create(name: string, code: string) {
    return prisma.serviceCategory.create({
      data: { name, code: code.toUpperCase() },
    });
  },

  update(id: number, name: string, code: string) {
    return prisma.serviceCategory.update({
      where: { id },
      data: { name, code: code.toUpperCase() },
    });
  },

  delete(id: number) {
    return prisma.serviceCategory.delete({
      where: { id },
    });
  },
};
