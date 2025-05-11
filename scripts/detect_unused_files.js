#!/usr/bin/env node
// Script pour détecter les fichiers JS/TS non importés dans src

const fs = require('fs');
const path = require('path');

// Répertoire source à scanner
const ROOT = path.resolve(__dirname, '../src');
// Extensions à prendre en compte
const EXT = ['.js', '.jsx', '.ts', '.tsx'];

// Regex pour imports ES6 et require
const importRegex = /import\s+.*?from\s+['\"](.*?)['\"]/g;
const requireRegex = /require\(\s*['\"](.*?)['\"]\s*\)/g;

const allFiles = new Set();
const importedFiles = new Set();

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (EXT.includes(path.extname(entry.name))) {
      const normalized = path.normalize(fullPath);
      allFiles.add(normalized);
      scanFile(normalized);
    }
  }
}

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    registerImport(match[1], file);
  }
  while ((match = requireRegex.exec(content)) !== null) {
    registerImport(match[1], file);
  }
}

function registerImport(modulePath, importer) {
  // only local imports
  if (modulePath.startsWith('.')) {
    const base = path.resolve(path.dirname(importer), modulePath);
    for (const ext of ['', ...EXT]) {
      const candidate = ext ? base + ext : base;
      if (fs.existsSync(candidate)) {
        importedFiles.add(path.normalize(candidate));
        return;
      }
    }
  }
}

scanDir(ROOT);

// Exclure ce script
importedFiles.add(path.normalize(__filename));

// Calculer fichiers non importés
const unused = [...allFiles].filter(f => !importedFiles.has(f));

if (unused.length === 0) {
  console.log('Aucun fichier inutilisé détecté.');
} else {
  console.log('Fichiers potentiellement inutilisés :');
  unused.forEach(f => console.log(' -', path.relative(process.cwd(), f)));
}