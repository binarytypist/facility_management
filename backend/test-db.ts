import 'dotenv/config';
import { AgencyService } from './modules/agency/agency.service';
import { prisma } from './lib/db';
import { pool } from './lib/db';

async function main() {
  try {
    console.log('Testing prisma...');
    const result = await AgencyService.getAll();
    console.log('Agencies:', result);
    
    console.log('Testing pool...');
    const [rows] = await pool.query('SELECT 1');
    console.log('Pool result:', rows);
    
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
