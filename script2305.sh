#!/usr/bin/env node

/**
 * Script de correction des importations Firebase
 * 
 * Ce script se concentre spécifiquement sur la correction des problèmes d'importation Firebase
 * dans votre projet React, y compris les chemins relatifs incorrects et les imports vides.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  rootDir: process.cwd(),
  sourceFilePatterns: ['src/**/*.{js,jsx,ts,tsx}'],
  firebaseFilePatterns: ['src/firebase/**/*.{js,jsx,ts,tsx}'],
  verbose: true,
  createBackups: true,
  mode: 'fix',
  
  // Mappages des imports Firebase spécifiques
  firebaseImportMappings: {
    // Chemins relatifs incorrects vers leurs chemins corrects
    './firebase/auth': 'firebase/auth',
    './firebase/firestore': 'firebase/firestore',
    './firebase/storage': 'firebase/storage',
    './firebase/app': 'firebase/app',
    '../firebase/auth': 'firebase/auth',
    '../firebase/firestore': 'firebase/firestore',
    '../firebase/storage': 'firebase/storage',
    '../firebase/app': 'firebase/app',
    '../../firebase/auth': 'firebase/auth',
    '../../firebase/firestore': 'firebase/firestore',
    '../../firebase/storage': 'firebase/storage',
    '../../firebase/app': 'firebase/app',
    
    // Imports Firebase v8 vers v9
    'firebase': 'firebase/compat/app',
    '': 'firebase/compat/app',  // Pour les imports vides
  },
  
  // Fonctions Firebase spécifiques manquantes à importer
  firebaseFunctionsToFix: {
    'query': 'firebase/firestore',
    'where': 'firebase/firestore',
    'limit': 'firebase/firestore',
    'getDocs': 'firebase/firestore',
    'formatDate': './utils/dateUtils', // Fonction utilitaire personnalisée
    'getNbConcerts': './utils/concertUtils', // Fonction utilitaire personnalisée
    'handleDelete': './handlers/deleteHandler', // Fonction de gestionnaire personnalisée
    'handleLoadMore': './handlers/paginationHandler', // Fonction de gestionnaire personnalisée
    'filteredArtistes': 'artistes', // Variable référencée mais non définie
  }
};

// Compteurs pour les statistiques
const stats = {
  totalFiles: 0,
  analyzedFiles: 0,
  modifiedFiles: 0,
  totalImports: 0,
  fixedImports: 0,
  skippedImports: 0,
  errorImports: 0,
  missingFirebaseFunctions: 0,
  eslintErrors: 0
};

// Log avec couleurs
const log = {
  info: (msg) => console.log(chalk.blue('INFO: ') + msg),
  success: (msg) => console.log(chalk.green('SUCCESS: ') + msg),
  warning: (msg) => console.log(chalk.yellow('WARNING: ') + msg),
  error: (msg) => console.log(chalk.red('ERROR: ') + msg),
  debug: (msg) => CONFIG.verbose && console.log(chalk.gray('DEBUG: ') + msg)
};

// Fonction pour obtenir tous les fichiers correspondant à des patterns
function getFilesFromPatterns(patterns) {
  return patterns.reduce((allFiles, pattern) => {
    log.debug(`Recherche des fichiers avec pattern: ${pattern}`);
    const files = glob.sync(pattern, { 
      cwd: CONFIG.rootDir,
      nodir: true,
      silent: true,
      follow: true  // Suivre les liens symboliques
    });
    log.debug(`${files.length} fichiers trouvés pour pattern: ${pattern}`);
    return [...allFiles, ...files];
  }, []);
}

