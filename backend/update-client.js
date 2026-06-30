const mariadb = require('mariadb');
async function main() {
  const pool = mariadb.createPool({ 
    host: '127.0.0.1', 
    user: 'root', 
    password: 'admin', 
    database: 'geo_task_db',
    allowPublicKeyRetrieval: true 
  });
  const conn = await pool.getConnection();
  await conn.query("UPDATE clients SET code = '1001' WHERE id = 1");
  await conn.query("UPDATE clients SET code = '1002' WHERE id = 2");
  conn.release();
  console.log('Done');
  process.exit(0);
}
main();
