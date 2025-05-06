/**
 * Script de normalisation des types de données
 * 
 * Ce script normalise les types de données dans toutes les collections:
 * - Convertit les chaînes de date en Timestamp Firebase
 * - Standardise les types numériques (montant, capacité, etc.)
 * - Standardise les types booléens
 * 
 * Utilisation: node normalize-data-types.js [--dry-run] [--collection=nom_collection]
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

// Définition des types de données par collection et champ
const DATA_TYPES = {
  // Pour toutes les collections
  common: {
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  // Pour la collection concerts
  concerts: {
    date: 'timestamp',
    montant: 'number',
    formValidated: 'boolean',
    nbPlaces: 'number',
    statut: 'string'
  },
  // Pour la collection programmateurs
  programmateurs: {
    'structureCache.updatedAt': 'timestamp'
  },
  // Pour la collection structures
  structures: {
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  // Pour la collection lieux
  lieux: {
    capacite: 'number',
    latitude: 'number',
    longitude: 'number'
  },
  // Pour la collection artistes
  artistes: {
    nbMembres: 'number'
  }
};

// Format des dates ISO à rechercher
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
const SIMPLE_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Convertit une valeur au type spécifié
 * @param {*} value Valeur à convertir
 * @param {string} type Type cible ('timestamp', 'number', 'boolean', 'string')
 * @returns {*} Valeur convertie
 */
