/**
 * Script pour corriger tous les imports par défaut restants
 * 
 * Ce script recherche tous les imports de hooks qui utilisent la syntaxe par défaut
 * alors qu'ils devraient utiliser la syntaxe d'export nommé.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const COMPONENTS_DIR = path.resolve(SRC_DIR, 'components');
const HOOKS_DIR = path.resolve(SRC_DIR, 'hooks');
const PAGES_DIR = path.resolve(SRC_DIR, 'pages');

// Définir les hooks à corriger par dossier
const hooksToFix = {
  'lieux': [
    'useLieuDetails',
    'useLieuxQuery',
    'useLieuxFilters',
    'useLieuDelete'
  ],
  'parametres': [
    'useEntrepriseForm'
  ],
  'programmateurs': [
    'useProgrammateurDetails',
    'useAdresseValidation',
    'useCompanySearch',
    'useLieuSearch'
  ],
  'structures': [
    'useDeleteStructure',
    'useStructureForm',
    'useStructureValidation'
  ],
  'common': [
    'useAddressSearch',
    'useEntitySearch'
  ],
  'forms': [
    'useFormTokenValidation',
    'useAdminFormValidation',
    'useFormValidation'
  ],
  'contrats': [
    'contractVariables'
  ]
};

// Structure pour suivre les statistiques
const stats = {
  totalFiles: 0,
  modifiedFiles: 0,
  errors: 0,
  fixesByHook: {}
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

// Fonction pour corriger les imports par défaut dans un fichier
function fixDefaultImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileModified = false;

    // Pour chaque catégorie de hooks
    Object.entries(hooksToFix).forEach(([category, hooks]) => {
      hooks.forEach(hookName => {
        // Pour les imports par défaut des hooks spécifiques
        const patternDirectDefault = new RegExp(`import\\s+${hookName}\\s+from\\s+(['"])@/hooks/${category}/(\\w+)\\1`, 'g');
        if (patternDirectDefault.test(content)) {
          content = content.replace(patternDirectDefault, `import { ${hookName} } from $1@/hooks/${category}$1`);
          stats.fixesByHook[hookName] = (stats.fixesByHook[hookName] || 0) + 1;
          fileModified = true;
        }

        // Pour les imports par défaut depuis le dossier principal
        const patternIndexDefault = new RegExp(`import\\s+${hookName}\\s+from\\s+(['"])@/hooks/${category}\\1`, 'g');
        if (patternIndexDefault.test(content)) {
          content = content.replace(patternIndexDefault, `import { ${hookName} } from $1@/hooks/${category}$1`);
          stats.fixesByHook[hookName] = (stats.fixesByHook[hookName] || 0) + 1;
          fileModified = true;
        }
      });
    });

    // Pour les fichiers d'index des hooks qui font des re-exports par défaut
    if (filePath.includes('/hooks/') && path.basename(filePath) === 'index.js') {
      Object.entries(hooksToFix).forEach(([category, hooks]) => {
        if (filePath.includes(`/hooks/${category}/`)) {
          hooks.forEach(hookName => {
            const patternDefaultReExport = new RegExp(`export\\s+\\{\\s+default\\s+as\\s+${hookName}\\s+\\}\\s+from\\s+(['"])\\./\\w+\\1`, 'g');
            if (patternDefaultReExport.test(content)) {
              // Remplacer les re-exports par défaut par des re-exports nommés
              content = content.replace(patternDefaultReExport, `export { ${hookName} } from $1./${hookName}$1`);
              stats.fixesByHook[hookName] = (stats.fixesByHook[hookName] || 0) + 1;
              fileModified = true;
            }
          });
        }
      });
    }

    // Si le contenu a été modifié, écrire les changements
    if (fileModified) {
      fs.writeFileSync(filePath, content);
      stats.modifiedFiles++;
      log(`Corrigé: ${path.relative(process.cwd(), filePath)}`, 'success');
    }
  } catch (error) {
    log(`Erreur dans le fichier ${filePath}: ${error.message}`, 'error');
    stats.errors++;
  }
}

// Trouver tous les fichiers JS/JSX à traiter
function findFilesToFix() {
  return [
    ...glob.sync(`${COMPONENTS_DIR}/**/*.{js,jsx}`),
    ...glob.sync(`${HOOKS_DIR}/**/*.js`),
    ...glob.sync(`${PAGES_DIR}/**/*.{js,jsx}`)
  ];
}

// Fonction principale
function main() {
  log('Début de la correction des imports par défaut restants...', 'info');
  
  const jsFiles = findFilesToFix();
  stats.totalFiles = jsFiles.length;
  
  jsFiles.forEach(filePath => {
    fixDefaultImportsInFile(filePath);
  });
  
  log('-'.repeat(50), 'info');
  log(`Statistiques:`, 'info');
  log(`Total des fichiers analysés: ${stats.totalFiles}`, 'info');
  log(`Fichiers modifiés: ${stats.modifiedFiles}`, 'success');
  
  // Afficher les statistiques par hook
  log(`Hooks corrigés:`, 'info');
  Object.entries(stats.fixesByHook).forEach(([hookName, count]) => {
    log(`  ${hookName}: ${count} occurrences`, 'info');
  });
  
  log(`Erreurs: ${stats.errors}`, 'error');
  log('-'.repeat(50), 'info');
  
  if (stats.errors > 0) {
    process.exit(1);
  }
}

// Exécution du script
main();