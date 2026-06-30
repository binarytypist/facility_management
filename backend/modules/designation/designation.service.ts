import { DesignationRepository } from './designation.repository';

export const DesignationService = {
  async getAll() {
    return DesignationRepository.findAll();
  },

  async create(code: string, name: string) {
    return DesignationRepository.create(code, name);
  },

  async update(id: number, code: string, name: string) {
    return DesignationRepository.update(id, code, name);
  },

  async delete(id: number) {
    return DesignationRepository.delete(id);
  },
};
