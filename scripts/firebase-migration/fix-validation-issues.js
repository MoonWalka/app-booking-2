/**
 * Script de correction des problèmes identifiés par la validation
 * 
 * Ce script corrige les problèmes courants détectés par validate-migration.js :
 * - Ajoute les champs updatedAt manquants dans les objets cache
 * - Corrige les types de données des timestamps dans les tableaux d'associations
 * 
 * Utilisation: node fix-validation-issues.js [--dry-run] [--collection=nom_collection]
 */

// Importer notre initialisation Firebase pour Node.js
const {
  db, collection, doc, getDoc, getDocs, 
  setDoc, updateDoc, query, writeBatch, where,
  Timestamp
} = require('./firebase-node');

// Options par défaut
const options = {
  dryRun: process.argv.includes('--dry-run'),
  collection: process.argv.find(arg => arg.startsWith('--collection='))?.split('=')[1]
};

// Définition des problèmes à corriger par collection
const ISSUES_TO_FIX = {
  // Pour la collection concerts
  concerts: {
    cacheTimestamps: [
      'programmateurCache.updatedAt',
      'artisteCache.updatedAt',
      'lieuCache.updatedAt',
      'structureCache.updatedAt'
    ],
  },
  // Pour la collection programmateurs
  programmateurs: {
    cacheTimestamps: [
      'structureCache.updatedAt'
    ],
    arrayTimestamps: {
      'concertsAssocies': ['dateAssociation', 'date']
    }
  },
  // Pour la collection lieux
  lieux: {
    fieldConversions: {
      'createdAt': 'timestamp',
      'updatedAt': 'timestamp',
      'capacite': 'number'
    },
    arrayAddFields: {
      'programmateursAssocies': {
        'prenom': item => item.prenom || ''
      }
    }
  },
  // Pour la collection artistes
  artistes: {
    fieldConversions: {
      'createdAt': 'timestamp',
      'updatedAt': 'timestamp'
    },
    arrayTimestamps: {
      'concertsAssocies': ['dateAssociation', 'date']
    }
  }
};

/**
 * Convertit une valeur au type spécifié
 * @param {*} value Valeur à convertir
 * @param {string} type Type cible ('timestamp', 'number', 'boolean', 'string')
 * @returns {*} Valeur convertie
 */
function convertValueToType(value, type) {
  // Si la valeur est null ou undefined, la laisser telle quelle
  if (value === undefined || value === null) {
    return value;
  }
  
  switch (type) {
    case 'timestamp':
      // Si c'est déjà un Timestamp Firebase
      if (value && value.toDate && typeof value.toDate === 'function') {
        return value;
      }
      // Si c'est une chaîne ISO
      if (typeof value === 'string' && (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}$/))) {
        return Timestamp.fromDate(new Date(value));
      }
      // Si c'est un nombre (timestamp en millisecondes)
      if (typeof value === 'number') {
        return Timestamp.fromMillis(value);
      }
      // Si c'est une date JavaScript
      if (value instanceof Date) {
        return Timestamp.fromDate(value);
      }
      // Dernière chance : utiliser la date actuelle
      return Timestamp.fromDate(new Date());
    
    case 'number':
      // Si la valeur est déjà un nombre
      if (typeof value === 'number') {
        return value;
      }
      // Si c'est une chaîne représentant un nombre
      if (typeof value === 'string' && !isNaN(value)) {
        return Number(value);
      }
      return value;
    
    case 'boolean':
      // Si la valeur est déjà un booléen
      if (typeof value === 'boolean') {
        return value;
      }
      // Si c'est une chaîne "true" ou "false"
      if (value === 'true' || value === 'false') {
        return value === 'true';
      }
      // Si c'est 0 ou 1
      if (value === 0 || value === 1) {
        return Boolean(value);
      }
      return value;
    
    case 'string':
      // Si la valeur n'est pas déjà une chaîne
      if (typeof value !== 'string') {
        return String(value);
      }
      return value;
    
    default:
      return value;
  }
}

/**
 * Corrige les timestamps dans les objets cache
 * @param {Object} data Document à corriger
 * @param {Array} paths Chemins des timestamps à corriger (ex: ['programmateurCache.updatedAt'])
 */
