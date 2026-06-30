import { CompanyTypeRepository } from './company-type.repository';

export const CompanyTypeService = {
  async getAll() {
    return CompanyTypeRepository.findAll();
  },

  async create(code: string, name: string) {
    return CompanyTypeRepository.create(code, name);
  },

  async update(id: number, code: string, name: string) {
    return CompanyTypeRepository.update(id, code, name);
  },

  async delete(id: number) {
    return CompanyTypeRepository.delete(id);
  },
};
