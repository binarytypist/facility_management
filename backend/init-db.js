
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let env = {
  MYSQL_HOST: 'localhost',
  MYSQL_USER: 'facility',
  MYSQL_PASSWORD: 'facility123',
  MYSQL_DATABASE: 'facility_management',
};

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');

  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

    if (match) {
      const key = match[1];
      let value = match[2] || '';

      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }

      env[key] = value.trim();
    }
  });
}


async function run() {

  console.log('Connecting to MySQL:');
  console.log(`Host: ${env.MYSQL_HOST}`);
  console.log(`User: ${env.MYSQL_USER}`);
  console.log(`Database: ${env.MYSQL_DATABASE}`);


  let connection;

  try {

    // Connect
    connection = await mysql.createConnection({
      host: env.MYSQL_HOST,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE
    });


    console.log('✓ Connected to MySQL');


    // Check tables
    const [tables] = await connection.query(
      "SHOW TABLES"
    );

    console.log("\nExisting tables:");

    if (tables.length === 0) {
      console.log("No tables found. Run Prisma migration first.");
    } else {
      tables.forEach(t => {
        console.log(Object.values(t)[0]);
      });
    }


    console.log("\n🎉 Database connection successful");


  } catch(error){

    console.error("\n❌ Database error:");
    console.error(error.message);


    if(error.code === "ER_ACCESS_DENIED_ERROR"){
      console.error(
        "Check MYSQL_USER and MYSQL_PASSWORD"
      );
    }


    if(error.code === "ECONNREFUSED"){
      console.error(
        "MySQL container is not running"
      );
    }

  }
  finally {

    if(connection){
      await connection.end();
    }

  }

}


run();
