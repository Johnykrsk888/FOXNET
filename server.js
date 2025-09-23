const express = require('express');
const mysql = require('mysql');
require('dotenv').config({ path: '/var/www/FOXNET/.env' });

const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
    '`Артикул` as id, ' +
    '`Артикул` as sku, ' +
    '`Наименование` as title, ' +
    '`Остаток` as quantity, ' +
    '`Цена` as price, ' +
    '`ПутьКартинки` as image ' +
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

// API endpoint to get all unique categories (groups)
app.get('/api/categories', (req, res) => {
  const sql = 'SELECT DISTINCT `Группа` FROM price WHERE `Группа` IS NOT NULL AND `Группа` != "" ORDER BY `Группа`';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      res.status(500).send('Error fetching categories');
      return;
    }
    const categories = results.map(row => row.Группа);
    res.json(categories);
  });
});


app.get('/api/product/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT ' +
    '`Артикул` as id, ' +
    '`Артикул` as sku, ' +
    '`Наименование` as title, ' +
    '`КомментарийHTML` as description, ' +
    '`Остаток` as quantity, ' +
    '`Цена` as price, ' +
    '`ПутьКартинки` as image ' +
    'FROM price WHERE `Артикул` = ?';
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