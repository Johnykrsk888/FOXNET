console.log('--- Starting Database Connection Test ---');

// 1. Load .env file with explicit path
try {
    require('dotenv').config({ path: '/var/www/FOXNET/.env' });
    console.log('.env file loaded.');
} catch (e) {
    console.error('Could not load .env file!', e);
    process.exit(1);
}

// 2. Print loaded variables to check if they are correct
console.log('DB_HOST:', process.env.DB_HOST ? 'loaded' : 'NOT LOADED');
console.log('DB_USER:', process.env.DB_USER ? 'loaded' : 'NOT LOADED');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'loaded' : 'NOT LOADED');
console.log('DB_NAME:', process.env.DB_NAME ? 'loaded' : 'NOT LOADED');

const mysql = require('mysql');

// 3. Create connection object
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

console.log('
Attempting to connect with this configuration:');
console.log({ ...dbConfig, password: '***' }); // Print config without password

const connection = mysql.createConnection(dbConfig);

// 4. Attempt to connect
connection.connect((err) => {
  if (err) {
    console.error('\n--- CONNECTION FAILED! ---');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    process.exit(1);
  }

  console.log('\n--- CONNECTION SUCCESSFUL! ---');
  console.log('Connected to database as ID ' + connection.threadId);
  
  // 5. Run a simple query
  connection.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
        console.error('\n--- QUERY FAILED! ---');
        console.error(error);
        connection.end();
        process.exit(1);
    }
    console.log('\n--- QUERY SUCCESSFUL! ---');
    console.log('The solution is: ', results[0].solution);
    connection.end(); // Close the connection
    console.log('\nConnection closed. Test finished.');
  });
});
