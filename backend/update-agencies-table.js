require('dotenv').config({ path: 'c:/Users/sammi/.gemini/antigravity/scratch/geo-task-dashboard/backend/.env' });
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: 'geo_task_db'
  });
  
  try {
    await conn.query('ALTER TABLE agencies ADD COLUMN service_category_id INT');
    await conn.query('ALTER TABLE agencies ADD FOREIGN KEY (service_category_id) REFERENCES service_categories(id) ON DELETE SET NULL');
    console.log('Added service_category_id to agencies');
  } catch(e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists.');
    } else {
      console.error(e);
    }
  }
  await conn.end();
}
run();
