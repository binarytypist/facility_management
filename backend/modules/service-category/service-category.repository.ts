import { prisma } from '../../lib/db';

export const ServiceCategoryRepository = {
  findAll() {
    return prisma.companyType.findMany({
      orderBy: { id: 'asc' },
    });
  },

  findById(id: number) {
    return prisma.companyType.findUnique({
      where: { id },
    });
  },

  create(name: string, code: string) {
    return prisma.companyType.create({
      data: { name, code: code.toUpperCase() },
    });
  },

  update(id: number, name: string, code: string) {
    return prisma.companyType.update({
      where: { id },
      data: { name, code: code.toUpperCase() },
    });
  },

  delete(id: number) {
    return prisma.companyType.delete({
      where: { id },
    });
  },
};
