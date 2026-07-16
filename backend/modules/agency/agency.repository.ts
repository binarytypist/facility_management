import { prisma } from '../../lib/db';

export const agencyInclude = {
  companyType: true,
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
    const { serviceCategoryId, ...rest } = data;
    const prismaData = { ...rest, companyTypeId: serviceCategoryId };
    return prisma.agency.create({
      data: prismaData,
      include: agencyInclude,
    });
  },

  update(id: number, data: any) {
    const { serviceCategoryId, ...rest } = data;
    const prismaData = serviceCategoryId !== undefined 
      ? { ...rest, companyTypeId: serviceCategoryId } 
      : rest;
    return prisma.agency.update({
      where: { id },
      data: prismaData,
      include: agencyInclude,
    });
  },

  delete(id: number) {
    return prisma.agency.delete({
      where: { id },
    });
  },
};
