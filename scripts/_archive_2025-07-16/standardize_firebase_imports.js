#!/usr/bin/env node

/**
 * Script pour standardiser les imports Firebase dans les hooks
 * Ce script parcourt les fichiers de hooks et convertit les anciens imports Firebase
 * vers le format moderne de Firebase v9 (imports modulaires)
 * 
 * Usage: node scripts/standardize_firebase_imports.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Répertoires à analyser (relatifs à la racine du projet)
const HOOK_DIRECTORIES = [
  'src/hooks',
  'src/hooks/common',
  'src/hooks/concerts',
  'src/hooks/artistes',
  'src/hooks/lieux',
  'src/hooks/programmateurs',
  'src/hooks/forms',
  'src/hooks/utils'
];

// Motifs de recherche pour les imports Firebase
const OLD_FIREBASE_IMPORT_REGEX = /import\s+firebase\s+from\s+['"]@\/firebaseInit['"];?/g;
const FIREBASE_FUNCTIONS_REGEX = /firebase\.([\w]+)\(\s*firebase\.([\w]+)\s*,\s*(?:firebase\.)?(\w+)\s*,\s*([^)]+)\)/g;
const FIREBASE_DB_USAGE_REGEX = /firebase\.db/g;
const FIREBASE_DOC_REGEX = /firebase\.doc\(/g;
const FIREBASE_COLLECTION_REGEX = /firebase\.collection\(/g;
const FIREBASE_QUERY_REGEX = /firebase\.query\(/g;
const FIREBASE_WHERE_REGEX = /firebase\.where\(/g;
const FIREBASE_LIMIT_REGEX = /firebase\.limit\(/g;
const FIREBASE_ORDER_BY_REGEX = /firebase\.orderBy\(/g;
const FIREBASE_GET_DOCS_REGEX = /firebase\.getDocs\(/g;
const FIREBASE_GET_DOC_REGEX = /firebase\.getDoc\(/g;
const FIREBASE_ADD_DOC_REGEX = /firebase\.addDoc\(/g;
const FIREBASE_SET_DOC_REGEX = /firebase\.setDoc\(/g;
const FIREBASE_UPDATE_DOC_REGEX = /firebase\.updateDoc\(/g;
const FIREBASE_DELETE_DOC_REGEX = /firebase\.deleteDoc\(/g;
const FIREBASE_TIMESTAMP_REGEX = /firebase\.Timestamp/g;
const FIREBASE_SERVERTIME_REGEX = /firebase\.serverTimestamp\(\)/g;

// Mappings des fonctions Firebase pour le remplacement
const FIREBASE_FUNCTION_IMPORTS = new Set([
  'doc',
  'collection',
  'query',
  'where',
  'limit',
  'orderBy',
  'getDocs',
  'getDoc',
  'addDoc',
  'setDoc',
  'updateDoc',
  'deleteDoc',
  'Timestamp',
  'serverTimestamp'
]);

/**
 * Recherche tous les fichiers JS dans les répertoires spécifiés
 */
function findJsFiles(directories) {
  let files = [];
  
  directories.forEach(dir => {
    const absDir = path.resolve(dir);
    if (fs.existsSync(absDir) && fs.statSync(absDir).isDirectory()) {
      console.log(`Analyse du répertoire: ${absDir}`);
      
      const dirFiles = fs.readdirSync(absDir)
        .filter(file => file.endsWith('.js') && !file.endsWith('.test.js'))
        .map(file => path.join(absDir, file));
      
      files = [...files, ...dirFiles];
    }
  });
  
  return files;
}

