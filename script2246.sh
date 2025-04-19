#!/usr/bin/env node

/**
 * Script d'analyse et de correction des importations dans un projet React/Firebase
 * Amélioré pour scanner correctement tout le projet et gérer les modules externes comme Bootstrap
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration - À adapter selon votre projet
const CONFIG = {
  // Dossier racine du projet (relatif à l'emplacement de ce script)
  rootDir: process.cwd(),
  
  // Patterns de fichiers à analyser - Élargis pour inclure tous les fichiers source
  sourceFilePatterns: ['src/**/*.{js,jsx,ts,tsx}'],
  
  // Patterns de fichiers CSS à cartographier - Inclut tous les CSS, y compris node_modules si nécessaire
  cssFilePatterns: [
    'src/**/*.css',
    'node_modules/bootstrap/dist/css/bootstrap.min.css', // Bootstrap spécifiquement
    'node_modules/**/*.css' // Tous les CSS de node_modules (peut être lent)
  ],
  
  // Patterns pour d'autres ressources (hooks, components, etc.)
  hookFilePatterns: ['src/**/hooks/**/*.{js,jsx,ts,tsx}', 'src/hooks/**/*.{js,jsx,ts,tsx}'],
  componentFilePatterns: ['src/**/components/**/*.{js,jsx,ts,tsx}', 'src/components/**/*.{js,jsx,ts,tsx}'],
  firebaseFilePatterns: ['src/**/firebase/**/*.{js,jsx,ts,tsx}', 'src/firebase/**/*.{js,jsx,ts,tsx}'],
  
  // Alias définis dans votre configuration
  aliases: {
    '@styles': 'src/styles',
    '@components': 'src/components',
    '@hooks': 'src/hooks',
    '@firebase': 'src/firebase',
    // Ajoutez d'autres alias selon votre configuration
  },
  
  // Modules externes qui doivent être préservés
  externalModules: [
    'bootstrap',
    'react-bootstrap'
  ],
  
  // Mode de fonctionnement: 'analyze' ou 'fix'
  mode: 'fix',
  
  // Exécuter ESLint après les corrections
  runEslint: true,
  
  // Créer une sauvegarde des fichiers avant modification
  createBackups: true,
  
  // Verbose mode
  verbose: true,
  
  // Ignorer les vérifications d'existence pour certains modules (comme bootstrap)
  ignoreExistenceCheckForPatterns: [
    /node_modules\/bootstrap/,
    /node_modules\/react-bootstrap/
  ]
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

// Cartographier tous les fichiers disponibles
function buildResourceMap() {
  log.info('Création de la carte des ressources...');
  
  const resourceMap = {
    css: {},
    hooks: {},
    components: {},
    firebase: {},
    nodeModules: {}
  };

  // Cartographie des fichiers CSS
  const cssFiles = getFilesFromPatterns(CONFIG.cssFilePatterns);
  cssFiles.forEach(file => {
    const absolutePath = path.resolve(CONFIG.rootDir, file);
    const fileName = path.basename(file);
    resourceMap.css[fileName] = absolutePath;
    
    // Enregistrer aussi le chemin complet pour les imports comme './bootstrap/dist/css/bootstrap.min.css'
    resourceMap.css[file] = absolutePath;
    
    // Ajouter aussi sans extension pour les cas où l'extension est omise
    const fileNameWithoutExt = path.basename(file, path.extname(file));
    if (!resourceMap.css[fileNameWithoutExt]) {
      resourceMap.css[fileNameWithoutExt] = absolutePath;
    }
    
    // Pour les fichiers dans node_modules, enregistrer des formes alternatives d'import
    if (file.includes('node_modules')) {
      const parts = file.split('node_modules/');
      if (parts.length > 1) {
        resourceMap.nodeModules[parts[1]] = absolutePath;
      }
    }
  });
  
  // Cartographie des hooks
  const hookFiles = getFilesFromPatterns(CONFIG.hookFilePatterns);
  hookFiles.forEach(file => {
    const fileNameWithoutExt = path.basename(file, path.extname(file));
    const absolutePath = path.resolve(CONFIG.rootDir, file);
    resourceMap.hooks[fileNameWithoutExt] = absolutePath;
    
    // Enregistrer aussi le chemin complet
    resourceMap.hooks[file] = absolutePath;
  });
  
  // Cartographie des composants
  const componentFiles = getFilesFromPatterns(CONFIG.componentFilePatterns);
  componentFiles.forEach(file => {
    const fileNameWithoutExt = path.basename(file, path.extname(file));
    const absolutePath = path.resolve(CONFIG.rootDir, file);
    resourceMap.components[fileNameWithoutExt] = absolutePath;
    
    // Enregistrer aussi le chemin complet
    resourceMap.components[file] = absolutePath;
  });
  
  // Cartographie des fichiers Firebase
  const firebaseFiles = getFilesFromPatterns(CONFIG.firebaseFilePatterns);
  firebaseFiles.forEach(file => {
    const fileNameWithoutExt = path.basename(file, path.extname(file));
    const absolutePath = path.resolve(CONFIG.rootDir, file);
    resourceMap.firebase[fileNameWithoutExt] = absolutePath;
    
    // Enregistrer aussi le chemin complet
    resourceMap.firebase[file] = absolutePath;
  });
  
  log.success(`Ressources cartographiées: ${cssFiles.length} CSS, ${hookFiles.length} hooks, ${componentFiles.length} composants, ${firebaseFiles.length} fichiers Firebase`);
  
  return resourceMap;
}

