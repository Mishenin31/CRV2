// Автор: Мишенин
// Простое файловое хранилище данных (JSON)

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Чтение JSON-файла; если файла нет — вернуть значение по умолчанию
function read(fileName, fallback = []) {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Ошибка чтения ${fileName}:`, err.message);
    return fallback;
  }
}

// Запись JSON-файла
function write(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Генерация простого уникального id
function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

module.exports = { read, write, nextId, DATA_DIR };