function fixCacheTimestamps(data, paths) {
  let modified = false;
  
  for (const path of paths) {
    const parts = path.split('.');
    const cacheObjectName = parts[0];
    const fieldName = parts[1];
    
    if (data[cacheObjectName] && typeof data[cacheObjectName] === 'object') {
      // Si le cache existe mais le champ updatedAt est absent ou n'est pas un timestamp
      const currentValue = data[cacheObjectName][fieldName];
      
      if (!currentValue || typeof currentValue === 'string' || typeof currentValue === 'number') {
        data[cacheObjectName][fieldName] = Timestamp.fromDate(
          currentValue ? new Date(currentValue) : new Date()
        );
        modified = true;
      }
    }
  }
  
  return modified;
}

/**
 * Corrige les timestamps dans les tableaux d'associations
 * @param {Object} data Document à corriger
 * @param {Object} arrayConfig Configuration des tableaux à corriger
 */
function fixArrayTimestamps(data, arrayConfig) {
  let modified = false;
  
  for (const [arrayName, fields] of Object.entries(arrayConfig)) {
    const array = data[arrayName];
    
    if (array && Array.isArray(array)) {
      array.forEach((item, index) => {
        for (const field of fields) {
          if (item[field] !== undefined && !item[field].seconds) { // Si ce n'est pas déjà un timestamp
            data[arrayName][index][field] = convertValueToType(item[field], 'timestamp');
            modified = true;
          }
        }
      });
    }
  }
  
  return modified;
}

/**
 * Ajoute les champs manquants dans les tableaux d'associations
 * @param {Object} data Document à corriger
 * @param {Object} arrayConfig Configuration des tableaux à corriger
 */
function fixArrayMissingFields(data, arrayConfig) {
  let modified = false;
  
  for (const [arrayName, fieldsConfig] of Object.entries(arrayConfig)) {
    const array = data[arrayName];
    
    if (array && Array.isArray(array)) {
      array.forEach((item, index) => {
        for (const [fieldName, valueGenerator] of Object.entries(fieldsConfig)) {
          if (!item[fieldName]) {
            data[arrayName][index][fieldName] = valueGenerator(item);
            modified = true;
          }
        }
      });
    }
  }
  
  return modified;
}

/**
 * Corrige les types de champs
 * @param {Object} data Document à corriger
 * @param {Object} fieldConversions Configuration des conversions à appliquer
 */
function fixFieldTypes(data, fieldConversions) {
  let modified = false;
  
  for (const [field, type] of Object.entries(fieldConversions)) {
    if (data[field] !== undefined) {
      const convertedValue = convertValueToType(data[field], type);
      
      // Si la conversion a modifié la valeur
      if (JSON.stringify(data[field]) !== JSON.stringify(convertedValue)) {
        data[field] = convertedValue;
        modified = true;
      }
    }
  }
  
  return modified;
}

/**
 * Corrige les problèmes d'une collection
 */
