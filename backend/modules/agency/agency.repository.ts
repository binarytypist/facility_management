import { prisma } from '../../lib/db';

export const agencyInclude = {
  serviceCategory: true,
  facility: true,
  _count: {
    select: { employees: true },
  },
};

export const AgencyRepository = {
  findAll(where: any = {}) {
    return prisma.agency.findMany({
      where,
      include: agencyInclude,
      orderBy: { name: 'asc' },
    });
  },

  findById(id: number) {
    return prisma.agency.findUnique({
      where: { id },
      include: agencyInclude,
    });
  },

  create(data: any) {
    return prisma.agency.create({
      data,
      include: agencyInclude,
    });
  },

  update(id: number, data: any) {
    return prisma.agency.update({
      where: { id },
      data,
      include: agencyInclude,
    });
  },

  delete(id: number) {
    return prisma.agency.delete({
      where: { id },
    });
  },
};
