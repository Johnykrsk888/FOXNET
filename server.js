const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
  host: '31.31.196.104',
  user: 'u3236417_default',
  password: 'N2D99BoxtwH24rSU',
  database: 'u3236417_default'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// API endpoint to get all products from the 'price' table
app.get('/api/products', (req, res) => {
  const sql = 'SELECT ' +
    '`Код` as id, ' +
    '`Артикул` as sku, ' +
    '`Наименование` as title, ' +
    '`Свободный остаток` as quantity, ' +
    '`РРЦ` as price ' +
    'FROM price';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).send('Error fetching products');
      return;
    }
    res.json(results);
  });
});


app.get('/api/product/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT ' +
    '`Код` as id, ' +
    '`Артикул` as sku, ' +
    '`Наименование` as title, ' +
    '`Описание` as description, ' +
    '`Свободный остаток` as quantity, ' +
    '`РРЦ` as price ' +
    'FROM price WHERE `Код` = ?';
  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      res.status(500).send('Error fetching product');
      return;
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Product not found');
    }
  });
});

app.get('/api/clean-codes', (req, res) => {
  const sql = "DELETE FROM price WHERE `Код` NOT LIKE '00%'";
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error cleaning codes:', err);
      res.status(500).send('Error cleaning codes');
      return;
    }
    res.send({ message: `Successfully deleted ${result.affectedRows} products with invalid codes.` });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
