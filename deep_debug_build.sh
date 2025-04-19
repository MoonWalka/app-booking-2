
#!/bin/bash

# Couleurs pour meilleure lisibilité
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Créer un dossier pour les rapports
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="deep_diagnostic_report_$TIMESTAMP"
mkdir -p "$REPORT_DIR"

LOG_FILE="$REPORT_DIR/diagnostic_log.txt"
ERROR_LOG="$REPORT_DIR/error_log.txt"
BUILD_TRANSCRIPT="$REPORT_DIR/build_transcript.txt"
MODULE_REPORT="$REPORT_DIR/module_analysis.txt"
WEBPACK_CONFIG="$REPORT_DIR/webpack_config.txt"
SUMMARY_FILE="$REPORT_DIR/summary.md"

# Fonction pour logger
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}$1${NC}" | tee -a "$ERROR_LOG"
    log "$1"
}

# Fonction pour vérifier si une commande existe
check_command() {
    if ! command -v $1 &> /dev/null; then
        log "${YELLOW}Installation de $1...${NC}"
        npm install -g $1 --quiet
    fi
}

# En-tête du rapport
log "${PURPLE}=====================================${NC}"
log "${PURPLE}    DIAGNOSTIC APPROFONDI DU BUILD    ${NC}"
log "${PURPLE}=====================================${NC}\n"

log "Date: $(date)"
log "Projet: $(basename $(pwd))"
log "Créé par: Script de diagnostic approfondi v1.0\n"

# PHASE 1: PRÉPARATION ET INSTALLATION DES OUTILS
log "${BLUE}=== PHASE 1: PRÉPARATION ===${NC}"

# Vérification des outils nécessaires
log "${YELLOW}Installation des outils de diagnostic...${NC}"
check_command eslint
check_command webpack
check_command madge
check_command chalk
check_command prettier

# Installation des dépendances nécessaires pour le diagnostic
log "${YELLOW}Installation des dépendances de diagnostic...${NC}"
npm install --no-save \
  eslint eslint-plugin-import eslint-plugin-react \
  webpack-bundle-analyzer webpack-cli \
  source-map-explorer open \
  eslint-import-resolver-alias \
  &> /dev/null

log "${GREEN}✓ Préparation complète${NC}\n"

# PHASE 2: AUDIT DES CONFIGURATIONS ET DES DÉPENDANCES
log "${BLUE}=== PHASE 2: AUDIT DES CONFIGURATIONS ===${NC}"

# Créer un script pour analyser package.json
cat > "$REPORT_DIR/analyze_package.js" << 'EOL'
const fs = require('fs');
const path = require('path');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  const scripts = packageJson.scripts || {};
  
  // Vérification des versions React
  const reactVersion = dependencies.react;
  const reactDomVersion = dependencies['react-dom'];
  const cracoVersion = dependencies['@craco/craco'];
  const reactScriptsVersion = dependencies['react-scripts'];
  const firebaseVersion = dependencies.firebase;
  
  console.log("=== ANALYSE DES DÉPENDANCES ===");
  console.log(`React: ${reactVersion}`);
  console.log(`React DOM: ${reactDomVersion}`);
  console.log(`CRACO: ${cracoVersion}`);
  console.log(`React Scripts: ${reactScriptsVersion}`);
  console.log(`Firebase: ${firebaseVersion}`);
  
  // Vérification des compatibilités
  const issues = [];
  
  // Vérifier compatibilité React/React DOM
  if (reactVersion && reactDomVersion) {
    const reactMajor = reactVersion.match(/^\^?(\d+)\./)[1];
    const reactDomMajor = reactDomVersion.match(/^\^?(\d+)\./)[1];
    if (reactMajor !== reactDomMajor) {
      issues.push(`Incompatibilité: React v${reactMajor}.x avec React DOM v${reactDomMajor}.x`);
    }
  }
  
  // Vérifier compatibilité CRACO/React Scripts
  if (cracoVersion && reactScriptsVersion) {
    const cracoMajor = cracoVersion.match(/^\^?(\d+)\./)[1];
    const reactScriptsMajor = reactScriptsVersion.match(/^\^?(\d+)\./)[1];
    
    if (cracoMajor === '7' && reactScriptsMajor !== '5') {
      issues.push(`Incompatibilité: CRACO v7.x nécessite React Scripts v5.x`);
    } else if (cracoMajor === '6' && reactScriptsMajor !== '4') {
      issues.push(`Incompatibilité: CRACO v6.x nécessite React Scripts v4.x`);
    } else if (cracoMajor === '5' && reactScriptsMajor !== '3') {
      issues.push(`Incompatibilité: CRACO v5.x nécessite React Scripts v3.x`);
    }
  }
  
  // Vérification du script de build
  const buildScript = scripts.build;
  console.log(`\nScript de build: ${buildScript}`);
  
  if (buildScript && buildScript.includes('craco') && !dependencies['@craco/craco']) {
    issues.push("Le script de build utilise craco mais @craco/craco n'est pas dans les dépendances");
  }
  
  // Résultat
  if (issues.length > 0) {
    console.log("\n=== PROBLÈMES DÉTECTÉS ===");
    issues.forEach(issue => {
      console.log(`! ${issue}`);
    });
  } else {
    console.log("\n✓ Aucun problème de compatibilité détecté dans package.json");
  }
  
  // Analyse des dépendances Firebase
  if (firebaseVersion) {
    console.log("\n=== ANALYSE FIREBASE ===");
    const firebaseMajor = firebaseVersion.match(/^\^?(\d+)\./)[1];
    const firebaseMinor = firebaseVersion.match(/^\^?\d+\.(\d+)\./)[1];
    
    if (firebaseMajor === '9') {
      if (parseInt(firebaseMinor) >= 22) {
        console.log("! Firebase v9.22+ peut avoir des problèmes avec webpack, essayez v9.17.2");
      } else {
        console.log("✓ Version Firebase compatible");
      }
    } else if (parseInt(firebaseMajor) < 9) {
      console.log("! Ancienne version de Firebase (< v9), pourrait causer des incompatibilités");
    }
    
    // Vérification des dépendances Firebase nécessaires
    const neededDeps = ['@firebase/app', '@firebase/firestore', '@firebase/auth', '@firebase/storage'];
    const missingDeps = neededDeps.filter(dep => !dependencies[dep]);
    
    if (firebaseMajor === '9' && missingDeps.length > 0) {
      console.log(`! Firebase v9 pourrait nécessiter ces dépendances: ${missingDeps.join(', ')}`);
    }
  }

} catch (error) {
  console.error("Erreur lors de l'analyse de package.json:", error.message);
}
EOL