async function fixCollection(collectionName) {
  console.log(`\n======== Correction des problèmes dans la collection "${collectionName}" ========`);
  
  // Vérifier si nous avons des corrections définies pour cette collection
  const fixes = ISSUES_TO_FIX[collectionName];
  if (!fixes) {
    console.log(`Aucune correction définie pour la collection "${collectionName}"`);
    return { total: 0, fixed: 0 };
  }
  
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Aucun document trouvé dans la collection "${collectionName}"`);
      return { total: 0, fixed: 0 };
    }
    
    console.log(`Correction de ${snapshot.size} documents...`);
    
    // Créer un batch pour les écritures
    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 400; // Limité par Firestore (max 500)
    
    let fixedCount = 0;
    
    // Pour chaque document
    for (const docSnapshot of snapshot.docs) {
      const docId = docSnapshot.id;
      const data = {...docSnapshot.data()}; // Copie pour ne pas modifier l'original directement
      
      console.log(`\nAnalyse du document ${docId}...`);
      
      // Appliquer toutes les corrections configurées
      let documentModified = false;
      
      // 1. Correction des timestamps dans les objets cache
      if (fixes.cacheTimestamps) {
        const cacheFixed = fixCacheTimestamps(data, fixes.cacheTimestamps);
        documentModified = documentModified || cacheFixed;
      }
      
      // 2. Correction des timestamps dans les tableaux d'associations
      if (fixes.arrayTimestamps) {
        const arrayFixed = fixArrayTimestamps(data, fixes.arrayTimestamps);
        documentModified = documentModified || arrayFixed;
      }
      
      // 3. Ajout des champs manquants dans les tableaux
      if (fixes.arrayAddFields) {
        const fieldsFixed = fixArrayMissingFields(data, fixes.arrayAddFields);
        documentModified = documentModified || fieldsFixed;
      }
      
      // 4. Correction des types de champs
      if (fixes.fieldConversions) {
        const fieldsFixed = fixFieldTypes(data, fixes.fieldConversions);
        documentModified = documentModified || fieldsFixed;
      }
      
      // Si le document a été modifié, le mettre à jour
      if (documentModified) {
        console.log(`Correction du document ${docId}...`);
        
        if (!options.dryRun) {
          const docRef = doc(db, collectionName, docId);
          batch.set(docRef, data);
          
          batchCount++;
          
          // Si le batch est plein, l'exécuter et en créer un nouveau
          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            batch = writeBatch(db);
            batchCount = 0;
            console.log(`Batch de ${BATCH_SIZE} opérations exécuté`);
          }
        } else {
          console.log(`[MODE SIMULATION] Document ${docId} serait corrigé`);
        }
        
        fixedCount++;
      } else {
        console.log(`Aucune correction nécessaire pour ${docId}`);
      }
    }
    
    // Exécuter le dernier batch s'il n'est pas vide
    if (!options.dryRun && batchCount > 0) {
      await batch.commit();
      console.log(`Dernier batch de ${batchCount} opérations exécuté`);
    }
    
    console.log(`\nCorrection de ${collectionName} terminée: ${fixedCount}/${snapshot.size} documents corrigés.`);
    
    return { total: snapshot.size, fixed: fixedCount };
    
  } catch (error) {
    console.error(`Erreur lors de la correction de la collection "${collectionName}":`, error);
    return { total: 0, fixed: 0, error: true };
  }
}

/**
 * Exécute les corrections sur les collections spécifiées
 */
async function main() {
  console.log('Démarrage des corrections des problèmes de validation...');
  console.log('Date: ' + new Date().toISOString());
  console.log('Mode: ' + (options.dryRun ? 'SIMULATION' : 'RÉEL'));
  
  if (options.dryRun) {
    console.log('⚠️  Mode simulation: aucune modification ne sera écrite dans Firebase');
  }
  
  const results = {};
  
  // Si une collection spécifique est demandée
  if (options.collection) {
    if (ISSUES_TO_FIX[options.collection]) {
      results[options.collection] = await fixCollection(options.collection);
    } else {
      console.error(`Collection non reconnue ou sans corrections définies: ${options.collection}`);
      process.exit(1);
    }
  } 
  // Sinon, traiter toutes les collections configurées
  else {
    // Collecter toutes les collections avec corrections
    const collectionsToProcess = Object.keys(ISSUES_TO_FIX);
    
    for (const collectionName of collectionsToProcess) {
      results[collectionName] = await fixCollection(collectionName);
    }
  }
  
  // Afficher le résumé
  console.log('\n======== Résumé des corrections ========');
  let totalDocuments = 0;
  let totalFixed = 0;
  
  Object.entries(results).forEach(([collection, result]) => {
    console.log(`${collection}: ${result.fixed}/${result.total} documents corrigés`);
    totalDocuments += result.total;
    totalFixed += result.fixed;
  });
  
  console.log(`\nTotal: ${totalFixed}/${totalDocuments} documents corrigés`);
  
  if (options.dryRun) {
    console.log('\n⚠️  C\'était une simulation. Pour effectuer les corrections réelles, exécuter sans --dry-run');
  }
  
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur dans le script de correction:', error);
  process.exit(1);
});