import { RoleRepository } from './role.repository';

export const RoleService = {
  async getAll() {
    return RoleRepository.findAll();
  },
};
