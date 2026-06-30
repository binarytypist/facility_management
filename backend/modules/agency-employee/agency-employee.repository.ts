import { prisma } from '../../lib/db';

export const AgencyEmployeeRepository = {
  findAllByAgencyId(agencyId: number) {
    return prisma.agencyEmployee.findMany({
      where: { agencyId },
      orderBy: { lastName: 'asc' },
    });
  },

  findById(id: number) {
    return prisma.agencyEmployee.findUnique({
      where: { id },
    });
  },

  countByAgencyId(agencyId: number) {
    return prisma.agencyEmployee.count({
      where: { agencyId },
    });
  },

  create(data: {
    agencyId: number;
    firstName: string;
    lastName: string;
    mobileNumber?: string | null;
    otherPhone?: string | null;
    designation?: string | null;
    email?: string | null;
    preferredCallTime?: string | null;
    hasPrivatePhone?: boolean;
    privatePhone?: string | null;
    privateCallTime?: string | null;
  }) {
    return prisma.agencyEmployee.create({
      data,
    });
  },

  update(
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      mobileNumber?: string | null;
      otherPhone?: string | null;
      designation?: string | null;
      email?: string | null;
      preferredCallTime?: string | null;
      hasPrivatePhone?: boolean;
      privatePhone?: string | null;
      privateCallTime?: string | null;
    }
  ) {
    return prisma.agencyEmployee.update({
      where: { id },
      data,
    });
  },

  delete(id: number) {
    return prisma.agencyEmployee.delete({
      where: { id },
    });
  },
};
