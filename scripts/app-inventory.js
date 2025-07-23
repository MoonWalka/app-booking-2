#!/usr/bin/env node

/**
 * Script d'inventaire automatique de l'application TourCraft
 * 
 * Ce script analyse le code pour identifier :
 * - Les systèmes existants (cache, auth, etc.)
 * - Les features implémentées
 * - Les patterns utilisés
 * - Les incohérences
 */

const fs = require('fs');
const path = require('path');

// Configuration
const srcPath = path.join(__dirname, '..', 'src');
const results = {
  timestamp: new Date().toISOString(),
  systems: {},
  features: {},
  patterns: {},
  issues: []
};

// Fonctions utilitaires
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function findFiles(dir, pattern) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walk(fullPath);
      } else if (stat.isFile() && pattern.test(item)) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Analyseurs spécifiques
function analyzeCache() {
  console.log('🔍 Analyse du système de cache...');
  
  const cacheFiles = findFiles(srcPath, /cache/i);
  const hasCache = cacheFiles.length > 0;
  
  if (hasCache) {
    results.systems.cache = {
      exists: true,
      files: cacheFiles.map(f => path.relative(srcPath, f)),
      features: []
    };
    
    // Analyser les features du cache
    cacheFiles.forEach(file => {
      const content = readFileContent(file);
      if (content) {
        if (content.includes('ttl') || content.includes('TTL')) {
          results.systems.cache.features.push('TTL support');
        }
        if (content.includes('invalidate')) {
          results.systems.cache.features.push('Invalidation');
        }
        if (content.includes('namespace')) {
          results.systems.cache.features.push('Namespaces');
        }
      }
    });
  }
  
  return hasCache;
}

function analyzeAuth() {
  console.log('🔍 Analyse du système d\'authentification...');
  
  const authFiles = findFiles(srcPath, /auth/i);
  const contextFile = path.join(srcPath, 'context', 'AuthContext.js');
  
  results.systems.auth = {
    exists: fs.existsSync(contextFile),
    files: authFiles.map(f => path.relative(srcPath, f)),
    features: []
  };
  
  if (fs.existsSync(contextFile)) {
    const content = readFileContent(contextFile);
    if (content) {
      if (content.includes('Firebase Auth')) {
        results.systems.auth.features.push('Firebase Auth');
      }
      if (content.includes('DEV_USER')) {
        results.systems.auth.features.push('Dev mode');
      }
      if (content.includes('roles') || content.includes('permissions')) {
        results.systems.auth.features.push('Role-based access');
      }
    }
  }
}

function analyzeDataFlow() {
  console.log('🔍 Analyse du flux de données...');
  
  const patterns = {
    redux: /import.*redux|createStore|useSelector|useDispatch/i,
    contextApi: /createContext|useContext|Provider/i,
    reactQuery: /useQuery|useMutation|QueryClient/i,
    swr: /useSWR/i,
    firebase: /firebase|firestore|collection|doc/i,
    graphql: /graphql|gql|apollo/i
  };
  
  const jsFiles = findFiles(srcPath, /\.(js|jsx|ts|tsx)$/);
  const foundPatterns = {};
  
  jsFiles.forEach(file => {
    const content = readFileContent(file);
    if (content) {
      Object.entries(patterns).forEach(([name, pattern]) => {
        if (pattern.test(content)) {
          if (!foundPatterns[name]) {
            foundPatterns[name] = [];
          }
          foundPatterns[name].push(path.relative(srcPath, file));
        }
      });
    }
  });
  
  results.patterns.dataFlow = foundPatterns;
}

function analyzeVariableSystem() {
  console.log('🔍 Analyse du système de variables...');
  
  const variableFiles = findFiles(srcPath, /variable|mapper|contract/i);
  const variablePatterns = [];
  
  variableFiles.forEach(file => {
    const content = readFileContent(file);
    if (content) {
      // Chercher les patterns de variables
      const bracketVars = content.match(/\[([a-zA-Z_]+)\]/g);
      const braceVars = content.match(/\{([a-zA-Z_]+)\}/g);
      
      if (bracketVars) {
        variablePatterns.push({
          file: path.relative(srcPath, file),
          pattern: 'brackets',
          count: bracketVars.length
        });
      }
      
      if (braceVars) {
        variablePatterns.push({
          file: path.relative(srcPath, file),
          pattern: 'braces',
          count: braceVars.length
        });
      }
    }
  });
  
  results.systems.variables = {
    files: variableFiles.map(f => path.relative(srcPath, f)),
    patterns: variablePatterns
  };
}

