/**
 * Script pour standardiser tous les imports de hooks
 * 
 * Ce script va:
 * 1. Corriger les imports avec espaces supplémentaires
 * 2. Convertir les imports directs en imports standardisés
 * 3. S'assurer que tous les hooks utilisent la syntaxe d'import appropriée (nommé vs. défaut)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const COMPONENTS_DIR = path.resolve(SRC_DIR, 'components');
const PAGES_DIR = path.resolve(SRC_DIR, 'pages');

// Regex pour trouver les différents types d'imports problématiques
const REGEX_PATTERNS = [
  // Import avec espaces supplémentaires
  {
    pattern: /import\s+(\s+)?(use\w+)(\s+)\s+from\s+['"](@\/hooks\/(\w+))['"];/g,
    replace: (match, spacesBefore, hookName, spacesAfter, fullPath, category) => {
      return `import ${hookName} from ${fullPath};`;
    },
    description: "Nettoyage des espaces superflus"
  },
  // Import direct du fichier au lieu du module
  {
    pattern: /import\s+(.*)(use\w+)\s+from\s+['"](@\/hooks\/(\w+)\/(\w+))['"];/g,
    replace: (match, prefix, hookName, fullPath, category, fileName) => {
      // Si l'import utilise des accolades (named import)
      if (prefix.includes('{')) {
        return `import { ${hookName} } from '@/hooks/${category}';`;
      }
      return `import ${hookName} from '@/hooks/${category}';`;
    },
    description: "Conversion des imports directs en imports standardisés"
  }
];

// Structure pour suivre les statistiques
const stats = {
  totalFiles: 0,
  modifiedFiles: 0,
  errors: 0,
  fixesByType: {}
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

// Fonction pour standardiser les imports dans un fichier
function standardizeImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileModified = false;
    
    // Appliquer chaque pattern de remplacement
    REGEX_PATTERNS.forEach(({ pattern, replace, description }) => {
      // Vérifier si le pattern est trouvé dans le contenu
      if (pattern.test(content)) {
        // Reset lastIndex à 0 pour éviter des problèmes avec les regex globaux
        pattern.lastIndex = 0;
        
        // Effectuer le remplacement
        content = content.replace(pattern, replace);
        
        // Incrémenter le compteur pour ce type de correction
        stats.fixesByType[description] = (stats.fixesByType[description] || 0) + 1;
        
        // Marquer le fichier comme modifié
        fileModified = true;
      }
    });
    
    // Si le contenu a été modifié, écrire les changements
    if (fileModified) {
      fs.writeFileSync(filePath, content);
      stats.modifiedFiles++;
      log(`Standardisé: ${path.relative(process.cwd(), filePath)}`, 'success');
    }
  } catch (error) {
    log(`Erreur dans le fichier ${filePath}: ${error.message}`, 'error');
    stats.errors++;
  }
}

// Trouver tous les fichiers JS/JSX dans les répertoires cibles
function findJSFiles() {
  return [
    ...glob.sync(`${COMPONENTS_DIR}/**/*.{js,jsx}`),
    ...glob.sync(`${PAGES_DIR}/**/*.{js,jsx}`)
  ];
}

// Fonction principale
function main() {
  log('Début de la standardisation des imports de hooks...', 'info');
  
  const jsFiles = findJSFiles();
  stats.totalFiles = jsFiles.length;
  
  jsFiles.forEach(filePath => {
    standardizeImportsInFile(filePath);
  });
  
  log('-'.repeat(50), 'info');
  log(`Statistiques:`, 'info');
  log(`Total des fichiers analysés: ${stats.totalFiles}`, 'info');
  log(`Fichiers modifiés: ${stats.modifiedFiles}`, 'success');
  
  // Afficher les statistiques par type de correction
  Object.entries(stats.fixesByType).forEach(([description, count]) => {
    log(`  ${description}: ${count} corrections`, 'info');
  });
  
  log(`Erreurs: ${stats.errors}`, 'error');
  log('-'.repeat(50), 'info');
  
  if (stats.errors > 0) {
    process.exit(1);
  }
}

// Exécution du script
main();