// Analyser les importations Firebase dans un fichier
function analyzeFirebaseImports(filePath) {
  const absoluteFilePath = path.resolve(CONFIG.rootDir, filePath);
  
  // Vérifier si le fichier existe
  if (!fs.existsSync(absoluteFilePath)) {
    log.warning(`Fichier non trouvé: ${absoluteFilePath}`);
    return { file: filePath, imports: [], modifiedContent: '' };
  }
  
  const fileContent = fs.readFileSync(absoluteFilePath, 'utf8');
  
  stats.analyzedFiles++;
  
  const importResults = {
    file: filePath,
    imports: [],
    modifiedContent: fileContent,
    missingFunctions: []
  };
  
  // Regex pour trouver les différents types d'importations Firebase
  const importRegexes = [
    // Importations Firebase avec chemins relatifs
    {
      pattern: /import\s+(?:{[^}]+}|\w+)?\s+from\s+['"](\.+\/firebase(?:\/[^'"]*)?)['"]/g,
      type: 'firebase-relative'
    },
    // Importations Firebase standard
    {
      pattern: /import\s+(?:{[^}]+}|\w+)?\s+from\s+['"]firebase(?:\/[^'"]*)?['"]/g,
      type: 'firebase'
    },
    // Importations vides (problème Firebase)
    {
      pattern: /import\s+(?:{[^}]+})?\s+from\s+['"]['"](?!['"]\s*;)/g,
      type: 'empty'
    }
  ];
  
  // Analyser chaque type d'importation
  for (const regex of importRegexes) {
    let match;
    const pattern = new RegExp(regex.pattern);
    
    while ((match = pattern.exec(fileContent)) !== null) {
      stats.totalImports++;
      
      const originalImport = match[0];
      let needsFix = false;
      let fixedImport = originalImport;
      
      if (regex.type === 'firebase-relative' && match[1]) {
        const relativePath = match[1];
        if (CONFIG.firebaseImportMappings[relativePath]) {
          // Remplacer le chemin relatif par le bon chemin
          fixedImport = originalImport.replace(relativePath, CONFIG.firebaseImportMappings[relativePath]);
          needsFix = true;
        }
      } else if (regex.type === 'firebase') {
        // Vérifier si c'est une importation Firebase v8 à mettre à jour
        if (originalImport.includes("from 'firebase'")) {
          fixedImport = originalImport.replace(/from\s+['"]firebase['"]/g, "from 'firebase/compat/app'");
          fixedImport += "\nimport 'firebase/compat/firestore';";
          needsFix = true;
        }
      } else if (regex.type === 'empty') {
        // Corriger les imports vides
        fixedImport = originalImport.replace(/from\s+['"](['"]])/g, "from 'firebase/compat/app'$1");
        fixedImport += "\nimport 'firebase/compat/firestore';";
        needsFix = true;
      }
      
      if (needsFix) {
        importResults.imports.push({
          type: regex.type,
          original: originalImport,
          fixed: fixedImport,
          start: match.index,
          end: match.index + originalImport.length,
          needsFix: true
        });
      }
    }
  }
  
  // Vérifier les fonctions Firebase manquantes référencées dans le fichier
  for (const [funcName, importPath] of Object.entries(CONFIG.firebaseFunctionsToFix)) {
    // Rechercher les utilisations de la fonction qui n'est pas importée
    const functionRegex = new RegExp(`\\b${funcName}\\b`, 'g');
    const importRegex = new RegExp(`import\\s+[^;]*\\b${funcName}\\b[^;]*;`, 'g');
    
    if (functionRegex.test(fileContent) && !importRegex.test(fileContent)) {
      // La fonction est utilisée mais pas importée
      importResults.missingFunctions.push({
        name: funcName,
        importPath: importPath
      });
      stats.missingFirebaseFunctions++;
    }
  }
  
  return importResults;
}

// Appliquer les corrections aux importations
function applyFirebaseFixes(importResults) {
  let content = importResults.modifiedContent;
  let offset = 0;
  
  // Trier les importations par position pour éviter les problèmes de décalage
  const sortedImports = [...importResults.imports].sort((a, b) => a.start - b.start);
  
  for (const importInfo of sortedImports) {
    if (importInfo.needsFix) {
      // Appliquer le correctif avec l'offset
      content = content.substring(0, importInfo.start + offset) + 
                importInfo.fixed + 
                content.substring(importInfo.end + offset);
      
      // Ajuster l'offset pour les prochaines modifications
      offset += importInfo.fixed.length - importInfo.original.length;
      
      stats.fixedImports++;
      log.debug(`${importResults.file}: ${importInfo.original} -> ${importInfo.fixed}`);
    }
  }
  
  // Ajouter les imports pour les fonctions manquantes
  if (importResults.missingFunctions.length > 0) {
    // Trouver la position du dernier import pour ajouter après
    const lastImportMatch = content.match(/import\s+[^;]*;/g);
    let insertPosition = 0;
    
    if (lastImportMatch && lastImportMatch.length > 0) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      insertPosition = content.indexOf(lastImport) + lastImport.length;
    }
    
    // Regrouper les imports par chemin
    const importsByPath = {};
    importResults.missingFunctions.forEach(func => {
      if (!importsByPath[func.importPath]) {
        importsByPath[func.importPath] = [];
      }
      importsByPath[func.importPath].push(func.name);
    });
    
    // Générer les nouvelles lignes d'import
    let newImports = '\n';
    for (const [importPath, functions] of Object.entries(importsByPath)) {
      newImports += `import { ${functions.join(', ')} } from '${importPath}';\n`;
    }
    
    // Insérer les nouvelles importations
    content = content.substring(0, insertPosition) + 
              newImports + 
              content.substring(insertPosition);
    
    offset += newImports.length;
  }
  
  // Ne renvoyer le contenu modifié que s'il y a des changements
  if (offset !== 0 || importResults.missingFunctions.length > 0) {
    stats.modifiedFiles++;
    return content;
  }
  
  return null;
}

// Écrire les fichiers corrigés
function writeFixedFiles(filePath, newContent) {
  const absoluteFilePath = path.resolve(CONFIG.rootDir, filePath);
  
  // Créer une sauvegarde si configuré
  if (CONFIG.createBackups) {
    const backupPath = `${absoluteFilePath}.backup`;
    fs.copyFileSync(absoluteFilePath, backupPath);
    log.debug(`Sauvegarde créée: ${backupPath}`);
  }
  
  // Écrire le nouveau contenu
  fs.writeFileSync(absoluteFilePath, newContent);
  log.success(`Fichier modifié: ${filePath}`);
}

// Fonction pour exécuter ESLint et capturer les erreurs
function runEslintCheck() {
  log.info('Exécution d\'ESLint pour vérifier les changements...');
  
  try {
    // Exécuter ESLint en mode vérification seulement (sans correction)
    const result = execSync('npx eslint src --max-warnings=0', { 
      cwd: CONFIG.rootDir,
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    log.success('ESLint a validé les changements sans erreurs!');
    return { success: true, output: result };
  } catch (error) {
    stats.eslintErrors = (error.stdout.match(/error/g) || []).length;
    log.warning(`ESLint a trouvé ${stats.eslintErrors} erreurs après les modifications.`);
    return { success: false, output: error.stdout };
  }
}

// Fonction pour exécuter une tentative de build
function tryBuild() {
  log.info('Tentative de build pour vérifier les changements...');
  
  try {
    // Utiliser npm run build ou yarn build selon ce qui est disponible
    const hasYarn = fs.existsSync(path.join(CONFIG.rootDir, 'yarn.lock'));
    const buildCommand = hasYarn ? 'yarn build' : 'npm run build';
    
    const result = execSync(buildCommand, { 
      cwd: CONFIG.rootDir,
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    log.success('Build réussi!');
    return { success: true, output: result };
  } catch (error) {
    const errorOutput = error.stdout || error.message;
    log.error('Échec du build après les modifications.');
    
    // Essayer d'extraire l'erreur spécifique
    let errorMessage = errorOutput;
    try {
      const moduleNotFoundMatch = errorOutput.match(/Module not found: Error: Can't resolve '([^']+)'/);
      if (moduleNotFoundMatch && moduleNotFoundMatch[1]) {
        errorMessage = `Module non trouvé: ${moduleNotFoundMatch[1]}`;
      }
    } catch (e) {
      // Ignorer les erreurs d'analyse
    }
    
    return { 
      success: false, 
      output: errorMessage
    };
  }
}

// Corriger le fichier contexte Firebase spécifique
function fixFirebaseContextFile() {
  const contextFilePath = path.join(CONFIG.rootDir, 'src/context/FirebaseContext.js');
  // On vérifie aussi avec .jsx au cas où
  const contextFilePathJSX = path.join(CONFIG.rootDir, 'src/context/FirebaseContext.jsx');
  
  let actualPath = null;
  
  if (fs.existsSync(contextFilePath)) {
    actualPath = contextFilePath;
  } else if (fs.existsSync(contextFilePathJSX)) {
    actualPath = contextFilePathJSX;
  } else {
    // Chercher tous les fichiers contexte qui pourraient importer Firebase auth
    const contextFiles = glob.sync('src/context/*.{js,jsx}', { cwd: CONFIG.rootDir });
    
    for (const file of contextFiles) {
      const content = fs.readFileSync(path.join(CONFIG.rootDir, file), 'utf8');
      if (content.includes('./firebase/auth') || content.includes('../firebase/auth')) {
        actualPath = path.join(CONFIG.rootDir, file);
        break;
      }
    }
  }
  
  if (!actualPath) {
    log.warning('Fichier contexte Firebase non trouvé.');
    return false;
  }
  
  log.info(`Correction du fichier contexte Firebase: ${actualPath}`);
  
  // Lire le contenu du fichier
  const content = fs.readFileSync(actualPath, 'utf8');
  
  // Remplacer les importations Firebase problématiques
  let modifiedContent = content;
  
  // Remplacer ./firebase/auth par firebase/auth
  modifiedContent = modifiedContent.replace(
    /import\s+(?:{[^}]+}|\w+)?\s+from\s+['"](\.+\/firebase\/auth)['"]/g,
    "import { getAuth } from 'firebase/auth'"
  );
  
  // Remplacer ./firebase/firestore par firebase/firestore
  modifiedContent = modifiedContent.replace(
    /import\s+(?:{[^}]+}|\w+)?\s+from\s+['"](\.+\/firebase\/firestore)['"]/g,
    "import { getFirestore } from 'firebase/firestore'"
  );
  
  // Remplacer ./firebase/app par firebase/app
  modifiedContent = modifiedContent.replace(
    /import\s+(?:{[^}]+}|\w+)?\s+from\s+['"](\.+\/firebase\/app)['"]/g,
    "import { initializeApp } from 'firebase/app'"
  );
  
  // Si le contenu a été modifié, écrire le nouveau contenu
  if (content !== modifiedContent) {
    // Créer une sauvegarde
    if (CONFIG.createBackups) {
      fs.copyFileSync(actualPath, `${actualPath}.backup`);
    }
    
    // Écrire le nouveau contenu
    fs.writeFileSync(actualPath, modifiedContent);
    log.success(`Fichier contexte Firebase corrigé: ${actualPath}`);
    return true;
  }
  
  log.info('Aucune modification nécessaire pour le fichier contexte Firebase.');
  return false;
}

// Fonction principale
async function main() {
  log.info('Démarrage de l\'analyse des importations Firebase...');
  
  // Corriger d'abord le fichier contexte Firebase spécifique
  const contextFixed = fixFirebaseContextFile();
  
  // Obtenir tous les fichiers à analyser
  const sourceFiles = getFilesFromPatterns(CONFIG.sourceFilePatterns);
  stats.totalFiles = sourceFiles.length;
  
  log.info(`Analyse de ${sourceFiles.length} fichiers source pour les importations Firebase...`);
  
  // Analyser et corriger chaque fichier
  for (const file of sourceFiles) {
    const results = analyzeFirebaseImports(file);
    
    if (results.imports.length > 0 || results.missingFunctions.length > 0) {
      if (results.imports.length > 0) {
        log.debug(`${file}: ${results.imports.length} importations Firebase trouvées`);
      }
      
      if (results.missingFunctions.length > 0) {
        log.debug(`${file}: ${results.missingFunctions.length} fonctions Firebase manquantes`);
      }
      
      if (CONFIG.mode === 'fix') {
        const fixedContent = applyFirebaseFixes(results);
        
        if (fixedContent) {
          writeFixedFiles(file, fixedContent);
        }
      }
    }
  }
  
  // Afficher les statistiques
  console.log('\n' + chalk.bold('Rapport d\'analyse des importations Firebase:'));
  console.log(`- Fichiers analysés: ${stats.analyzedFiles}/${stats.totalFiles}`);
  console.log(`- Fichiers modifiés: ${stats.modifiedFiles}`);
  console.log(`- Importations analysées: ${stats.totalImports}`);
  console.log(`- Importations corrigées: ${stats.fixedImports}`);
  console.log(`- Fonctions Firebase manquantes: ${stats.missingFirebaseFunctions}`);
  console.log(`- Importations ignorées: ${stats.skippedImports}`);
  console.log(`- Erreurs: ${stats.errorImports}`);
  
  // Tester un build si en mode correction
  if (CONFIG.mode === 'fix') {
    const buildResult = tryBuild();
    
    if (!buildResult.success) {
      console.log('\n' + chalk.red.bold('Erreurs de build:'));
      console.log(buildResult.output);
    }
  }
  
  log.info('Analyse Firebase terminée!');
}

// Traiter les arguments de ligne de commande
function processArgs() {
  // Analyser les arguments
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--mode=')) {
      CONFIG.mode = arg.split('=')[1];
    }
    else if (arg === '--verbose') {
      CONFIG.verbose = true;
    }
    else if (arg === '--no-backups') {
      CONFIG.createBackups = false;
    }
  }
}

// Exécuter le script
processArgs();
main().catch(error => {
  log.error(`Erreur lors de l'exécution du script: ${error.message}`);
  console.error(error);
  process.exit(1);
});
