#!/usr/bin/env node

/**
 * Script d'analyse de TOUS les champs de données de l'application
 * 
 * Ce script analyse :
 * - Les collections Firebase (structures, dates, artistes, etc.)
 * - Les formulaires (tous les champs)
 * - Les objets de données dans le code
 * - Les incohérences de nommage
 */

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src');
const results = {
  timestamp: new Date().toISOString(),
  collections: {},
  formFields: {},
  dataObjects: {},
  inconsistencies: [],
  summary: {}
};

// Patterns pour identifier les champs
const PATTERNS = {
  // Collections Firebase
  firebaseCollection: /collection\s*\(\s*db\s*,\s*['"`](\w+)['"`]/g,
  
  // Champs de formulaire
  formField: /name\s*=\s*["']([a-zA-Z_][a-zA-Z0-9_]*)["']/g,
  formControlName: /controlId\s*=\s*["']([a-zA-Z_][a-zA-Z0-9_]*)["']/g,
  
  // Objets de données
  objectField: /(\w+)\s*:\s*(?:formData\.)?(\w+)/g,
  stateObject: /set[A-Z]\w+\s*\(\s*{\s*([^}]+)\s*}\s*\)/g,
  
  // Accès aux propriétés
  propertyAccess: /(\w+)\.(\w+)/g,
  
  // Définitions de types/interfaces (même si c'est du JS)
  objectShape: /const\s+\w+\s*=\s*{\s*([^}]+)\s*}/g
};

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
    try {
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
    } catch (error) {
      // Ignorer
    }
  }
  
  walk(dir);
  return files;
}

// Analyser les entités principales
function analyzeEntities() {
  console.log('🔍 Analyse des entités principales...\n');
  
  const entities = {
    'structures': { files: [], fields: new Set() },
    'contacts': { files: [], fields: new Set() },
    'personnes': { files: [], fields: new Set() },
    'dates': { files: [], fields: new Set() },
    'artistes': { files: [], fields: new Set() },
    'lieux': { files: [], fields: new Set() },
    'devis': { files: [], fields: new Set() },
    'contrats': { files: [], fields: new Set() },
    'factures': { files: [], fields: new Set() }
  };
  
  // Pour chaque entité, trouver les fichiers associés
  Object.keys(entities).forEach(entity => {
    const pattern = new RegExp(entity.slice(0, -1), 'i'); // Enlever le 's' final
    const files = findFiles(srcPath, pattern);
    
    files.forEach(file => {
      const content = readFileContent(file);
      if (!content) return;
      
      entities[entity].files.push(path.relative(srcPath, file));
      
      // Extraire les champs depuis les formulaires
      let match;
      while ((match = PATTERNS.formField.exec(content)) !== null) {
        entities[entity].fields.add(match[1]);
      }
      
      // Extraire depuis les objets
      const objectMatches = content.match(/const\s+\w*[Dd]ata\s*=\s*{([^}]+)}/g);
      if (objectMatches) {
        objectMatches.forEach(objMatch => {
          const fields = objMatch.match(/(\w+)\s*:/g);
          if (fields) {
            fields.forEach(field => {
              const cleanField = field.replace(':', '').trim();
              entities[entity].fields.add(cleanField);
            });
          }
        });
      }
    });
  });
  
  // Convertir les Sets en arrays et stocker
  Object.entries(entities).forEach(([name, data]) => {
    results.collections[name] = {
      fileCount: data.files.length,
      fields: Array.from(data.fields).sort(),
      fieldCount: data.fields.size
    };
  });
  
  console.log('✅ Entités analysées:', Object.keys(results.collections).length);
}

