import { UserRepository } from './user.repository';
import { toUserDTO } from './user.mapper';
import { prisma } from '../../lib/db';
import { CreateUserSchema, UserFilterSchema } from './user.validators';
import { buildUserWhere } from './user.filters';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserFilterDTO } from './dto/user-filter.dto';

export const UserService = {
  async getAll(rawFilter?: any) {
    const filter: UserFilterDTO = rawFilter ? UserFilterSchema.parse(rawFilter) : {};
    const where = buildUserWhere(filter);
    const users = await UserRepository.findAll(where);
    return users.map(toUserDTO);
  },

  async getById(id: number) {
    const user = await UserRepository.findById(id);
    return toUserDTO(user);
  },

  async create(rawData: any) {
    const validated: CreateUserDTO = CreateUserSchema.parse(rawData);
    
    let finalRoleId = validated.roleId;
    let finalRoleCode = 'user';
    
    if (!finalRoleId) {
      const role = await prisma.role.findUnique({
        where: { code: 'user' },
      });
      if (role) {
        finalRoleId = role.id;
        finalRoleCode = role.code;
      }
    } else {
      const role = await prisma.role.findUnique({
        where: { id: validated.roleId! },
      });
      if (role) {
        finalRoleCode = role.code;
      }
    }

    const created = await UserRepository.create({
      userNumber: validated.userNumber,
      firstName: validated.firstName,
      lastName: validated.lastName,
      middleName: validated.middleName || '',
      designation: validated.designation,
      jobType: validated.jobType,
      email: validated.email || null,
      password: validated.password || null,
      roleId: finalRoleId,
      role: finalRoleCode,
      isActive: validated.isActive !== undefined ? validated.isActive : true,
    });

    return toUserDTO(created);
  },
};
