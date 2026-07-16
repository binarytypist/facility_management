import { AgencyFilterDTO } from './dto/agency-filter.dto';

export function buildAgencyWhere(filter: AgencyFilterDTO) {
  const where: any = {};

  if (filter.isActive !== undefined) {
    where.isActive = filter.isActive;
  }

  if (filter.serviceCategoryIds && filter.serviceCategoryIds.length > 0) {
    where.companyTypeId = {
      in: filter.serviceCategoryIds,
    };
  }

  if (filter.facilityIds && filter.facilityIds.length > 0) {
    where.facilityId = {
      in: filter.facilityIds,
    };
  }

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search } },
      { code: { contains: filter.search } },
      { city: { contains: filter.search } },
    ];
  }

  return where;
}