// Vérifier si un chemin doit ignorer la vérification d'existence
function shouldIgnoreExistenceCheck(path) {
  return CONFIG.ignoreExistenceCheckForPatterns.some(pattern => pattern.test(path));
}

// Vérifier si un module est un module externe
function isExternalModule(importPath) {
  return CONFIG.externalModules.some(module => 
    importPath === module || importPath.startsWith(`${module}/`)
  );
}

// Analyser les importations dans un fichier
function analyzeImports(filePath, resourceMap) {
  const absoluteFilePath = path.resolve(CONFIG.rootDir, filePath);
  
  // Vérifier si le fichier existe
  if (!fs.existsSync(absoluteFilePath)) {
    log.warning(`Fichier non trouvé: ${absoluteFilePath}`);
    return { file: filePath, imports: [], modifiedContent: '' };
  }
  
  const fileContent = fs.readFileSync(absoluteFilePath, 'utf8');
  const directory = path.dirname(absoluteFilePath);
  
  stats.analyzedFiles++;
  
  const importResults = {
    file: filePath,
    imports: [],
    modifiedContent: fileContent
  };
  
  // Regex pour trouver les différents types d'importations
  const importRegexes = [
    // Importations CSS
    {
      pattern: /import\s+['"](.+\.css)['"]/g,
      type: 'css'
    },
    // Importations vides (problème Firebase)
    {
      pattern: /import\s+(?:{[^}]+})?\s+from\s+['"]['"](?!['"]\s*;)/g,
      type: 'empty'
    },
    // Importations relatives de hooks
    {
      pattern: /import\s+(?:{[^}]+}|\w+)\s+from\s+['"](\.[\.\/]+\/hooks\/[^'"]+)['"]/g,
      type: 'hook'
    },
    // Importations relatives de composants
    {
      pattern: /import\s+(?:{[^}]+}|\w+)\s+from\s+['"](\.[\.\/]+\/components\/[^'"]+)['"]/g,
      type: 'component'
    },
    // Importations Firebase
    {
      pattern: /import\s+(?:{[^}]+}|\w+)?\s+from\s+['"]firebase(?:\/[^'"]*)?['"]/g,
      type: 'firebase'
    },
    // Tous les autres imports relatifs
    {
      pattern: /import\s+(?:{[^}]+}|\w+)\s+from\s+['"](\.[\.\/]+\/[^'"]+)['"]/g,
      type: 'relative'
    }
  ];
  
  // Analyser chaque type d'importation
  for (const regex of importRegexes) {
    let match;
    const pattern = new RegExp(regex.pattern);
    
    while ((match = pattern.exec(fileContent)) !== null) {
      stats.totalImports++;
      
      // Traiter les importations vides (Firebase) différemment
      if (regex.type === 'empty') {
        importResults.imports.push({
          type: 'empty',
          original: match[0],
          fixed: match[0].replace(/['"](['"])/g, "'@firebase$1"),
          start: match.index,
          end: match.index + match[0].length,
          needsFix: true
        });
        continue;
      }
      
      // Traiter les importations Firebase
      if (regex.type === 'firebase') {
        const originalImport = match[0];
        
        // Si c'est une importation vide de Firebase ou un ancien format
        if (originalImport.includes("from ''") || originalImport.includes("from \"\"") || 
            originalImport.includes("from 'firebase'")) {
          
          // Déterminer le bon format Firebase v9
          let fixedImport;
          if (originalImport.includes("{")) {
            // Importer une fonctionnalité spécifique
            fixedImport = originalImport.replace(/from\s+(['"])[^'"]*\1/g, "from '@firebase/firestore'");
          } else {
            // Importer tout Firebase avec la compatibilité
            fixedImport = originalImport.replace(/from\s+(['"])[^'"]*\1/g, "from 'firebase/compat/app'");
          }
          
          importResults.imports.push({
            type: 'firebase',
            original: originalImport,
            fixed: fixedImport,
            start: match.index,
            end: match.index + originalImport.length,
            needsFix: true
          });
        }
        continue;
      }
      
      // Cas spécial pour bootstrap, préserver l'importation
      if (regex.type === 'css' && match[1].includes('bootstrap')) {
        // Ne rien faire, conserver l'import bootstrap tel quel
        continue;
      }
      
      // Traiter les importations standards (CSS, hooks, components, relative)
      if (match[1]) {
        const relativePath = match[1];
        
        // Ignorer les importations de modules externes
        if (isExternalModule(relativePath)) {
          log.debug(`Import de module externe ignoré: ${relativePath}`);
          continue;
        }
        
        // Ignorer les importations qui ne sont pas relatives
        if (!relativePath.startsWith('.')) continue;
        
        // Convertir le chemin relatif en chemin absolu
        try {
          const absoluteImportPath = path.resolve(directory, relativePath);
          const relativeToRoot = path.relative(CONFIG.rootDir, absoluteImportPath);
          
          let needsFix = false;
          let fixedImport = match[0];
          let aliasPath = null;
          
          // Déterminer l'alias approprié selon le type
          if (regex.type === 'css') {
            const fileName = path.basename(relativePath);
            if (resourceMap.css[fileName]) {
              aliasPath = `@styles/${fileName}`;
              needsFix = true;
            }
          } else if (regex.type === 'hook') {
            const hookName = path.basename(relativePath, path.extname(relativePath));
            if (resourceMap.hooks[hookName]) {
              aliasPath = `@hooks/${hookName}`;
              needsFix = true;
            }
          } else if (regex.type === 'component') {
            const componentName = path.basename(relativePath, path.extname(relativePath));
            if (resourceMap.components[componentName]) {
              if (relativePath.includes('/components/')) {
                aliasPath = `@components/${relativePath.split('/components/')[1]}`;
                needsFix = true;
              }
            }
          } else if (regex.type === 'relative') {
            // Gérer d'autres types d'importations relatives
            // Pour l'instant, nous ne faisons rien de spécial avec celles-ci
          }
          
          // Vérifier si le fichier existe réellement avant de proposer une correction
          if (aliasPath) {
            const fullAliasPath = aliasPath.replace(/^@([^/]+)/, (_, alias) => {
              return CONFIG.aliases[`@${alias}`] || `src/${alias}`;
            });
            
            const absoluteAliasPath = path.resolve(CONFIG.rootDir, fullAliasPath);
            
            // Ne corriger que si le fichier cible existe vraiment ou si on doit ignorer la vérification
            if (shouldIgnoreExistenceCheck(absoluteAliasPath) || 
                fs.existsSync(absoluteAliasPath) || 
                fs.existsSync(absoluteAliasPath + path.extname(relativePath))) {
              fixedImport = match[0].replace(relativePath, aliasPath);
            } else {
              needsFix = false;
              log.warning(`Ignoré: La cible de l'alias n'existe pas: ${absoluteAliasPath}`);
              stats.skippedImports++;
            }
          } else {
            stats.skippedImports++;
          }
          
          if (needsFix) {
            importResults.imports.push({
              type: regex.type,
              original: match[0],
              fixed: fixedImport,
              start: match.index,
              end: match.index + match[0].length,
              needsFix: true
            });
          }
        } catch (error) {
          log.error(`Erreur lors de la résolution du chemin ${relativePath} dans ${filePath}: ${error.message}`);
          stats.errorImports++;
        }
      }
    }
  }
  
  return importResults;
}

// Appliquer les corrections aux importations
function applyFixes(importResults) {
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
  
  // Ne renvoyer le contenu modifié que s'il y a des changements
  if (offset !== 0) {
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

// Fonction pour afficher les erreurs de build de manière plus lisible
function parseBuildError(error) {
  try {
    // Extraire les informations importantes des erreurs de build
    const lines = error.split('\n');
    const errorLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Module not found:') || line.includes('Error:')) {
        let errorBlock = line;
        
        // Récupérer quelques lignes de contexte
        for (let j = i + 1; j < i + 5 && j < lines.length; j++) {
          if (lines[j].trim()) {
            errorBlock += '\n  ' + lines[j].trim();
          }
        }
        
        errorLines.push(errorBlock);
        i += 5; // Sauter les lignes déjà incluses
      }
    }
    
    return errorLines.join('\n\n');
  } catch (e) {
    // En cas d'erreur dans le parsing, retourner l'erreur originale
    return error;
  }
}

// Fonction pour gérer spécifiquement l'erreur bootstrap
function fixBootstrapImport() {
  log.info('Tentative de correction de l\'importation Bootstrap...');
  
  try {
    // Chercher les fichiers qui importent bootstrap
    const sourceFiles = getFilesFromPatterns(['src/**/*.{js,jsx,ts,tsx}']);
    let fixed = false;
    
    for (const file of sourceFiles) {
      const filePath = path.resolve(CONFIG.rootDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('./bootstrap/dist/css/bootstrap.min.css')) {
        // Corriger l'importation de bootstrap
        const correctedContent = content.replace(
          './bootstrap/dist/css/bootstrap.min.css',
          'bootstrap/dist/css/bootstrap.min.css'
        );
        
        if (content !== correctedContent) {
          // Créer une sauvegarde
          if (CONFIG.createBackups) {
            fs.copyFileSync(filePath, `${filePath}.backup`);
          }
          
          // Écrire le contenu corrigé
          fs.writeFileSync(filePath, correctedContent);
          log.success(`Correction de l'importation Bootstrap dans ${file}`);
          fixed = true;
        }
      }
    }
    
    return fixed;
  } catch (error) {
    log.error(`Erreur lors de la correction de Bootstrap: ${error.message}`);
    return false;
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
    
    // Si l'erreur concerne bootstrap, essayer de la corriger
    if (errorOutput.includes('bootstrap') && errorOutput.includes('Module not found')) {
      log.info('Détection d\'une erreur Bootstrap, tentative de correction automatique...');
      const fixed = fixBootstrapImport();
      
      if (fixed) {
        // Réessayer le build
        log.info('Réessai du build après correction de Bootstrap...');
        try {
          const hasYarn = fs.existsSync(path.join(CONFIG.rootDir, 'yarn.lock'));
          const buildCommand = hasYarn ? 'yarn build' : 'npm run build';
          
          const result = execSync(buildCommand, { 
            cwd: CONFIG.rootDir,
            stdio: 'pipe',
            encoding: 'utf-8'
          });
          
          log.success('Build réussi après correction de Bootstrap!');
          return { success: true, output: result };
        } catch (retryError) {
          return { 
            success: false, 
            output: parseBuildError(retryError.stdout || retryError.message),
            correctionAttempted: true
          };
        }
      }
    }
    
    return { 
      success: false, 
      output: parseBuildError(errorOutput)
    };
  }
}

// Fonction principale
async function main() {
  log.info('Démarrage de l\'analyse des importations...');
  
  // Construire la carte des ressources
  const resourceMap = buildResourceMap();
  
  // Obtenir tous les fichiers à analyser
  const sourceFiles = getFilesFromPatterns(CONFIG.sourceFilePatterns);
  stats.totalFiles = sourceFiles.length;
  
  log.info(`Analyse de ${sourceFiles.length} fichiers source...`);
  
  // Analyser et corriger chaque fichier
  for (const file of sourceFiles) {
    const results = analyzeImports(file, resourceMap);
    
    if (results.imports.length > 0) {
      log.debug(`${file}: ${results.imports.length} importations trouvées`);
      
      if (CONFIG.mode === 'fix') {
        const fixedContent = applyFixes(results);
        
        if (fixedContent) {
          writeFixedFiles(file, fixedContent);
        }
      }
    }
  }
  
  // Essayer de corriger l'importation de Bootstrap si nécessaire
  if (CONFIG.mode === 'fix') {
    fixBootstrapImport();
  }
  
  // Afficher les statistiques
  console.log('\n' + chalk.bold('Rapport d\'analyse des importations:'));
  console.log(`- Fichiers analysés: ${stats.analyzedFiles}/${stats.totalFiles}`);
  console.log(`- Fichiers modifiés: ${stats.modifiedFiles}`);
  console.log(`- Importations analysées: ${stats.totalImports}`);
  console.log(`- Importations corrigées: ${stats.fixedImports}`);
  console.log(`- Importations ignorées: ${stats.skippedImports}`);
  console.log(`- Erreurs: ${stats.errorImports}`);
  
  // Exécuter ESLint si configuré
  if (CONFIG.runEslint && CONFIG.mode === 'fix') {
    const eslintResult = runEslintCheck();
    
    if (!eslintResult.success) {
      console.log('\n' + chalk.yellow.bold('Erreurs ESLint:'));
      console.log(eslintResult.output);
    }
  }
  
  // Tester un build si en mode correction
  if (CONFIG.mode === 'fix') {
    const buildResult = tryBuild();
    
    if (!buildResult.success) {
      console.log('\n' + chalk.red.bold('Erreurs de build:'));
      console.log(buildResult.output);
    }
  }
  
  log.info('Analyse terminée!');
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
    else if (arg === '--no-eslint') {
      CONFIG.runEslint = false;
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