/**
 * Analyse un fichier pour identifier les imports Firebase à convertir
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier utilise l'ancien import Firebase
    const hasOldImport = OLD_FIREBASE_IMPORT_REGEX.test(content);
    
    if (!hasOldImport) {
      return { needsUpdate: false };
    }
    
    // Identifier les fonctions Firebase utilisées
    const usedFunctions = new Set();
    
    // Vérifier les utilisations courantes
    if (FIREBASE_DOC_REGEX.test(content)) usedFunctions.add('doc');
    if (FIREBASE_COLLECTION_REGEX.test(content)) usedFunctions.add('collection');
    if (FIREBASE_QUERY_REGEX.test(content)) usedFunctions.add('query');
    if (FIREBASE_WHERE_REGEX.test(content)) usedFunctions.add('where');
    if (FIREBASE_LIMIT_REGEX.test(content)) usedFunctions.add('limit');
    if (FIREBASE_ORDER_BY_REGEX.test(content)) usedFunctions.add('orderBy');
    if (FIREBASE_GET_DOCS_REGEX.test(content)) usedFunctions.add('getDocs');
    if (FIREBASE_GET_DOC_REGEX.test(content)) usedFunctions.add('getDoc');
    if (FIREBASE_ADD_DOC_REGEX.test(content)) usedFunctions.add('addDoc');
    if (FIREBASE_SET_DOC_REGEX.test(content)) usedFunctions.add('setDoc');
    if (FIREBASE_UPDATE_DOC_REGEX.test(content)) usedFunctions.add('updateDoc');
    if (FIREBASE_DELETE_DOC_REGEX.test(content)) usedFunctions.add('deleteDoc');
    if (FIREBASE_TIMESTAMP_REGEX.test(content)) usedFunctions.add('Timestamp');
    if (FIREBASE_SERVERTIME_REGEX.test(content)) usedFunctions.add('serverTimestamp');
    
    // Recherche des patterns plus complexes
    let match;
    const contentCopy = content.slice(); // Copie pour réinitialiser le regex lastIndex
    FIREBASE_FUNCTIONS_REGEX.lastIndex = 0;
    
    while ((match = FIREBASE_FUNCTIONS_REGEX.exec(contentCopy)) !== null) {
      const [, func, , ] = match;
      if (FIREBASE_FUNCTION_IMPORTS.has(func)) {
        usedFunctions.add(func);
      }
    }
    
    const usesDb = FIREBASE_DB_USAGE_REGEX.test(content);
    
    return {
      needsUpdate: true,
      usedFunctions: Array.from(usedFunctions),
      usesDb
    };
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error);
    return { needsUpdate: false, error };
  }
}

/**
 * Met à jour le fichier avec les imports Firebase modernes
 */
function updateFile(filePath, analysis) {
  try {
    if (!analysis.needsUpdate) return false;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Générer le nouvel import
    const firebaseFunctions = analysis.usedFunctions.join(', ');
    
    // Remplacer l'ancien import par le nouveau
    const newImports = [];
    
    if (analysis.usedFunctions.length > 0) {
      newImports.push(`import { ${firebaseFunctions} } from 'firebase/firestore';`);
    }
    
    if (analysis.usesDb) {
      newImports.push(`import { db } from '@/firebaseInit';`);
    }
    
    const newImportStatement = newImports.join('\n');
    content = content.replace(OLD_FIREBASE_IMPORT_REGEX, newImportStatement);
    
    // Remplacer les utilisations de firebase.fonction par fonction
    analysis.usedFunctions.forEach(func => {
      const regex = new RegExp(`firebase\\.${func}\\(`, 'g');
      content = content.replace(regex, `${func}(`);
    });
    
    // Remplacer firebase.db par db
    content = content.replace(FIREBASE_DB_USAGE_REGEX, 'db');
    
    // Gérer les cas spécifiques de firebase.doc(firebase.db, ...)
    content = content.replace(
      /firebase\.([\w]+)\(\s*firebase\.([\w]+)\s*,\s*(?:firebase\.)?(\w+)\s*,\s*([^)]+)\)/g,
      (match, func, db, collection, params) => {
        if (db === 'db') {
          return `${func}(db, ${collection}, ${params})`;
        }
        return match;
      }
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Mis à jour: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${filePath}:`, error);
    return false;
  }
}

/**
 * Exécute l'analyse et la mise à jour des fichiers
 */
function run() {
  console.log('🔍 Recherche des fichiers de hooks à standardiser...');
  
  const files = findJsFiles(HOOK_DIRECTORIES);
  
  console.log(`📁 ${files.length} fichiers trouvés.`);
  
  let updated = 0;
  let failures = 0;
  
  files.forEach(file => {
    console.log(`📄 Analyse de ${file}...`);
    const analysis = analyzeFile(file);
    
    if (analysis.needsUpdate) {
      if (updateFile(file, analysis)) {
        updated++;
      } else {
        failures++;
      }
    }
  });
  
  console.log('\n📊 Récapitulatif:');
  console.log(`- ${files.length} fichiers analysés`);
  console.log(`- ${updated} fichiers mis à jour`);
  console.log(`- ${failures} échecs`);
  console.log(`- ${files.length - updated - failures} fichiers déjà conformes`);
  
  // Rendre le script exécutable
  execSync(`chmod +x ${__filename}`);
}

// Point d'entrée principal
run();