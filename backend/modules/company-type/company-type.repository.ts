import { prisma } from '../../lib/db';

export const CompanyTypeRepository = {
  findAll() {
    return prisma.companyType.findMany({
      orderBy: { name: 'asc' },
    });
  },

  create(code: string, name: string) {
    return prisma.companyType.create({
      data: { code, name },
    });
  },

  update(id: number, code: string, name: string) {
    return prisma.companyType.update({
      where: { id },
      data: { code, name },
    });
  },

  delete(id: number) {
    return prisma.companyType.delete({
      where: { id },
    });
  },
};
