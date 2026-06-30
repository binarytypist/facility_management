const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Basic parser for .env file
let env = {
  MYSQL_HOST: 'localhost',
  MYSQL_USER: 'root',
  MYSQL_PASSWORD: 'root', // fallback to 'root' as set by user
  MYSQL_DATABASE: 'geo_task_db',
};

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if any
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[key] = value.trim();
    }
  });
}

async function run() {
  console.log('Connecting to MySQL with configuration:');
  console.log(`- Host: ${env.MYSQL_HOST}`);
  console.log(`- User: ${env.MYSQL_USER}`);
  console.log(`- Password: ${env.MYSQL_PASSWORD ? '********' : '(empty)'}`);
  console.log(`- Database: ${env.MYSQL_DATABASE}`);

  let connection;
  try {
    // 1. Connect to MySQL without database first
    connection = await mysql.createConnection({
      host: env.MYSQL_HOST,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
    });
    
    console.log('✓ Successfully connected to MySQL server.');
    
    // 2. Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.MYSQL_DATABASE}\`;`);
    console.log(`✓ Database "${env.MYSQL_DATABASE}" verified/created successfully.`);
    await connection.end();

    // 3. Connect directly to the database
    connection = await mysql.createConnection({
      host: env.MYSQL_HOST,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
    });

    // 4. Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✓ Table "users" verified/created successfully.');

    // 5. Ensure "role" column exists (migration helper)
    try {
      await connection.query(`ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'`);
      console.log('✓ Column "role" added to "users" table.');
    } catch (e) {
      // Ignored if column already exists
    }

    console.log('\n🎉 MySQL Database initialization completed successfully!');
  } catch (error) {
    console.error('\n❌ Error connecting/initializing MySQL:');
    console.error(error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\nHint: Please make sure your MySQL server is running on the specified host/port.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nHint: Access denied. Please double check your MYSQL_USER and MYSQL_PASSWORD.');
    }
  } finally {
    if (connection && connection.end) {
      try {
        await connection.end();
      } catch (e) {}
    }
  }
}

run();
