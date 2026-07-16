import { prisma } from './db/prisma';
import { PrismaClientRepository } from '../modules/client/client.repository';
import { ClientService } from '../modules/client/client.service';

/**
 * Manual Dependency Injection Container.
 * 
 * Here we instantiate our classes and wire them together, 
 * fulfilling their dependencies via constructor injection.
 */

// 1. Instantiate the Repository with the DB connection
const clientRepository = new PrismaClientRepository(prisma as any);

// 2. Instantiate the Service with the Repository
export const clientService = new ClientService(clientRepository);
