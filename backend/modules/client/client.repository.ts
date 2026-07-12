import { PrismaClient } from '@prisma/client';
import { IClientRepository } from './client.repository.interface';

export class PrismaClientRepository implements IClientRepository {
  // Dependency Injection: Prisma Client is injected via constructor
  constructor(private readonly prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.client.findMany({
      include: {
        companyType: true,
        facility: true,
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async create(data: any) {
    return this.prisma.client.create({
      data: {
        name: data.name,
        code: data.code || null,
        address: data.address || null,
        postcode: data.postcode || null,
        city: data.city || null,
        phone: data.phone || null,
        fax: data.fax || null,
        companyTypeId: data.company_type_id || null,
        facilityId: data.facility_id || null,
        numEmployees: data.num_employees || null,
        floorLevel: data.floor_level || null,
        floorSize: data.floor_size || null,
        hasElevator: data.has_elevator ? true : false,
        otherInfo: data.other_info || null,
        isActive: data.is_active !== undefined ? (data.is_active ? true : false) : true
      }
    });
  }
}