# Exécuter l'analyse de package.json
log "${YELLOW}Analyse de package.json...${NC}"
node "$REPORT_DIR/analyze_package.js" | tee -a "$MODULE_REPORT"

# Vérification des fichiers de configuration
log "\n${YELLOW}Vérification des fichiers de configuration webpack...${NC}"

# Créer un script pour extraire la configuration webpack via craco
cat > "$REPORT_DIR/extract_webpack_config.js" << 'EOL'
const path = require('path');
const fs = require('fs');

try {
  // Vérifier si le fichier craco.config.js existe
  if (fs.existsSync('./craco.config.js')) {
    console.log("=== ANALYSE DE CRACO.CONFIG.JS ===");
    
    // Charger la configuration craco
    let cracoConfig;
    try {
      cracoConfig = require(path.resolve('./craco.config.js'));
      console.log("✓ craco.config.js chargé avec succès");
      
      // Vérifier la présence d'alias webpack
      if (cracoConfig.webpack && cracoConfig.webpack.alias) {
        console.log("\n=== ALIAS WEBPACK DÉTECTÉS ===");
        Object.entries(cracoConfig.webpack.alias).forEach(([alias, target]) => {
          console.log(`${alias} -> ${target}`);
          
          // Vérifier si le chemin cible existe
          const targetPath = typeof target === 'string' ? target : target.toString();
          if (!fs.existsSync(targetPath.replace('__dirname', '.'))) {
            console.log(`! ATTENTION: Le chemin cible ${targetPath} pourrait ne pas exister`);
          }
        });
      } else {
        console.log("! Aucun alias webpack défini dans craco.config.js");
      }
      
      // Vérifier la présence d'autres configurations webpack
      if (cracoConfig.webpack) {
        const webpackKeys = Object.keys(cracoConfig.webpack).filter(k => k !== 'alias');
        if (webpackKeys.length > 0) {
          console.log("\n=== AUTRES CONFIGURATIONS WEBPACK ===");
          console.log(`Clés configurées: ${webpackKeys.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.log(`! ERREUR lors du chargement de craco.config.js: ${error.message}`);
      const cracoContent = fs.readFileSync('./craco.config.js', 'utf8');
      console.log("\nContenu du fichier:\n```\n" + cracoContent + "\n```");
    }
  } else {
    console.log("! Fichier craco.config.js non trouvé");
  }
  
  // Vérifier jsconfig.json
  if (fs.existsSync('./jsconfig.json')) {
    console.log("\n=== ANALYSE DE JSCONFIG.JSON ===");
    
    let jsConfig;
    try {
      jsConfig = JSON.parse(fs.readFileSync('./jsconfig.json', 'utf8'));
      console.log("✓ jsconfig.json chargé avec succès");
      
      // Vérifier les paths
      if (jsConfig.compilerOptions && jsConfig.compilerOptions.paths) {
        console.log("\n=== PATHS JSCONFIG DÉTECTÉS ===");
        Object.entries(jsConfig.compilerOptions.paths).forEach(([alias, targets]) => {
          console.log(`${alias} -> ${targets.join(', ')}`);
        });
        
        // Vérifier la cohérence avec craco.config.js
        if (cracoConfig && cracoConfig.webpack && cracoConfig.webpack.alias) {
          console.log("\n=== COHÉRENCE AVEC CRACO.CONFIG.JS ===");
          
          const cracoAliases = Object.keys(cracoConfig.webpack.alias);
          const jsConfigAliases = Object.keys(jsConfig.compilerOptions.paths);
          
          // Recherche des différences
          const differences = [];
          
          // Vérifier les alias présents dans jsconfig mais pas dans craco
          jsConfigAliases.forEach(alias => {
            const baseAlias = alias.endsWith('/*') ? alias.slice(0, -2) : alias;
            if (!cracoAliases.includes(baseAlias) && !cracoAliases.includes(`${baseAlias}/*`)) {
              differences.push(`! Alias "${alias}" présent dans jsconfig.json mais pas dans craco.config.js`);
            }
          });
          
          // Vérifier les alias présents dans craco mais pas dans jsconfig
          cracoAliases.forEach(alias => {
            const baseAlias = alias.endsWith('/*') ? alias.slice(0, -2) : alias;
            if (!jsConfigAliases.includes(baseAlias) && !jsConfigAliases.includes(`${baseAlias}/*`)) {
              differences.push(`! Alias "${alias}" présent dans craco.config.js mais pas dans jsconfig.json`);
            }
          });
          
          // Vérifier les différences de format (/* vs sans /*)
          const commonAliasesBase = cracoAliases
            .map(a => a.endsWith('/*') ? a.slice(0, -2) : a)
            .filter(a => jsConfigAliases.includes(a) || jsConfigAliases.includes(`${a}/*`));
          
          commonAliasesBase.forEach(baseAlias => {
            const cracoHasStar = cracoAliases.includes(`${baseAlias}/*`);
            const jsConfigHasStar = jsConfigAliases.includes(`${baseAlias}/*`);
            
            if (cracoHasStar !== jsConfigHasStar) {
              differences.push(`! Format d'alias différent: "${baseAlias}" avec /* dans ${cracoHasStar ? 'craco' : 'jsconfig'} mais pas dans ${cracoHasStar ? 'jsconfig' : 'craco'}`);
            }
          });
          
          if (differences.length > 0) {
            console.log("\n=== DIFFÉRENCES DÉTECTÉES ===");
            differences.forEach(diff => console.log(diff));
          } else {
            console.log("✓ Les alias sont cohérents entre craco.config.js et jsconfig.json");
          }
        }
      } else {
        console.log("! Aucun path défini dans jsconfig.json");
      }
      
    } catch (error) {
      console.log(`! ERREUR lors du chargement de jsconfig.json: ${error.message}`);
      const jsConfigContent = fs.readFileSync('./jsconfig.json', 'utf8');
      console.log("\nContenu du fichier:\n```\n" + jsConfigContent + "\n```");
    }
  } else {
    console.log("! Fichier jsconfig.json non trouvé");
  }
  
} catch (error) {
  console.error("Erreur globale:", error.message);
}
EOL

# Exécuter l'analyse des configurations webpack
node "$REPORT_DIR/extract_webpack_config.js" | tee -a "$WEBPACK_CONFIG"

# Vérification des dépendances circulaires
log "\n${YELLOW}Recherche des dépendances circulaires...${NC}"
CIRCULAR_DEPS=$(npx madge --circular --extensions js,jsx src/ 2>/dev/null || echo "")
if [ -n "$CIRCULAR_DEPS" ]; then
  log_error "✗ Dépendances circulaires détectées:"
  echo "$CIRCULAR_DEPS" | tee -a "$MODULE_REPORT"
else
  log "${GREEN}✓ Aucune dépendance circulaire détectée${NC}"
fi

# PHASE 3: ANALYSE DU CODE SOURCE ET DES MODULES
log "\n${BLUE}=== PHASE 3: ANALYSE DU CODE SOURCE ===${NC}"

# Recherche des imports vides
log "${YELLOW}Recherche approfondie des imports problématiques...${NC}"

# Créer un script d'analyse des imports
cat > "$REPORT_DIR/analyze_imports.js" << 'EOL'
const fs = require('fs');
const path = require('path');

// Fonction récursive pour rechercher des fichiers
function findFiles(dir, extensions, results = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && file.name !== 'node_modules' && file.name !== 'build') {
      findFiles(fullPath, extensions, results);
    } else if (file.isFile() && extensions.some(ext => file.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Trouver tous les fichiers JS/JSX
const sourceFiles = findFiles('./src', ['.js', '.jsx']);
console.log(`Analyse de ${sourceFiles.length} fichiers JS/JSX...`);

// Statistiques et problèmes
const stats = {
  totalImports: 0,
  emptyImports: [],
  potentialProblems: [],
  circularReferences: new Set(),
  importedModules: {},
  moduleExports: {}
};

// Analyser chaque fichier
sourceFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Rechercher les imports
    const importLines = lines.filter(line => /^\s*import\s+.*\s+from\s+['"]/.test(line));
    stats.totalImports += importLines.length;
    
    // Analyser chaque ligne d'import
    importLines.forEach((line, index) => {
      // Vérifier les imports vides
      if (line.includes("from ''") || line.includes('from ""')) {
        stats.emptyImports.push({
          file: filePath,
          line: index + 1,
          content: line.trim()
        });
      }
      
      // Extraire le module importé
      const moduleMatch = line.match(/from\s+['"]([^'"]+)['"]/);
      if (moduleMatch) {
        const module = moduleMatch[1];
        
        // Compter les modules importés
        stats.importedModules[module] = (stats.importedModules[module] || 0) + 1;
        
        // Vérifier les problèmes potentiels avec les modules
        if (module.startsWith('@')) {
          // Vérifier les imports avec alias
          if (module.includes('.js') || module.includes('.jsx')) {
            stats.potentialProblems.push({
              file: filePath,
              line: index + 1,
              content: line.trim(),
              issue: `L'import utilise une extension (.js/.jsx) avec un alias: ${module}`
            });
          }
        }
        
        // Vérifier les imports relatifs
        if (module.startsWith('./') || module.startsWith('../')) {
          // Vérifier les imports circulaires simples (2 fichiers)
          try {
            const currentDir = path.dirname(filePath);
            let targetPath = path.resolve(currentDir, module);
            
            // Ajouter .js si nécessaire
            if (!targetPath.endsWith('.js') && !targetPath.endsWith('.jsx')) {
              if (fs.existsSync(`${targetPath}.js`)) {
                targetPath = `${targetPath}.js`;
              } else if (fs.existsSync(`${targetPath}.jsx`)) {
                targetPath = `${targetPath}.jsx`;
              } else if (fs.existsSync(`${targetPath}/index.js`)) {
                targetPath = `${targetPath}/index.js`;
              }
            }
            
            // Vérifier si le fichier cible existe
            if (fs.existsSync(targetPath)) {
              const targetContent = fs.readFileSync(targetPath, 'utf8');
              
              // Vérifier si le fichier cible importe le fichier courant
              const relativeCurrentPath = path.relative(path.dirname(targetPath), filePath)
                .replace(/\\/g, '/') // Pour la compatibilité Windows
                .replace(/\.jsx?$/, '');
              
              const importCurrentRegex = new RegExp(`from\\s+['"](\\./|\\.\\./)+${relativeCurrentPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
              
              if (importCurrentRegex.test(targetContent)) {
                const circular = `${filePath} <-> ${targetPath}`;
                stats.circularReferences.add(circular);
              }
            } else {
              stats.potentialProblems.push({
                file: filePath,
                line: index + 1,
                content: line.trim(),
                issue: `L'import relatif pointe vers un fichier qui n'existe pas: ${module}`
              });
            }
          } catch (err) {
            // Ignorer les erreurs de détection circulaire
          }
        }
      }
    });
    
    // Analyser les exports
    const exportLines = lines.filter(line => /^\s*export\s+/.test(line));
    exportLines.forEach(line => {
      const namedExportMatch = line.match(/export\s+{\s*([^}]+)\s*}/);
      if (namedExportMatch) {
        const exportedItems = namedExportMatch[1].split(',').map(item => item.trim());
        stats.moduleExports[filePath] = [...(stats.moduleExports[filePath] || []), ...exportedItems];
      }
      
      const defaultExportMatch = line.match(/export\s+default\s+([^;]+)/);
      if (defaultExportMatch) {
        stats.moduleExports[filePath] = [...(stats.moduleExports[filePath] || []), 'default'];
      }
    });
    
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
  }
});

// Analyser les modules les plus importés
const topImportedModules = Object.entries(stats.importedModules)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

// Afficher les résultats
console.log('\n=== RÉSULTATS DE L\'ANALYSE DES IMPORTS ===');
console.log(`Total des imports analysés: ${stats.totalImports}`);

if (stats.emptyImports.length > 0) {
  console.log(`\n=== IMPORTS VIDES DÉTECTÉS (${stats.emptyImports.length}) ===`);
  stats.emptyImports.forEach(({file, line, content}) => {
    console.log(`${file}:${line}: ${content}`);
  });
}

if (stats.potentialProblems.length > 0) {
  console.log(`\n=== PROBLÈMES POTENTIELS (${stats.potentialProblems.length}) ===`);
  stats.potentialProblems.forEach(({file, line, content, issue}) => {
    console.log(`${file}:${line}: ${content}`);
    console.log(`   ↳ Problème: ${issue}`);
  });
}

if (stats.circularReferences.size > 0) {
  console.log(`\n=== RÉFÉRENCES CIRCULAIRES DÉTECTÉES (${stats.circularReferences.size}) ===`);
  [...stats.circularReferences].forEach(circular => {
    console.log(circular);
  });
}

console.log('\n=== TOP 10 DES MODULES LES PLUS IMPORTÉS ===');
topImportedModules.forEach(([module, count]) => {
  console.log(`${module}: ${count} imports`);
});
EOL

# Exécuter l'analyse des imports
node "$REPORT_DIR/analyze_imports.js" | tee -a "$MODULE_REPORT"

# Analyser le fichier firebase.js spécifiquement
log "\n${YELLOW}Analyse spécifique du fichier firebase.js...${NC}"
if [ -f "src/firebase.js" ]; then
  echo -e "\n=== CONTENU DE FIREBASE.JS ===" >> "$MODULE_REPORT"
  cat "src/firebase.js" | grep -v "^//" | grep -v "^$" >> "$MODULE_REPORT"
  
  echo -e "\n=== ANALYSE DES RÉEXPORTATIONS ===" >> "$MODULE_REPORT"
  REEXPORTS=$(grep -o "export {.*} from 'firebase/.*';" "src/firebase.js" || true)
  if [ -n "$REEXPORTS" ]; then
    echo "$REEXPORTS" >> "$MODULE_REPORT"
    log_error "Détection de réexportations dans firebase.js qui peuvent causer des conflits"
  else
    log "${GREEN}✓ Pas de réexportations détectées dans firebase.js${NC}"
  fi
else
  log_error "! Fichier src/firebase.js non trouvé"
fi

# PHASE 4: INSTRUMENTATION DU BUILD
log "\n${BLUE}=== PHASE 4: INSTRUMENTATION DU PROCESSUS DE BUILD ===${NC}"

# Créer un script webpack personnalisé pour intercepter le build
cat > "$REPORT_DIR/debug_webpack.js" << 'EOL'
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Créer une nouvelle configuration temporaire pour webpack
function createTempWebpackConfig() {
  const tempDir = path.resolve('./temp_webpack_debug');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Créer un config webpack qui va enregistrer les erreurs
  const webpackConfigPath = path.join(tempDir, 'webpack.config.js');
  
  fs.writeFileSync(webpackConfigPath, `
const path = require('path');
const fs = require('fs');
const originalConfig = require('../node_modules/react-scripts/config/webpack.config');

module.exports = (webpackEnv) => {
  // Obtenir la configuration originale
  const config = originalConfig(webpackEnv);
  
  // Ajouter des hooks pour intercepter les erreurs
  class ErrorDetectionPlugin {
    apply(compiler) {
      compiler.hooks.done.tap('ErrorDetectionPlugin', stats => {
        if (stats.hasErrors()) {
          const info = stats.toJson();
          fs.writeFileSync(
            path.resolve('./temp_webpack_debug/webpack_errors.json'),
            JSON.stringify(info.errors, null, 2)
          );
        }
      });
      
      // Intercepter les modules résolus
      compiler.hooks.normalModuleFactory.tap('ErrorDetectionPlugin', nmf => {
        nmf.hooks.beforeResolve.tap('ErrorDetectionPlugin', resolveData => {
          if (resolveData && resolveData.request === '') {
            // Enregistrer les demandes vides
            const emptyRequests = require('./empty_requests.json');
            emptyRequests.push({
              context: resolveData.context,
              request: resolveData.request,
              dependencies: resolveData.dependencies.map(d => d.request || '').filter(Boolean)
            });
            fs.writeFileSync(
              path.resolve('./temp_webpack_debug/empty_requests.json'),
              JSON.stringify(emptyRequests, null, 2)
            );
          }
          return resolveData;
        });
      });
    }
  }
  
  // Ajouter notre plugin à la chaîne
  config.plugins.push(new ErrorDetectionPlugin());
  
  return config;
};
  `);
  
  // Initialiser le fichier des requêtes vides
  fs.writeFileSync(
    path.join(tempDir, 'empty_requests.json'),
    '[]'
  );
  
  return tempDir;
}

try {
  console.log("=== PRÉPARATION DE L'INSTRUMENTATION DU BUILD ===");
  const tempDir = createTempWebpackConfig();
  console.log(`Configuration webpack de débogage créée dans ${tempDir}`);
  
  // Créer un script craco temporaire pour utiliser notre config webpack
  const cracoCfgPath = path.join(tempDir, 'craco.config.js');
  let originalCracoCfg = {};
  
  try {
    originalCracoCfg = require('../craco.config.js');
  } catch (e) {
    console.log("Pas de fichier craco.config.js trouvé, création d'une configuration minimale");
  }
  
  fs.writeFileSync(cracoCfgPath, `
const path = require('path');
const originalConfig = ${JSON.stringify(originalCracoCfg, null, 2)};

module.exports = {
  ...originalConfig,
  webpack: {
    ...originalConfig.webpack,
    configure: (webpackConfig, { env, paths }) => {
      // Charger notre configuration personnalisée
      const debugConfig = require('./webpack.config.js')(env);
      
      // Fusionner les configurations
      return {
        ...webpackConfig,
        plugins: [...webpackConfig.plugins, ...debugConfig.plugins.slice(-1)]
      };
    }
  }
};
  `);
  
  console.log("Configuration craco de débogage créée avec succès");
  
  // Exécuter un build limité
  console.log("\n=== EXÉCUTION DU BUILD INSTRUMENTÉ ===");
  console.log("Cette étape peut prendre quelques instants...");
  
  try {
    execSync(`cross-env DISABLE_ESLINT_PLUGIN=true NODE_ENV=production CRACO_CONFIG_PATH=${cracoCfgPath} npx craco build`, {
      stdio: 'inherit',
      timeout: 60000 // 1 minute maximum
    });
    console.log("✓ Build terminé avec succès");
  } catch (error) {
    console.log("✗ Build échoué, analyse des erreurs...");
    
    // Vérifier les erreurs webpack
    const errorsPath = path.join(tempDir, 'webpack_errors.json');
    const emptyRequestsPath = path.join(tempDir, 'empty_requests.json');
    
    if (fs.existsSync(errorsPath)) {
      const errors = JSON.parse(fs.readFileSync(errorsPath, 'utf8'));
      
      console.log("\n=== ERREURS WEBPACK DÉTECTÉES ===");
      errors.forEach((error, index) => {
        console.log(`\nErreur ${index + 1}:`);
        
        if (error.message) {
          console.log(error.message);
        }
        
        if (error.moduleName) {
          console.log(`Module: ${error.moduleName}`);
        }
        
        if (error.loc) {
          console.log(`Localisation: ${error.loc}`);
        }
      });


           
      
      // Vérifier les requêtes vides
      if (fs.existsSync(emptyRequestsPath)) {
        const emptyRequests = JSON.parse(fs.readFileSync(emptyRequestsPath, 'utf8'));
        
        if (emptyRequests.length > 0) {
          console.log("\n=== REQUÊTES VIDES DÉTECTÉES ===");
          console.log(`${emptyRequests.length} requêtes vides identifiées`);
          
          emptyRequests.forEach((req, index) => {
            console.log(`\nRequête vide ${index + 1}:`);
            console.log(`Contexte: ${req.context}`);
            
            if (req.dependencies && req.dependencies.length > 0) {
              console.log(`Dépendances associées: ${req.dependencies.join(', ')}`);
            }
            
            // Analyser le fichier source
            try {
              const sourceFile = req.context.split('!').pop();
              if (fs.existsSync(sourceFile)) {
                const content = fs.readFileSync(sourceFile, 'utf8');
                const lines = content.split('\n');
                
                // Rechercher les imports vides
                const emptyImportLines = lines
                  .map((line, i) => ({ line, index: i }))
                  .filter(({ line }) => line.includes("from ''") || line.includes('from ""'));
                
                if (emptyImportLines.length > 0) {
                  console.log(`Fichier source: ${sourceFile}`);
                  console.log("Imports vides trouvés:");
                  emptyImportLines.forEach(({ line, index }) => {
                    console.log(`  Ligne ${index + 1}: ${line.trim()}`);
                  });
                }
              }
            } catch (e) {
              console.log(`Impossible d'analyser le fichier source: ${e.message}`);
            }
          });
          
          console.log("\n=== SOLUTION RECOMMANDÉE ===");
          console.log("1. Corrigez les imports vides identifiés ci-dessus");
          console.log("2. Remplacez les imports vides par le chemin correct");
          console.log("3. Pour les imports Firebase, utilisez '@firebase' au lieu de @firebase.js ou ''");
        } else {
          console.log("\n✓ Aucune requête vide détectée");
        }
      }
    }
  }
  
  // Analyser l'arbre des modules
  console.log("\n=== ANALYSE DE L'ARBRE DES MODULES ===");
  console.log("Génération d'un graphique des dépendances...");
  
  try {
    execSync('npx madge --extensions js,jsx --image dependency-graph.png src/', {
      stdio: 'inherit'
    });
    console.log("✓ Graphique des dépendances généré: dependency-graph.png");
  } catch (e) {
    console.log(`✗ Impossible de générer le graphique: ${e.message}`);
  }

  // Nettoyer le répertoire temporaire
  console.log("\n=== NETTOYAGE ===");
  execSync(`rm -rf ${tempDir}`);
  console.log("✓ Fichiers temporaires supprimés");
  
  console.log("\n=== RAPPORT D'INSTRUMENTATION ===");
  console.log("Toutes les erreurs et les problèmes identifiés ont été enregistrés");
  console.log("Consultez le journal et les fichiers d'analyse pour plus de détails");
  
} catch (error) {
  console.error("Erreur lors de l'instrumentation:", error.message);
}
EOL

# Installer la dépendance nécessaire pour le cross-env
npm install --no-save cross-env &>/dev/null

# Exécuter le script d'instrumentation du build
log "${YELLOW}Exécution de l'instrumentation du build...${NC}"
node "$REPORT_DIR/debug_webpack.js" | tee -a "$BUILD_TRANSCRIPT"

# PHASE 5: ANALYSE ESLINT COMPLÈTE
log "\n${BLUE}=== PHASE 5: ANALYSE ESLINT COMPLÈTE ===${NC}"

# Créer une configuration ESLint temporaire
cat > "$REPORT_DIR/.eslintrc.json" << 'EOL'
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings"
  ],
  "plugins": ["react", "import"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx"]
      },
      "alias": {
        "map": [
          ["@firebase", "./src/firebase.js"],
          ["@components", "./src/components"],
          ["@hooks", "./src/hooks"],
          ["@context", "./src/context"],
          ["@utils", "./src/utils"],
          ["@styles", "./src/style"],
          ["@services", "./src/services"],
          ["@", "./src"]
        ],
        "extensions": [".js", ".jsx"]
      }
    }
  },
  "rules": {
    "import/no-unresolved": "error",
    "import/named": "error",
    "import/namespace": "error",
    "import/default": "error",
    "import/export": "error",
    "import/no-empty-named-blocks": "error",
    "no-empty-pattern": "error",
    "react/prop-types": "off"
  }
}
EOL

# Exécuter ESLint
log "${YELLOW}Exécution d'ESLint pour une analyse complète...${NC}"
ESLINT_RESULTS=$(npx eslint --no-eslintrc -c "$REPORT_DIR/.eslintrc.json" src/ 2>&1 || true)

# Compter les types d'erreurs
EMPTY_IMPORTS_COUNT=$(echo "$ESLINT_RESULTS" | grep -c "from ''" || true)
UNRESOLVED_COUNT=$(echo "$ESLINT_RESULTS" | grep -c "Unable to resolve path" || true)

log "${YELLOW}Résultats de l'analyse ESLint:${NC}"
log "${BLUE}Imports vides détectés: ${EMPTY_IMPORTS_COUNT}${NC}"
log "${BLUE}Imports non résolus: ${UNRESOLVED_COUNT}${NC}"

# Sauvegarder les résultats
echo "$ESLINT_RESULTS" > "$REPORT_DIR/eslint_results.txt"

# Analyser les erreurs les plus courantes
log "\n${YELLOW}Analyse des erreurs ESLint les plus fréquentes...${NC}"
echo "=== TOP 5 DES ERREURS LES PLUS FRÉQUENTES ===" >> "$ERROR_LOG"
cat "$REPORT_DIR/eslint_results.txt" | grep -o "error.*" | sort | uniq -c | sort -nr | head -5 >> "$ERROR_LOG"

# PHASE 6: VÉRIFICATION DES ÉLÉMENTS CRITIQUES MANQUANTS
log "\n${BLUE}=== PHASE 6: VÉRIFICATION DES ÉLÉMENTS CRITIQUES ===${NC}"

# Vérification du fichier firebase.js
log "${YELLOW}Vérification des exportations Firebase...${NC}"
if [ -f "src/firebase.js" ]; then
  # Créer un script pour vérifier les exportations
  cat > "$REPORT_DIR/check_firebase_exports.js" << 'EOL'
  const fs = require('fs');
  
  try {
    const content = fs.readFileSync('./src/firebase.js', 'utf8');
    
    // Vérifier les éléments essentiels
    const checks = [
      { name: 'db', pattern: /export\s+(?:const|let|var)?\s*(?:{[^}]*\b|\b)db\b|export\s+{\s*(?:[^}]*,\s*)?db\b/ },
      { name: 'auth', pattern: /export\s+(?:const|let|var)?\s*(?:{[^}]*\b|\b)auth\b|export\s+{\s*(?:[^}]*,\s*)?auth\b/ },
      { name: 'storage', pattern: /export\s+(?:const|let|var)?\s*(?:{[^}]*\b|\b)storage\b|export\s+{\s*(?:[^}]*,\s*)?storage\b/ },
      { name: 'collection', pattern: /export\s+(?:const|let|var)?\s*(?:{[^}]*\b|\b)collection\b|export\s+{\s*(?:[^}]*,\s*)?collection\b/ },
      { name: 'doc', pattern: /export\s+(?:const|let|var)?\s*(?:{[^}]*\b|\b)doc\b|export\s+{\s*(?:[^}]*,\s*)?doc\b/ }
    ];
    
    console.log("=== VÉRIFICATION DES EXPORTATIONS FIREBASE ===");
    
    const results = checks.map(check => {
      const isExported = check.pattern.test(content);
      return { name: check.name, exported: isExported };
    });
    
    results.forEach(result => {
      console.log(`${result.name}: ${result.exported ? '✓ Exporté' : '✗ Non exporté'}`);
    });
    
    // Vérifier les doublons d'exportation
    const exportLines = content.match(/export\s+{[^}]+}\s+from\s+['"]/g) || [];
    const duplicateExports = new Set();
    
    if (exportLines.length > 0) {
      const exportedItems = new Map();
      
      exportLines.forEach(line => {
        const items = line.match(/export\s+{\s*([^}]+)\s*}/)[1].split(',').map(i => i.trim());
        
        items.forEach(item => {
          const cleanItem = item.split(' as ')[0].trim();
          if (exportedItems.has(cleanItem)) {
            duplicateExports.add(cleanItem);
          } else {
            exportedItems.set(cleanItem, line);
          }
        });
      });
      
      if (duplicateExports.size > 0) {
        console.log("\n=== DOUBLONS D'EXPORTATION DÉTECTÉS ===");
        [...duplicateExports].forEach(item => {
          console.log(`! "${item}" est exporté plusieurs fois`);
        });
      }
    }
    
    // Vérifier les imports Firebase
    const firebaseImports = content.match(/import\s+{[^}]+}\s+from\s+['"]firebase\//g) || [];
    console.log(`\n${firebaseImports.length} imports Firebase trouvés`);
    
  } catch (error) {
    console.error("Erreur lors de la vérification de firebase.js:", error.message);
  }
EOL

  # Exécuter la vérification
  node "$REPORT_DIR/check_firebase_exports.js" | tee -a "$MODULE_REPORT"
else
  log_error "✗ Fichier firebase.js non trouvé"
fi

# PHASE 7: GÉNÉRATION DU RAPPORT FINAL
log "\n${BLUE}=== PHASE 7: GÉNÉRATION DU RAPPORT FINAL ===${NC}"

# Créer le résumé
cat > "$SUMMARY_FILE" << EOL
# Rapport de diagnostic approfondi

**Date:** $(date)  
**Projet:** $(basename $(pwd))

## Résumé des problèmes détectés

### Problèmes critiques
EOL

# Ajouter les problèmes critiques au résumé
EMPTY_IMPORTS=$(grep -r --include="*.js" --include="*.jsx" "from ''" ./src/ | wc -l)
if [ "$EMPTY_IMPORTS" -gt 0 ]; then
  echo "- ⚠️ **$EMPTY_IMPORTS imports vides** détectés (imports avec `from ''`)" >> "$SUMMARY_FILE"
  echo "  - Ces imports vides sont très probablement la cause de l'erreur 'Empty dependency'" >> "$SUMMARY_FILE"
fi

if [ -n "$CIRCULAR_DEPS" ]; then
  CIRCULAR_COUNT=$(echo "$CIRCULAR_DEPS" | wc -l)
  echo "- ⚠️ **Dépendances circulaires** détectées entre modules ($CIRCULAR_COUNT)" >> "$SUMMARY_FILE"
fi

# Vérifier les problèmes Firebase
FIREBASE_ISSUES=$(grep -c "doublons d'exportation" "$MODULE_REPORT" || true)
if [ "$FIREBASE_ISSUES" -gt 0 ]; then
  echo "- ⚠️ **Problèmes de doublons d'exportation** dans firebase.js" >> "$SUMMARY_FILE"
fi

echo -e "\n### Autres problèmes" >> "$SUMMARY_FILE"

# Vérifier les alias incohérents
CONFIG_ISSUES=$(grep -c "! Alias" "$WEBPACK_CONFIG" || true)
if [ "$CONFIG_ISSUES" -gt 0 ]; then
  echo "- Incohérences entre les alias dans jsconfig.json et craco.config.js" >> "$SUMMARY_FILE"
fi

# Ajouter les solutions recommandées
cat >> "$SUMMARY_FILE" << EOL

## Solutions recommandées

1. **Corriger les imports vides**:
   - Remplacer tous les \`import { db } from ''\` par \`import { db } from '@firebase'\`
   - Remplacer tous les \`import { auth, BYPASS_AUTH } from ''\` par \`import { auth } from '@firebase'; import { BYPASS_AUTH } from '../config';\`

2. **Nettoyer le fichier firebase.js**:
   - Éliminer les doublons de réexportations
   - Utiliser des exportations cohérentes pour tous les éléments Firebase

3. **Résoudre les incohérences d'alias**:
   - Aligner les alias dans jsconfig.json et craco.config.js

4. **Nettoyer le cache**:
   \`\`\`bash
   rm -rf node_modules/.cache
   \`\`\`

## Comment appliquer les corrections

### Correction des imports vides

\`\`\`bash
grep -r --include="*.js" --include="*.jsx" "from ''" ./src/
\`\`\`

Pour chaque fichier listé, remplacer les imports vides par:

\`\`\`javascript
import { db } from '@firebase';
\`\`\`

### Script de correction automatique

\`\`\`bash
#!/bin/bash
grep -l --include="*.js" --include="*.jsx" "import { db } from '';" ./src | xargs sed -i '' "s/import { db } from '';/import { db } from '@firebase';/"
\`\`\`

## Tests après correction

Après avoir appliqué les corrections, exécutez:

\`\`\`bash
npm run build
\`\`\`

## Fichiers analysés

Ce rapport inclut l'analyse des fichiers suivants:
- diagnostic_log.txt - Journal complet du diagnostic
- error_log.txt - Liste des erreurs détectées
- build_transcript.txt - Résultats de la compilation instrumentée
- module_analysis.txt - Analyse des modules et des imports
- webpack_config.txt - Analyse de la configuration webpack
- eslint_results.txt - Résultats complets de l'analyse ESLint
EOL

# Copier le graphique des dépendances dans le dossier de rapport
if [ -f "dependency-graph.png" ]; then
  cp dependency-graph.png "$REPORT_DIR/"
  echo -e "\n![Graphique des dépendances](dependency-graph.png)" >> "$SUMMARY_FILE"
fi

# Afficher le résumé
log "\n${GREEN}=== DIAGNOSTIC TERMINÉ ===${NC}"
log "${BLUE}Rapport complet disponible dans le dossier: ${NC}${REPORT_DIR}"
log "${YELLOW}Fichier de résumé: ${NC}${SUMMARY_FILE}"
log "${PURPLE}Ce rapport contient toutes les informations nécessaires pour résoudre l'erreur 'Empty dependency'${NC}"

# Ouvrir le rapport de résumé si possible
if command -v open &> /dev/null; then
  open "$SUMMARY_FILE"
elif command -v xdg-open &> /dev/null; then
  xdg-open "$SUMMARY_FILE"
fi

# Afficher les étapes à suivre
log "\n${CYAN}Prochaines étapes recommandées:${NC}"
log "1. Examinez le rapport de résumé pour comprendre les problèmes détectés"
log "2. Appliquez les corrections recommandées, en commençant par les imports vides"
log "3. Testez la compilation avec \`npm run build\`"
log "4. Si le problème persiste, consultez les détails complets dans les fichiers du rapport"
