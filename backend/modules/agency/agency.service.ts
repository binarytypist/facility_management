import { AgencyRepository } from './agency.repository';
import { toAgencyDTO } from './agency.mapper';
import { CreateAgencySchema, UpdateAgencySchema, AgencyFilterSchema } from './agency.validators';
import { buildAgencyWhere } from './agency.filters';
import { CreateAgencyDTO } from './dto/create-agency.dto';
import { UpdateAgencyDTO } from './dto/update-agency.dto';
import { AgencyFilterDTO } from './dto/agency-filter.dto';

export const AgencyService = {
  async getAll(rawFilter?: any) {
    const filter: AgencyFilterDTO = rawFilter ? AgencyFilterSchema.parse(rawFilter) : {};
    const where = buildAgencyWhere(filter);
    const agencies = await AgencyRepository.findAll(where);
    return agencies.map(toAgencyDTO);
  },

  async getById(id: number) {
    const agency = await AgencyRepository.findById(id);
    return toAgencyDTO(agency);
  },

  async create(rawData: any) {
    const validated: CreateAgencyDTO = CreateAgencySchema.parse(rawData);
    const agency = await AgencyRepository.create(validated);
    return toAgencyDTO(agency);
  },

  async update(id: number, rawData: any) {
    const validated: UpdateAgencyDTO = UpdateAgencySchema.parse(rawData);
    const updated = await AgencyRepository.update(id, validated);
    return toAgencyDTO(updated);
  },

  async delete(id: number) {
    return AgencyRepository.delete(id);
  },
};
