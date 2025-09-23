

const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql');
require('dotenv').config();

// --- НАСТРОЙКИ ---
// Путь к файлу price.csv на вашем сервере
const CSV_PATH = '/var/www/FOXNET/price.csv'; 
const TABLE_NAME = 'price';

// --- ЛОГИКА СКРИПТА ---

console.log(`[${new Date().toISOString()}] Запуск импорта...`);

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4' // Используем utf8mb4, так как БД обновлена
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
    let csvHeaders = []; // Будем хранить заголовки здесь
    let artikulIndex = -1; // Индекс колонки Артикул

    await new Promise((resolve, reject) => {
      console.log(`Чтение файла ${CSV_PATH}...`);
      fs.createReadStream(CSV_PATH)
        .pipe(csv({ separator: ';', bom: true }))
        .on('headers', (headers) => {
          csvHeaders = headers; // Сохраняем реальные заголовки из файла
          console.log('--- DEBUG: Заголовки из CSV (как прочитаны) ---');
          console.log(csvHeaders);
          console.log('--------------------------------------------------');
          artikulIndex = csvHeaders.indexOf('Артикул'); // Находим индекс Артикула
        })
        .on('data', (row) => {
          const rowValues = Object.values(row);
          if (artikulIndex !== -1) {
            rowValues.splice(artikulIndex, 1); // Удаляем значение Артикула
          }
          rows.push(rowValues); // Добавляем остальные значения
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
    // В INSERT запросе используем отфильтрованные заголовки
    const filteredHeaders = csvHeaders.filter(header => header !== 'Артикул');
    console.log('--- DEBUG: Заголовки после фильтрации ---');
    console.log(filteredHeaders);
    console.log('------------------------------------------');
    const columnNames = filteredHeaders.map(col => `\`${col}\``).join(',');
    const placeholders = `(${filteredHeaders.map(() => '?').join(',')})`; // Теперь используем отфильтрованные заголовки
    const valuesToInsert = rows.map(row => row); // rows уже массив массивов

    const sql = `INSERT INTO ${TABLE_NAME} (${columnNames}) VALUES ${valuesToInsert.map(() => placeholders).join(',')};`;

    await new Promise((resolve, reject) => {
      // Передаем значения как плоский массив для плейсхолдеров
      db.query(sql, [].concat(...valuesToInsert), (err, results) => {
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

