const mysql = require('mysql');
const fs = require('fs');

// Database connection
const db = mysql.createConnection({
  host: '31.31.196.104',
  user: 'u3236417_default',
  password: 'N2D99BoxtwH24rSU',
  database: 'u3236417_default'
});

console.log('Connecting to database...');
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database successfully.');

  // Fetch all products with all necessary fields
  const sql = 'SELECT ' +
    '`Код` as id, ' +
    '`Артикул` as sku, ' +
    '`Наименование` as title, ' +
    '`Описание` as description, ' +
    '`Свободный остаток` as quantity, ' +
    '`РРЦ` as price ' +
    'FROM price';

  console.log('Fetching products from database...');
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      db.end();
      return;
    }

    console.log(`Successfully fetched ${results.length} products.`);

    // Save products to products.json
    fs.writeFile('products.json', JSON.stringify(results, null, 2), (err) => {
      if (err) {
        console.error('Error writing to products.json:', err);
      } else {
        console.log('Successfully saved products to products.json');
      }
      // Close the database connection
      db.end();
    });
  });
});