// Analyser les formulaires
function analyzeForms() {
  console.log('\n🔍 Analyse des formulaires...\n');
  
  const formFiles = [
    ...findFiles(srcPath, /Form\.js$/),
    ...findFiles(srcPath, /Modal\.js$/),
    ...findFiles(srcPath, /Creation.*\.js$/),
    ...findFiles(srcPath, /Edit.*\.js$/)
  ];
  
  const formsByType = {};
  
  formFiles.forEach(file => {
    const content = readFileContent(file);
    if (!content) return;
    
    const fileName = path.basename(file);
    const fields = new Set();
    
    // Extraire les champs de formulaire
    let match;
    while ((match = PATTERNS.formField.exec(content)) !== null) {
      fields.add(match[1]);
    }
    
    while ((match = PATTERNS.formControlName.exec(content)) !== null) {
      fields.add(match[1]);
    }
    
    if (fields.size > 0) {
      // Déterminer le type d'entité
      let entityType = 'autre';
      if (fileName.includes('Structure')) entityType = 'structure';
      else if (fileName.includes('Contact') || fileName.includes('Personne')) entityType = 'contact';
      else if (fileName.includes('Date')) entityType = 'date';
      else if (fileName.includes('Artiste')) entityType = 'artiste';
      else if (fileName.includes('Lieu')) entityType = 'lieu';
      else if (fileName.includes('Devis')) entityType = 'devis';
      else if (fileName.includes('Contrat')) entityType = 'contrat';
      else if (fileName.includes('Facture')) entityType = 'facture';
      
      if (!formsByType[entityType]) {
        formsByType[entityType] = {
          forms: [],
          allFields: new Set()
        };
      }
      
      formsByType[entityType].forms.push({
        file: path.relative(srcPath, file),
        fields: Array.from(fields)
      });
      
      fields.forEach(f => formsByType[entityType].allFields.add(f));
    }
  });
  
  // Stocker les résultats
  Object.entries(formsByType).forEach(([type, data]) => {
    results.formFields[type] = {
      formCount: data.forms.length,
      uniqueFields: Array.from(data.allFields).sort(),
      fieldCount: data.allFields.size
    };
  });
  
  console.log('✅ Types de formulaires analysés:', Object.keys(results.formFields).length);
}

// Identifier les incohérences
function findInconsistencies() {
  console.log('\n🔍 Recherche d\'incohérences...\n');
  
  // Comparer les champs similaires
  const allFields = new Map();
  
  // Collecter tous les champs
  Object.entries(results.collections).forEach(([entity, data]) => {
    data.fields.forEach(field => {
      const key = `${entity}.${field}`;
      allFields.set(field, [...(allFields.get(field) || []), entity]);
    });
  });
  
  // Chercher les variations de noms
  const fieldGroups = new Map();
  
  allFields.forEach((entities, field) => {
    const normalized = field.toLowerCase().replace(/_/g, '');
    
    if (!fieldGroups.has(normalized)) {
      fieldGroups.set(normalized, []);
    }
    
    fieldGroups.get(normalized).push({ field, entities });
  });
  
  // Identifier les incohérences
  fieldGroups.forEach((variants, normalized) => {
    if (variants.length > 1) {
      const uniqueNames = [...new Set(variants.map(v => v.field))];
      if (uniqueNames.length > 1) {
        results.inconsistencies.push({
          concept: normalized,
          variants: uniqueNames,
          usedIn: [...new Set(variants.flatMap(v => v.entities))]
        });
      }
    }
  });
  
  console.log('✅ Incohérences trouvées:', results.inconsistencies.length);
}

// Générer le dictionnaire
function generateDictionary() {
  console.log('\n📝 Génération du dictionnaire de données...\n');
  
  const dictionary = {
    generated: new Date().toISOString(),
    entities: {}
  };
  
  // Pour chaque entité, créer une structure complète
  Object.entries(results.collections).forEach(([entity, data]) => {
    dictionary.entities[entity] = {
      fields: {}
    };
    
    data.fields.forEach(field => {
      dictionary.entities[entity].fields[field] = {
        type: guessFieldType(field),
        required: guessIfRequired(field),
        description: generateFieldDescription(field)
      };
    });
  });
  
  // Sauvegarder
  const dictPath = path.join(__dirname, '..', 'DICTIONNAIRE_DONNEES.json');
  fs.writeFileSync(dictPath, JSON.stringify(dictionary, null, 2));
  
  // Générer aussi la version JavaScript
  generateJSDataDictionary(dictionary);
  
  console.log('✅ Dictionnaire généré !');
}

