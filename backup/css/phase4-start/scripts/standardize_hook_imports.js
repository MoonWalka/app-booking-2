/**
 * Script pour standardiser les imports de hooks dans TourCraft
 * 
 * Ce script cherche les patterns d'import non standards comme :
 * import { useResponsive } from '@/hooks/common/useResponsive';
 * 
 * Et les convertit en imports standardisés :
 * import { useResponsive } from '@/hooks/common';
 * 
 * Usage: node scripts/standardize_hook_imports.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const COMPONENTS_DIR = path.resolve(__dirname, '../src/components');
const PAGES_DIR = path.resolve(__dirname, '../src/pages');
const HOOKS_DIR = path.resolve(__dirname, '../src/hooks');

// Regex pour trouver les imports non standards
const IMPORT_REGEX = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"](@\/hooks\/([^\/]+)\/([^'"]+))['"]/g;

// Structure pour suivre les statistiques
const stats = {
  totalFiles: 0,
  modifiedFiles: 0,
  errors: 0,
  skippedFiles: 0
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

// Fonction pour vérifier si un module existe
function checkHookExists(category, hookName) {
  const indexPath = path.resolve(HOOKS_DIR, category, 'index.js');
  
  if (!fs.existsSync(indexPath)) {
    return false;
  }
  
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Vérifie s'il y a un export correspondant au hook
  const exportRegex = new RegExp(`export\\s+(?:{[^}]*${hookName}|.*as\\s+${hookName}|\\* as ${hookName}|${hookName})`);
  return exportRegex.test(indexContent);
}

// Fonction pour standardiser les imports d'un fichier
function standardizeFileImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;
    
    // Variables pour stocker les hooks par catégorie pour regroupement
    const hooksByCategory = {};
    
    // Remplace les imports
    content = content.replace(IMPORT_REGEX, (match, namedImports, defaultImport, fullPath, category, hookFileName) => {
      // Extrait le nom du hook à partir du chemin du fichier
      const hookName = hookFileName.replace(/\.js$/, '');
      
      // Vérifie si le hook existe dans l'index
      if (!checkHookExists(category, hookName)) {
        log(`Le hook "${hookName}" n'est pas exporté dans ${category}/index.js. Skipping...`, 'warning');
        return match;
      }
      
      // Prépare le nouvel import
      const importName = namedImports || defaultImport;
      
      // Stocke pour regroupement ultérieur
      if (!hooksByCategory[category]) {
        hooksByCategory[category] = [];
      }
      hooksByCategory[category].push(importName);
      
      modified = true;
      
      // Retourne une chaîne vide car nous allons regrouper les imports plus tard
      return '';
    });
    
    // Régénère les imports regroupés
    if (modified) {
      // Ajoute les imports regroupés au début du fichier (après les autres imports)
      let additionalImports = '';
      
      for (const [category, hooks] of Object.entries(hooksByCategory)) {
        // S'il y a plusieurs hooks de la même catégorie, les regrouper
        if (hooks.length > 0) {
          // Vérifie si certains hooks sont des imports par défaut et les gère séparément
          const defaultImports = hooks.filter(h => !h.includes('{'));
          const namedImports = hooks.filter(h => h.includes('{'))
            .map(h => h.replace(/[{}]/g, '').trim())
            .join(', ');
          
          if (namedImports) {
            additionalImports += `import { ${namedImports} } from '@/hooks/${category}';\n`;
          }
          
          // Ajoute les imports par défaut séparément
          defaultImports.forEach(importName => {
            additionalImports += `import ${importName} from '@/hooks/${category}';\n`;
          });
        }
      }
      
      // Trouve l'endroit où insérer les nouveaux imports (après le dernier import)
      const lastImportIndex = content.lastIndexOf('import');
      const endOfImportsIndex = content.indexOf('\n', lastImportIndex + 1) + 1;
      
      content = content.substring(0, endOfImportsIndex) + additionalImports + content.substring(endOfImportsIndex);
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        stats.modifiedFiles++;
        log(`Standardisé: ${path.relative(process.cwd(), filePath)}`, 'success');
      }
    } else {
      stats.skippedFiles++;
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
    standardizeFileImports(filePath);
  });
  
  log('-'.repeat(50), 'info');
  log(`Statistiques:`, 'info');
  log(`Total des fichiers analysés: ${stats.totalFiles}`, 'info');
  log(`Fichiers modifiés: ${stats.modifiedFiles}`, 'success');
  log(`Fichiers ignorés: ${stats.skippedFiles}`, 'info');
  log(`Erreurs: ${stats.errors}`, 'error');
  log('-'.repeat(50), 'info');
  
  if (stats.errors > 0) {
    process.exit(1);
  }
}

// Exécution du script
main();