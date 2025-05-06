/**
 * Script pour corriger les imports de useResponsive
 * 
 * Ce script recherche les imports incorrects de useResponsive où il est importé 
 * comme export par défaut au lieu d'export nommé, et les corrige.
 * 
 * Problème:    import useResponsive from '@/hooks/common';
 * Solution:    import { useResponsive } from '@/hooks/common';
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const COMPONENTS_DIR = path.resolve(SRC_DIR, 'components');

// Regex pour trouver les imports incorrects
const INCORRECT_IMPORT_REGEX = /import\s+(\w+\s+)?useResponsive\s+from\s+['"]@\/hooks\/common['"];/g;

// Correction à appliquer
const CORRECT_IMPORT = `import { useResponsive } from '@/hooks/common';`;

// Structure pour suivre les statistiques
const stats = {
  totalFiles: 0,
  modifiedFiles: 0,
  errors: 0
};

// Log stylisé
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[34m%s\x1b[0m',    // bleu
    success: '\x1b[32m%s\x1b[0m',  // vert
    warning: '\x1b[33m%s\x1b[0m',  // jaune
    error: '\x1b[31m%s\x1b[0m'     // rouge
  };
  
  console.log(colors[type], message);
}

// Fonction pour corriger les imports dans un fichier
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remplace les imports incorrects
    content = content.replace(INCORRECT_IMPORT_REGEX, CORRECT_IMPORT);
    
    // Vérifie si des modifications ont été apportées
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      stats.modifiedFiles++;
      log(`Corrigé: ${path.relative(process.cwd(), filePath)}`, 'success');
    }
  } catch (error) {
    log(`Erreur dans le fichier ${filePath}: ${error.message}`, 'error');
    stats.errors++;
  }
}

// Trouver tous les fichiers JS/JSX dans les répertoires cibles
function findJSFiles() {
  return glob.sync(`${COMPONENTS_DIR}/**/*.{js,jsx}`);
}

// Fonction principale
function main() {
  log('Début de la correction des imports de useResponsive...', 'info');
  
  const jsFiles = findJSFiles();
  stats.totalFiles = jsFiles.length;
  
  jsFiles.forEach(filePath => {
    fixImportsInFile(filePath);
  });
  
  log('-'.repeat(50), 'info');
  log(`Statistiques:`, 'info');
  log(`Total des fichiers analysés: ${stats.totalFiles}`, 'info');
  log(`Fichiers modifiés: ${stats.modifiedFiles}`, 'success');
  log(`Erreurs: ${stats.errors}`, 'error');
  log('-'.repeat(50), 'info');
  
  if (stats.errors > 0) {
    process.exit(1);
  }
}

// Exécution du script
main();