// Deviner le type d'un champ
function guessFieldType(field) {
  const fieldLower = field.toLowerCase();
  
  if (fieldLower.includes('date') || fieldLower.includes('created') || fieldLower.includes('updated')) return 'date';
  if (fieldLower.includes('id')) return 'string';
  if (fieldLower.includes('montant') || fieldLower.includes('prix') || fieldLower.includes('total')) return 'number';
  if (fieldLower.includes('email')) return 'email';
  if (fieldLower.includes('tel') || fieldLower.includes('phone')) return 'phone';
  if (fieldLower.includes('url') || fieldLower.includes('site')) return 'url';
  if (fieldLower.includes('is') || fieldLower.includes('has') || fieldLower.includes('active')) return 'boolean';
  
  return 'string';
}

// Deviner si un champ est requis
function guessIfRequired(field) {
  const required = ['nom', 'name', 'title', 'id', 'email'];
  return required.some(r => field.toLowerCase().includes(r));
}

// Générer une description
function generateFieldDescription(field) {
  const words = field.split(/(?=[A-Z])|_/).filter(Boolean);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// Générer le fichier JS
function generateJSDataDictionary(dictionary) {
  const jsContent = `/**
 * Dictionnaire de données de l'application TourCraft
 * Généré automatiquement le ${new Date().toISOString()}
 * 
 * Ce fichier contient TOUS les champs de données utilisés dans l'application
 */

export const DATA_DICTIONARY = ${JSON.stringify(dictionary.entities, null, 2)};

// Validation des champs
export function validateField(entity, field, value) {
  const fieldDef = DATA_DICTIONARY[entity]?.fields?.[field];
  if (!fieldDef) return { valid: false, error: 'Champ inconnu' };
  
  // Validation basique par type
  switch (fieldDef.type) {
    case 'email':
      return { valid: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value) };
    case 'phone':
      return { valid: /^[\\d\\s\\-\\+\\(\\)]+$/.test(value) };
    case 'number':
      return { valid: !isNaN(value) };
    case 'date':
      return { valid: !isNaN(Date.parse(value)) };
    default:
      return { valid: true };
  }
}

// Liste de tous les champs par entité
export const ENTITY_FIELDS = {
${Object.entries(dictionary.entities).map(([entity, data]) => 
  `  ${entity}: [${Object.keys(data.fields).map(f => `'${f}'`).join(', ')}]`
).join(',\n')}
};
`;

  const jsPath = path.join(srcPath, 'config', 'dataDictionary.js');
  fs.writeFileSync(jsPath, jsContent);
}

// Générer le rapport
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT - DICTIONNAIRE DE DONNÉES\n');
  
  // Résumé par entité
  console.log('📌 ENTITÉS ET CHAMPS:\n');
  Object.entries(results.collections).forEach(([entity, data]) => {
    console.log(`${entity.toUpperCase()} (${data.fieldCount} champs)`);
    console.log(`  Fichiers: ${data.fileCount}`);
    console.log(`  Principaux: ${data.fields.slice(0, 5).join(', ')}${data.fields.length > 5 ? '...' : ''}`);
    console.log('');
  });
  
  // Incohérences
  if (results.inconsistencies.length > 0) {
    console.log('⚠️  INCOHÉRENCES DE NOMMAGE:\n');
    results.inconsistencies.slice(0, 5).forEach(inc => {
      console.log(`- "${inc.concept}"`);
      console.log(`  Variantes: ${inc.variants.join(', ')}`);
      console.log(`  Utilisé dans: ${inc.usedIn.join(', ')}`);
      console.log('');
    });
  }
  
  // Statistiques
  const totalFields = Object.values(results.collections).reduce((sum, e) => sum + e.fieldCount, 0);
  console.log('📈 STATISTIQUES:');
  console.log(`- Total de champs uniques: ${totalFields}`);
  console.log(`- Entités analysées: ${Object.keys(results.collections).length}`);
  console.log(`- Incohérences trouvées: ${results.inconsistencies.length}`);
  
  console.log('\n' + '='.repeat(60));
}

// Exécution
console.log('🚀 Analyse complète de la structure de données TourCraft...\n');

analyzeEntities();
analyzeForms();
findInconsistencies();
generateDictionary();
generateReport();

console.log('\n✅ Analyse terminée !');
console.log('\n📄 Fichiers générés:');
console.log('   - DICTIONNAIRE_DONNEES.json (structure complète)');
console.log('   - src/config/dataDictionary.js (utilisable dans le code)');