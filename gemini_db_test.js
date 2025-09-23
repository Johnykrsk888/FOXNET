console.log('--- Starting DB Test ---');
require('dotenv').config({ path: '/var/www/FOXNET/.env' });

const mysql = require('mysql');

const db_config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

console.log('Loaded config (password hidden):', {
    host: db_config.host,
    user: db_config.user,
    database: db_config.database
});

if (!db_config.host || !db_config.user || !db_config.password || !db_config.database) {
    console.error('\n--- ERROR: One or more DB variables are missing from .env file! ---');
    process.exit(1);
}

const connection = mysql.createConnection(db_config);

connection.connect(function(err) {
  if (err) {
    console.error('\n--- CONNECTION FAILED! ---');
    console.error('Error Code: ' + err.code);
    console.error('Error Message: ' + err.message);
    connection.end();
    process.exit(1);
  }

  console.log('\n--- CONNECTION SUCCESSFUL! ---');
  
  connection.query('SELECT 1', function(err, results) {
    if (err) {
        console.error('\n--- QUERY FAILED! ---');
        console.error(err);
        connection.end();
        process.exit(1);
    }
    console.log('\n--- QUERY SUCCESSFUL! ---');
    console.log('Database responded to test query.');
    connection.end();
    console.log('\nTest finished.');
  });
});