import { AgencyEmployeeRepository } from './agency-employee.repository';
import { toAgencyEmployeeDTO } from './agency-employee.mapper';
import { CreateAgencyEmployeeSchema, UpdateAgencyEmployeeSchema } from './agency-employee.validators';
import { CreateAgencyEmployeeDTO } from './dto/create-agency-employee.dto';
import { UpdateAgencyEmployeeDTO } from './dto/update-agency-employee.dto';

export const AgencyEmployeeService = {
  async getAllByAgencyId(agencyId: number) {
    const employees = await AgencyEmployeeRepository.findAllByAgencyId(agencyId);
    return employees.map(toAgencyEmployeeDTO);
  },

  async create(rawData: any) {
    const validated: CreateAgencyEmployeeDTO = CreateAgencyEmployeeSchema.parse(rawData);

    // Enforce business rule: max 2 employees per agency
    const count = await AgencyEmployeeRepository.countByAgencyId(validated.agencyId);
    if (count >= 2) {
      throw new Error('LimitReached: Maximum of 2 employees allowed per agency');
    }

    const employee = await AgencyEmployeeRepository.create(validated);
    return toAgencyEmployeeDTO(employee);
  },

  async update(id: number, rawData: any) {
    const validated: UpdateAgencyEmployeeDTO = UpdateAgencyEmployeeSchema.parse(rawData);
    const updated = await AgencyEmployeeRepository.update(id, validated);
    return toAgencyEmployeeDTO(updated);
  },

  async delete(id: number) {
    return AgencyEmployeeRepository.delete(id);
  },
};
