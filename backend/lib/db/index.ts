import { prisma } from './prisma';
import { pool } from './pool';

export { prisma, pool };

export async function initDB() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Prisma Database connection verified successfully.');
  } catch (error) {
    console.error('Database connection verification failed:', error);
    throw error;
  }
}
