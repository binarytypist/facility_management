import { CreateAgencyEmployeeDTO } from './create-agency-employee.dto';

export type UpdateAgencyEmployeeDTO = Partial<Omit<CreateAgencyEmployeeDTO, 'agencyId'>>;
