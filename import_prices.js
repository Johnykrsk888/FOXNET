
const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql');
require('dotenv').config();

// --- НАСТРОЙКИ ---
// Путь к файлу price.csv на вашем сервере
const CSV_PATH = '/var/www/FOXNET/price.csv'; 
const TABLE_NAME = 'price';
// Укажите здесь названия колонок из вашей таблицы `price` в том же порядке, 
// в котором они идут в CSV файле.
const CSV_COLUMNS = [
    'Код',
    'Артикул',
    'Наименование',
    'КомментарийHTML',
    'Цена',
    'Остаток',
    'ПутьКартинки',
    'Группа'
];


// --- ЛОГИКА СКРИПТА ---

console.log(`[${new Date().toISOString()}] Запуск импорта...`);

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const importData = async () => {
  try {
    await new Promise((resolve, reject) => {
      db.connect(err => {
        if (err) return reject(err);
        console.log('Успешное подключение к базе данных.');
        resolve();
      });
    });

    console.log(`Очистка таблицы ${TABLE_NAME}...`);
    await new Promise((resolve, reject) => {
      db.query(`TRUNCATE TABLE ${TABLE_NAME}`, (err, results) => {
        if (err) return reject(err);
        resolve();
      });
    });
    console.log('Таблица успешно очищена.');

    const rows = [];
    await new Promise((resolve, reject) => {
      console.log(`Чтение файла ${CSV_PATH}...`);
      fs.createReadStream(CSV_PATH)
        .pipe(csv({ headers: CSV_COLUMNS, separator: ';' })) // Указываем разделитель и названия колонок
        .on('data', (row) => {
          rows.push(Object.values(row));
        })
        .on('end', resolve)
        .on('error', reject);
    });
    console.log(`Прочитано ${rows.length} строк из CSV.`);

    if (rows.length === 0) {
      console.log('CSV файл пуст. Импорт не требуется.');
      return;
    }

    console.log('Загрузка данных в базу...');
    const sql = `INSERT INTO ${TABLE_NAME} (${CSV_COLUMNS.map(col => '`' + col + '`').join(',')}) VALUES ?`;
    await new Promise((resolve, reject) => {
      db.query(sql, [rows], (err, results) => {
        if (err) return reject(err);
        console.log(`Успешно добавлено ${results.affectedRows} записей.`);
        resolve();
      });
    });

  } catch (error) {
    console.error('Произошла ошибка во время импорта:', error);
  } finally {
    db.end();
    console.log('Соединение с базой данных закрыто.');
    console.log(`[${new Date().toISOString()}] Импорт завершен.\n`);
  }
};

importData();
