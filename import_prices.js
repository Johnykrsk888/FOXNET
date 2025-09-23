
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
    'Артикул',
    'Наименование',
    'Остаток',
    'Цена',
    'Группа',
    'ПутьКартинки',
    'КомментарийHTML'
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
        .pipe(csv({ separator: ';', bom: true })) // Используем разделитель, читаем заголовки и убираем BOM
        .on('headers', (headers) => {
          console.log('--- DEBUG: Заголовки из CSV ---');
          console.log(headers);
          console.log('---------------------------------');
        })
        .on('data', (row) => {
          if (rows.length === 0) { // Логируем только первую строку
            console.log('--- DEBUG: Первая строка данных ---');
            console.log(row);
            console.log('-----------------------------------');
          }
          // Собираем строку в правильном порядке для SQL-запроса
          const orderedRow = CSV_COLUMNS.map(colName => row[colName]);
          rows.push(orderedRow);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    console.log(`Прочитано ${rows.length} строк из CSV.`);

    if (rows.length === 0) {
      console.log('CSV файл пуст. Импорт не требуется.');
      return;
    }

    console.log('Загрузка данных в базу (построчно)...');
    let insertedCount = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const sql = `INSERT INTO ${TABLE_NAME} (${CSV_COLUMNS.map(col => `\`${col}\``).join(',')}) VALUES (?);`;

      if (i === 0) {
        console.log('--- DEBUG: Первый SQL-запрос ---');
        const formattedSql = db.format(sql, [row]);
        console.log(formattedSql);
        console.log('---------------------------------');
      }

      try {
        await new Promise((resolve, reject) => {
          db.query(sql, [row], (err, results) => {
            if (err) return reject(err);
            insertedCount += results.affectedRows;
            resolve();
          });
        });
      } catch (error) {
        console.error(`Ошибка при вставке строки ${i + 1}:`, row);
        console.error(error);
        throw error; // Останавливаемся на первой ошибке
      }
    }
    console.log(`Успешно добавлено ${insertedCount} записей.`);

  } catch (error) {
    console.error('Произошла ошибка во время импорта:', error);
  } finally {
    db.end();
    console.log('Соединение с базой данных закрыто.');
    console.log(`[${new Date().toISOString()}] Импорт завершен.\n`);
  }
};

importData();