function convertValueToType(value, type) {
  // Si la valeur est null ou undefined, la laisser telle quelle
  if (value === null || value === undefined) {
    return value;
  }
  
  switch (type) {
    case 'timestamp':
      // Si c'est déjà un Timestamp Firebase
      if (value && value.toDate && typeof value.toDate === 'function') {
        return value;
      }
      // Si c'est une chaîne ISO
      if (typeof value === 'string' && (ISO_DATE_REGEX.test(value) || SIMPLE_DATE_REGEX.test(value))) {
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
      return value;
    
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
 * Normalise les types de données dans un document
 * @param {Object} data Document à normaliser
 * @param {Object} collectionTypes Types pour la collection spécifique
 * @param {Object} commonTypes Types communs à toutes les collections
 * @returns {Object} Document normalisé
 */
function normalizeDocumentTypes(data, collectionTypes, commonTypes) {
  const result = { ...data };
  const allTypes = { ...commonTypes, ...collectionTypes };

  // Fonction récursive pour traiter les propriétés imbriquées
  function processField(obj, path, type) {
    const parts = path.split('.');
    
    // Si le chemin ne contient pas de points, c'est une propriété de premier niveau
    if (parts.length === 1) {
      const field = parts[0];
      if (obj[field] !== undefined) {
        obj[field] = convertValueToType(obj[field], type);
      }
    } 
    // Sinon, c'est une propriété imbriquée
    else {
      const field = parts[0];
      const remainingPath = parts.slice(1).join('.');
      
      if (obj[field] && typeof obj[field] === 'object') {
        processField(obj[field], remainingPath, type);
      }
    }
  }

  // Traiter chaque champ défini dans les types
  Object.entries(allTypes).forEach(([field, type]) => {
    processField(result, field, type);
  });

  // Traitement spécial pour les tableaux d'associations
  if (result.concertsAssocies && Array.isArray(result.concertsAssocies)) {
    result.concertsAssocies = result.concertsAssocies.map(item => {
      if (item.date && typeof item.date === 'string') {
        return { ...item, date: convertValueToType(item.date, 'timestamp') };
      }
      if (item.dateAssociation && typeof item.dateAssociation === 'string') {
        return { ...item, dateAssociation: convertValueToType(item.dateAssociation, 'timestamp') };
      }
      return item;
    });
  }

  return result;
}

/**
 * Normalise les types de données d'une collection
 */
async function normalizeCollection(collectionName) {
  console.log(`\n======== Normalisation des types dans la collection "${collectionName}" ========`);
  
  // Vérifier si nous avons des types définis pour cette collection
  const collectionTypes = DATA_TYPES[collectionName];
  const commonTypes = DATA_TYPES.common;
  
  if (!collectionTypes && !commonTypes) {
    console.log(`Aucun type défini pour la collection "${collectionName}"`);
    return { total: 0, normalized: 0 };
  }
  
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Aucun document trouvé dans la collection "${collectionName}"`);
      return { total: 0, normalized: 0 };
    }
    
    console.log(`Normalisation des types de ${snapshot.size} documents...`);
    
    // Créer un batch pour les écritures
    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 400; // Limité par Firestore (max 500)
    
    let normalizedCount = 0;
    
    // Pour chaque document
    for (const docSnapshot of snapshot.docs) {
      const docId = docSnapshot.id;
      const originalData = docSnapshot.data();
      
      // Normaliser les types de données
      const normalizedData = normalizeDocumentTypes(
        originalData, 
        collectionTypes || {}, 
        commonTypes || {}
      );
      
      // Vérifier si le document a effectivement été modifié
      const hasChanged = JSON.stringify(originalData) !== JSON.stringify(normalizedData);
      
      // Si le document a été modifié, le mettre à jour
      if (hasChanged) {
        console.log(`\nNormalisation des types du document ${docId}...`);
        
        if (!options.dryRun) {
          const docRef = doc(db, collectionName, docId);
          batch.set(docRef, normalizedData);
          
          batchCount++;
          
          // Si le batch est plein, l'exécuter et en créer un nouveau
          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            batch = writeBatch(db);
            batchCount = 0;
            console.log(`Batch de ${BATCH_SIZE} opérations exécuté`);
          }
        } else {
          console.log(`[MODE SIMULATION] Document ${docId} serait normalisé avec les types suivants:`);
          
          // Afficher les principales modifications pour le debug
          Object.entries(normalizedData).forEach(([key, value]) => {
            if (JSON.stringify(value) !== JSON.stringify(originalData[key])) {
              console.log(`  - ${key}: ${typeof originalData[key]} => ${typeof value} (${JSON.stringify(value).substring(0, 50)}${JSON.stringify(value).length > 50 ? '...' : ''})`);
            }
          });
        }
        
        normalizedCount++;
      }
    }
    
    // Exécuter le dernier batch s'il n'est pas vide
    if (!options.dryRun && batchCount > 0) {
      await batch.commit();
      console.log(`Dernier batch de ${batchCount} opérations exécuté`);
    }
    
    console.log(`\nNormalisation des types dans ${collectionName} terminée: ${normalizedCount}/${snapshot.size} documents normalisés.`);
    
    return { total: snapshot.size, normalized: normalizedCount };
    
  } catch (error) {
    console.error(`Erreur lors de la normalisation des types dans la collection "${collectionName}":`, error);
    return { total: 0, normalized: 0, error: true };
  }
}

/**
 * Exécute la normalisation des types sur les collections spécifiées
 */
async function main() {
  console.log('Démarrage de la normalisation des types de données...');
  console.log('Date: ' + new Date().toISOString());
  console.log('Mode: ' + (options.dryRun ? 'SIMULATION' : 'RÉEL'));
  
  if (options.dryRun) {
    console.log('⚠️  Mode simulation: aucune modification ne sera écrite dans Firebase');
  }
  
  const results = {};
  
  // Si une collection spécifique est demandée
  if (options.collection) {
    if (DATA_TYPES[options.collection] || DATA_TYPES.common) {
      results[options.collection] = await normalizeCollection(options.collection);
    } else {
      console.error(`Collection non reconnue ou sans types définis: ${options.collection}`);
      process.exit(1);
    }
  } 
  // Sinon, traiter toutes les collections configurées
  else {
    // Collecter toutes les collections avec types définis
    const collectionsToProcess = Object.keys(DATA_TYPES).filter(key => key !== 'common');
    
    for (const collectionName of collectionsToProcess) {
      results[collectionName] = await normalizeCollection(collectionName);
    }
  }
  
  // Afficher le résumé
  console.log('\n======== Résumé de la normalisation des types ========');
  let totalDocuments = 0;
  let totalNormalized = 0;
  
  Object.entries(results).forEach(([collection, result]) => {
    console.log(`${collection}: ${result.normalized}/${result.total} documents normalisés`);
    totalDocuments += result.total;
    totalNormalized += result.normalized;
  });
  
  console.log(`\nTotal: ${totalNormalized}/${totalDocuments} documents normalisés`);
  
  if (options.dryRun) {
    console.log('\n⚠️  C\'était une simulation. Pour effectuer les modifications réelles, exécuter sans --dry-run');
  }
  
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur dans le script de normalisation des types:', error);
  process.exit(1);
});