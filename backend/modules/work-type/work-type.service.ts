import { WorkTypeRepository } from './work-type.repository';

export const WorkTypeService = {
  async getAll(category?: string) {
    const workTypes = await WorkTypeRepository.findAll(category);
    return workTypes.map((w) => ({
      id: w.id,
      name: w.name,
      code: w.code,
      category: w.category,
    }));
  },

  async getById(id: number) {
    const w = await WorkTypeRepository.findById(id);
    if (!w) return null;
    return {
      id: w.id,
      name: w.name,
      code: w.code,
      category: w.category,
    };
  },

  async create(name: string, code: string, category?: string) {
    const w = await WorkTypeRepository.create(name, code, category);
    return {
      id: w.id,
      name: w.name,
      code: w.code,
      category: w.category,
    };
  },

  async update(id: number, name: string, code: string, category?: string) {
    const w = await WorkTypeRepository.update(id, name, code, category);
    return {
      id: w.id,
      name: w.name,
      code: w.code,
      category: w.category,
    };
  },

  async delete(id: number) {
    return WorkTypeRepository.delete(id);
  },
};
