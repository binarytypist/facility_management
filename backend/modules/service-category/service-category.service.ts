import { ServiceCategoryRepository } from './service-category.repository';

export const ServiceCategoryService = {
  async getAll() {
    return ServiceCategoryRepository.findAll();
  },

  async getById(id: number) {
    return ServiceCategoryRepository.findById(id);
  },

  async create(name: string, code: string) {
    return ServiceCategoryRepository.create(name, code);
  },

  async update(id: number, name: string, code: string) {
    return ServiceCategoryRepository.update(id, name, code);
  },

  async delete(id: number) {
    return ServiceCategoryRepository.delete(id);
  },
};
