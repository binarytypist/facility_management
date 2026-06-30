const mariadb = require('mariadb');

async function testDirect() {
  console.log('Testing direct connection via mariadb package...');
  let conn;
  try {
    conn = await mariadb.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'admin',
      database: 'geo_task_db',
      allowPublicKeyRetrieval: true
    });
    console.log('✓ Successfully connected directly with mariadb package!');
    const rows = await conn.query('SELECT 1 as result');
    console.log('Result:', rows);
  } catch (err) {
    console.error('❌ Direct connection failed via mariadb package:', err);
  } finally {
    if (conn) await conn.end();
  }
}

testDirect();
