import { UserFilterDTO } from './dto/user-filter.dto';

export function buildUserWhere(filter: UserFilterDTO) {
  const where: any = {};

  if (filter.isActive !== undefined) {
    where.isActive = filter.isActive;
  }

  if (filter.roleIds && filter.roleIds.length > 0) {
    where.roleId = {
      in: filter.roleIds,
    };
  }

  if (filter.search) {
    where.OR = [
      { userNumber: { contains: filter.search } },
      { firstName: { contains: filter.search } },
      { lastName: { contains: filter.search } },
      { email: { contains: filter.search } },
      { designation: { contains: filter.search } },
    ];
  }

  return where;
}
