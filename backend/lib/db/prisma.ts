import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  const dbUrl = new URL(process.env.DATABASE_URL!);
  const user = dbUrl.username;
  const password = decodeURIComponent(dbUrl.password);
  const host = dbUrl.hostname;
  const port = dbUrl.port ? parseInt(dbUrl.port, 10) : 3306;
  const database = dbUrl.pathname.substring(1);

  console.log('Initializing PrismaMariaDb adapter with host:', host, 'port:', port, 'user:', user, 'database:', database);
  const adapter = new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 150,
    allowPublicKeyRetrieval: true,
  } as any);

  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;

