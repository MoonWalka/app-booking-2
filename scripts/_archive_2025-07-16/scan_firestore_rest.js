const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../src');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const FIRESTORE_REST_REGEX = /fetch\s*\(\s*['"]https:\/\/firestore\.googleapis\.com\/google\.firestore\.v1\.Firestore\/Listen\/channel/;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (FIRESTORE_REST_REGEX.test(line)) {
      console.log(`${filePath}:${index + 1} -> ${line.trim()}`);
    }
  });
}

console.log('Recherche des appels REST Firestore dans:', ROOT_DIR);
scanDir(ROOT_DIR);
console.log('Analyse terminée.');