function analyzeHooks() {
  console.log('🔍 Analyse des hooks personnalisés...');
  
  const hooksDir = path.join(srcPath, 'hooks');
  const customHooks = [];
  
  if (fs.existsSync(hooksDir)) {
    const hookFiles = findFiles(hooksDir, /^use.*\.js$/);
    
    hookFiles.forEach(file => {
      const name = path.basename(file, '.js');
      const content = readFileContent(file);
      const features = [];
      
      if (content) {
        if (content.includes('useState')) features.push('state');
        if (content.includes('useEffect')) features.push('effects');
        if (content.includes('useCallback')) features.push('memoization');
        if (content.includes('firebase')) features.push('firebase');
        if (content.includes('cache')) features.push('cache');
      }
      
      customHooks.push({
        name,
        file: path.relative(srcPath, file),
        features
      });
    });
  }
  
  results.features.customHooks = customHooks;
}

function findInconsistencies() {
  console.log('🔍 Recherche d\'incohérences...');
  
  // Chercher les variables avec différents noms
  const variableNames = new Map();
  const jsFiles = findFiles(srcPath, /\.(js|jsx)$/);
  
  jsFiles.forEach(file => {
    const content = readFileContent(file);
    if (content) {
      // Chercher les patterns comme artisteNom, artiste.nom, etc.
      const patterns = [
        /artiste[._]?nom/gi,
        /structure[._]?nom/gi,
        /montant[._]?(ht|ttc|net|brut)/gi
      ];
      
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!variableNames.has(match.toLowerCase())) {
              variableNames.set(match.toLowerCase(), []);
            }
            variableNames.get(match.toLowerCase()).push({
              file: path.relative(srcPath, file),
              exact: match
            });
          });
        }
      });
    }
  });
  
  // Identifier les incohérences
  variableNames.forEach((locations, name) => {
    const uniqueFormats = new Set(locations.map(l => l.exact));
    if (uniqueFormats.size > 1) {
      results.issues.push({
        type: 'naming_inconsistency',
        concept: name,
        formats: Array.from(uniqueFormats),
        fileCount: locations.length
      });
    }
  });
}

// Générer le rapport
function generateReport() {
  console.log('\n📊 Génération du rapport...\n');
  
  // Résumé
  console.log('=== SYSTÈMES DÉTECTÉS ===');
  Object.entries(results.systems).forEach(([name, info]) => {
    if (info.exists !== false) {
      console.log(`✅ ${name.toUpperCase()}`);
      if (info.features) {
        info.features.forEach(f => console.log(`   - ${f}`));
      }
    }
  });
  
  console.log('\n=== PATTERNS DE CODE ===');
  Object.entries(results.patterns.dataFlow || {}).forEach(([pattern, files]) => {
    console.log(`${files.length > 0 ? '✅' : '❌'} ${pattern}: ${files.length} fichiers`);
  });
  
  console.log('\n=== PROBLÈMES DÉTECTÉS ===');
  results.issues.forEach(issue => {
    if (issue.type === 'naming_inconsistency') {
      console.log(`⚠️  Variable "${issue.concept}" a ${issue.formats.length} formats différents:`);
      issue.formats.forEach(f => console.log(`   - ${f}`));
    }
  });
  
  // Sauvegarder le rapport complet
  const reportPath = path.join(__dirname, '..', 'INVENTORY_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Rapport complet sauvegardé dans: INVENTORY_REPORT.json`);
}

// Exécution
console.log('🚀 Démarrage de l\'inventaire de l\'application TourCraft...\n');

analyzeCache();
analyzeAuth();
analyzeDataFlow();
analyzeVariableSystem();
analyzeHooks();
findInconsistencies();
generateReport();

console.log('\n✅ Inventaire terminé!');