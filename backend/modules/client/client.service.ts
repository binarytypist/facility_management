import { IClientService } from './client.service.interface';
import { IClientRepository } from './client.repository.interface';

export class ClientService implements IClientService {
  // Dependency Injection: ClientRepository is injected via constructor
  constructor(private readonly clientRepository: IClientRepository) {}

  async getAllClients() {
    const clients = await this.clientRepository.findAll();
    
    // Map the nested Prisma objects back to the flat structure the frontend expects
    return clients.map(c => ({
      ...c,
      company_type_name: c.companyType?.name || null,
      facility_name: c.facility?.name || null,
      employee_count: c._count.employees
    }));
  }

  async createClient(data: any) {
    if (!data.name) {
      throw new Error('Company Name is required');
    }
    
    // Check for existing logic could go here, but DB constraints will also catch it
    return this.clientRepository.create(data);
  }
}
