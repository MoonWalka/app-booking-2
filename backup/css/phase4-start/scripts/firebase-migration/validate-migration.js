/**
 * Script de validation de la migration des données Firebase
 * 
 * Ce script vérifie l'intégrité des données après la migration:
 * - Vérifie la présence des objets cache dans tous les documents
 * - Vérifie que toutes les références (ID) sont valides
 * - Vérifie les types de données (timestamps, nombres, etc.)
 * - Génère un rapport des incohérences restantes
 * 
 * Utilisation: node validate-migration.js [--collection=nom_collection] [--report-file=filename.json]
 */

// Importer notre initialisation Firebase pour Node.js
const {
  db, collection, doc, getDoc, getDocs, 
  query, where, Timestamp
} = require('./firebase-node');
const fs = require('fs');
const path = require('path');

// Options par défaut
const options = {
  collection: process.argv.find(arg => arg.startsWith('--collection='))?.split('=')[1],
  reportFile: process.argv.find(arg => arg.startsWith('--report-file='))?.split('=')[1] || 'validation-report.json'
};

// Règles de validation par collection
const VALIDATION_RULES = {
  // Pour toutes les collections
  common: {
    requiredFields: ['createdAt', 'updatedAt'],
    typeChecks: {
      'createdAt': { type: 'timestamp', required: true },
      'updatedAt': { type: 'timestamp', required: true }
    }
  },
  // Pour la collection concerts
  concerts: {
    requiredFields: ['titre', 'date', 'programmateurId', 'artisteId', 'lieuId', 'montant'],
    typeChecks: {
      'date': { type: 'timestamp', required: true },
      'montant': { type: 'number', required: true },
      'formValidated': { type: 'boolean', required: false },
      'nbPlaces': { type: 'number', required: false },
      'programmateurId': { type: 'string', required: true, referenceCheck: 'programmateurs' },
      'artisteId': { type: 'string', required: true, referenceCheck: 'artistes' },
      'lieuId': { type: 'string', required: true, referenceCheck: 'lieux' },
      'structureId': { type: 'string', required: false, referenceCheck: 'structures' }
    },
    cacheChecks: {
      'programmateurCache': { idField: 'programmateurId', requiredFields: ['nom', 'prenom'] },
      'artisteCache': { idField: 'artisteId', requiredFields: ['nom'] },
      'lieuCache': { idField: 'lieuId', requiredFields: ['nom'] },
      'structureCache': { idField: 'structureId', requiredFields: ['raisonSociale'] }
    }
  },
  // Pour la collection programmateurs
  programmateurs: {
    requiredFields: ['nom', 'prenom', 'email'],
    typeChecks: {
      'structureId': { type: 'string', required: false, referenceCheck: 'structures' }
    },
    cacheChecks: {
      'structureCache': { idField: 'structureId', requiredFields: ['raisonSociale'] }
    },
    arrayChecks: {
      'concertsAssocies': { 
        requiredFields: ['id', 'titre', 'date'],
        fieldTypes: {
          'id': 'string',
          'titre': 'string',
          'date': 'timestamp',
          'dateAssociation': 'timestamp'
        }
      }
    }
  },
  // Pour la collection structures
  structures: {
    requiredFields: ['raisonSociale'],
    typeChecks: {
      'raisonSociale': { type: 'string', required: true },
      'ville': { type: 'string', required: false },
      'type': { type: 'string', required: false }
    }
  },
  // Pour la collection lieux
  lieux: {
    requiredFields: ['nom', 'ville'],
    typeChecks: {
      'capacite': { type: 'number', required: false },
      'latitude': { type: 'number', required: false },
      'longitude': { type: 'number', required: false }
    },
    arrayChecks: {
      'programmateursAssocies': { 
        requiredFields: ['id', 'nom', 'prenom'],
        fieldTypes: {
          'id': 'string',
          'nom': 'string',
          'prenom': 'string',
          'dateAssociation': 'timestamp'
        }
      }
    }
  },
  // Pour la collection artistes
  artistes: {
    requiredFields: ['nom'],
    typeChecks: {
      'nbMembres': { type: 'number', required: false }
    },
    arrayChecks: {
      'concertsAssocies': { 
        requiredFields: ['id', 'titre', 'date'],
        fieldTypes: {
          'id': 'string',
          'titre': 'string',
          'date': 'timestamp',
          'dateAssociation': 'timestamp'
        }
      }
    }
  }
};

// Cache pour les vérifications de références
const referenceCache = {
  programmateurs: new Set(),
  structures: new Set(),
  lieux: new Set(),
  artistes: new Set(),
  concerts: new Set()
};

/**
 * Vérifie le type d'une valeur
 * @param {*} value Valeur à vérifier
 * @param {string} expectedType Type attendu ('timestamp', 'number', 'boolean', 'string', 'object', 'array')
 * @returns {boolean} true si le type est conforme
 */
function validateType(value, expectedType) {
  if (value === undefined || value === null) {
    return false;
  }
  
  switch (expectedType) {
    case 'timestamp':
      return value && typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined;
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'string':
      return typeof value === 'string';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    default:
      return false;
  }
}

/**
 * Vérifie si une référence existe dans la collection cible
 * @param {string} id ID à vérifier
 * @param {string} targetCollection Collection cible
 * @returns {Promise<boolean>} true si la référence est valide
 */
async function validateReference(id, targetCollection) {
  // Vérifier d'abord dans le cache
  if (referenceCache[targetCollection]?.has(id)) {
    return true;
  }
  
  try {
    const docRef = doc(db, targetCollection, id);
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
      // Ajouter au cache pour accélérer les prochaines vérifications
      if (!referenceCache[targetCollection]) {
        referenceCache[targetCollection] = new Set();
      }
      referenceCache[targetCollection].add(id);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erreur lors de la vérification de la référence ${id} dans ${targetCollection}:`, error);
    return false;
  }
}

/**
 * Récupère tous les IDs d'une collection pour le cache de références
 * @param {string} collectionName Nom de la collection
 */
async function preloadReferenceCache(collectionName) {
  console.log(`Préchargement des IDs de la collection ${collectionName}...`);
  
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    
    if (!referenceCache[collectionName]) {
      referenceCache[collectionName] = new Set();
    }
    
    for (const doc of snapshot.docs) {
      referenceCache[collectionName].add(doc.id);
    }
    
    console.log(`${referenceCache[collectionName].size} IDs préchargés pour la collection ${collectionName}`);
  } catch (error) {
    console.error(`Erreur lors du préchargement des IDs de la collection ${collectionName}:`, error);
  }
}

/**
 * Vérifie un document selon les règles de validation
 * @param {Object} data Document à vérifier
 * @param {Object} collectionRules Règles pour la collection
 * @param {Object} commonRules Règles communes à toutes les collections
 * @returns {Promise<Object>} Résultat de la validation
 */
async function validateDocument(data, collectionRules, commonRules) {
  const errors = [];
  const warnings = [];
  
  // Fusion des règles communes et spécifiques
  const rules = {
    requiredFields: [...(commonRules.requiredFields || []), ...(collectionRules.requiredFields || [])],
    typeChecks: { ...commonRules.typeChecks, ...collectionRules.typeChecks },
    cacheChecks: collectionRules.cacheChecks || {},
    arrayChecks: collectionRules.arrayChecks || {}
  };
  
  // Vérification des champs requis
  for (const field of rules.requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      errors.push(`Champ requis manquant: ${field}`);
    }
  }
  
  // Vérification des types
  for (const [field, check] of Object.entries(rules.typeChecks)) {
    if (data[field] !== undefined) {
      if (!validateType(data[field], check.type)) {
        errors.push(`Type invalide pour le champ ${field}: attendu ${check.type}, obtenu ${typeof data[field]}`);
      }
      
      // Vérification des références si demandé
      if (check.referenceCheck && data[field]) {
        const isValidRef = await validateReference(data[field], check.referenceCheck);
        if (!isValidRef) {
          errors.push(`Référence invalide pour le champ ${field}: ${data[field]} n'existe pas dans ${check.referenceCheck}`);
        }
      }
    } else if (check.required) {
      errors.push(`Champ requis manquant: ${field}`);
    }
  }
  
  // Vérification des objets cache
  for (const [cacheName, cacheCheck] of Object.entries(rules.cacheChecks)) {
    const cache = data[cacheName];
    const refId = data[cacheCheck.idField];
    
    // Si l'ID de référence existe, le cache doit aussi exister
    if (refId) {
      if (!cache || typeof cache !== 'object') {
        errors.push(`Cache manquant pour ${cacheCheck.idField}: ${cacheName} n'existe pas ou n'est pas un objet`);
      } else {
        // Vérifier les champs requis dans le cache
        for (const field of cacheCheck.requiredFields) {
          if (cache[field] === undefined || cache[field] === null) {
            errors.push(`Champ requis manquant dans ${cacheName}: ${field}`);
          }
        }
        
        // Vérifier la cohérence de l'ID
        if (cache.id !== refId) {
          errors.push(`Incohérence d'ID dans ${cacheName}: ${cache.id} != ${refId}`);
        }
        
        // Vérifier que updatedAt est un timestamp valide
        if (!validateType(cache.updatedAt, 'timestamp')) {
          errors.push(`Type invalide pour ${cacheName}.updatedAt: devrait être un timestamp`);
        }
      }
    } else if (cache) {
      warnings.push(`Cache présent sans ID de référence: ${cacheName} existe mais ${cacheCheck.idField} est absent`);
    }
  }
  
  // Vérification des tableaux d'associations
  for (const [arrayName, arrayCheck] of Object.entries(rules.arrayChecks)) {
    const array = data[arrayName];
    
    if (array) {
      if (!Array.isArray(array)) {
        errors.push(`${arrayName} n'est pas un tableau`);
      } else {
        // Vérifier chaque élément du tableau
        for (let i = 0; i < array.length; i++) {
          const item = array[i];
          
          // Vérifier les champs requis
          for (const field of arrayCheck.requiredFields) {
            if (item[field] === undefined || item[field] === null) {
              errors.push(`Champ requis manquant dans ${arrayName}[${i}]: ${field}`);
            }
          }
          
          // Vérifier les types
          for (const [field, expectedType] of Object.entries(arrayCheck.fieldTypes)) {
            if (item[field] !== undefined && !validateType(item[field], expectedType)) {
              errors.push(`Type invalide dans ${arrayName}[${i}].${field}: attendu ${expectedType}`);
            }
          }
          
          // Si l'item a un ID, vérifier la référence
          if (item.id) {
            const targetCollection = arrayName === 'concertsAssocies' ? 'concerts' : 
                                     arrayName === 'programmateursAssocies' ? 'programmateurs' : 
                                     arrayName === 'lieuxAssocies' ? 'lieux' : null;
            
            if (targetCollection) {
              const isValidRef = await validateReference(item.id, targetCollection);
              if (!isValidRef) {
                errors.push(`Référence invalide dans ${arrayName}[${i}]: ${item.id} n'existe pas dans ${targetCollection}`);
              }
            }
          }
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valide tous les documents d'une collection
 * @param {string} collectionName Nom de la collection à valider
 * @returns {Promise<Object>} Rapport de validation pour cette collection
 */
async function validateCollection(collectionName) {
  console.log(`\n======== Validation de la collection "${collectionName}" ========`);
  
  // Vérifier si nous avons des règles de validation pour cette collection
  const collectionRules = VALIDATION_RULES[collectionName];
  if (!collectionRules) {
    console.log(`Aucune règle de validation définie pour la collection "${collectionName}"`);
    return { total: 0, valid: 0, invalid: 0, documents: [] };
  }
  
  // Trouver les règles communes
  const commonRules = VALIDATION_RULES.common || {};
  
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Aucun document trouvé dans la collection "${collectionName}"`);
      return { total: 0, valid: 0, invalid: 0, documents: [] };
    }
    
    console.log(`Validation de ${snapshot.size} documents...`);
    
    let validCount = 0;
    let invalidCount = 0;
    const documents = [];
    
    // Pour chaque document
    for (const docSnapshot of snapshot.docs) {
      const docId = docSnapshot.id;
      const data = docSnapshot.data();
      
      console.log(`Validation du document ${docId}...`);
      
      // Valider le document selon les règles
      const validationResult = await validateDocument(data, collectionRules, commonRules);
      
      if (validationResult.isValid) {
        validCount++;
        console.log(`✅ Document ${docId} est valide`);
      } else {
        invalidCount++;
        console.log(`❌ Document ${docId} est invalide:`);
        validationResult.errors.forEach(error => console.log(`  - ${error}`));
      }
      
      if (validationResult.warnings.length > 0) {
        console.log(`⚠️ Avertissements pour ${docId}:`);
        validationResult.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
      
      // Ajouter au rapport
      documents.push({
        id: docId,
        isValid: validationResult.isValid,
        errors: validationResult.errors,
        warnings: validationResult.warnings
      });
    }
    
    console.log(`\nValidation de ${collectionName} terminée: ${validCount}/${snapshot.size} documents valides, ${invalidCount}/${snapshot.size} invalides.`);
    
    return {
      total: snapshot.size,
      valid: validCount,
      invalid: invalidCount,
      documents
    };
    
  } catch (error) {
    console.error(`Erreur lors de la validation de la collection "${collectionName}":`, error);
    return { 
      total: 0, 
      valid: 0, 
      invalid: 0, 
      error: true, 
      errorMessage: error.message,
      documents: [] 
    };
  }
}

/**
 * Génère un rapport de validation et l'enregistre dans un fichier
 * @param {Object} results Résultats de validation par collection
 * @param {string} reportFilePath Chemin du fichier de rapport
 */
function generateValidationReport(results, reportFilePath) {
  const report = {
    date: new Date().toISOString(),
    summary: {
      totalDocuments: 0,
      validDocuments: 0,
      invalidDocuments: 0,
      percentageValid: 0
    },
    collections: results
  };
  
  // Calculer les totaux
  let totalDocuments = 0;
  let validDocuments = 0;
  let invalidDocuments = 0;
  
  Object.values(results).forEach(result => {
    totalDocuments += result.total;
    validDocuments += result.valid;
    invalidDocuments += result.invalid;
  });
  
  // Mettre à jour le résumé
  report.summary = {
    totalDocuments,
    validDocuments,
    invalidDocuments,
    percentageValid: totalDocuments > 0 ? Math.round((validDocuments / totalDocuments) * 100) : 0
  };
  
  // Enregistrer le rapport dans un fichier
  try {
    fs.writeFileSync(reportFilePath, JSON.stringify(report, null, 2));
    console.log(`\nRapport de validation enregistré dans ${reportFilePath}`);
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement du rapport:`, error);
  }
  
  return report;
}

/**
 * Exécute la validation sur les collections spécifiées
 */
async function main() {
  console.log('Démarrage de la validation des données après migration...');
  console.log('Date: ' + new Date().toISOString());
  console.log('Génération du rapport dans: ' + options.reportFile);
  
  const reportFilePath = path.resolve(options.reportFile);
  const results = {};
  
  // Précharger les caches de références pour accélérer les vérifications
  await Promise.all([
    preloadReferenceCache('programmateurs'),
    preloadReferenceCache('structures'),
    preloadReferenceCache('lieux'),
    preloadReferenceCache('artistes'),
    preloadReferenceCache('concerts')
  ]);
  
  // Si une collection spécifique est demandée
  if (options.collection) {
    if (VALIDATION_RULES[options.collection] || options.collection === 'common') {
      results[options.collection] = await validateCollection(options.collection);
    } else {
      console.error(`Collection non reconnue ou sans règles de validation: ${options.collection}`);
      process.exit(1);
    }
  } 
  // Sinon, traiter toutes les collections configurées
  else {
    // Collecter toutes les collections avec règles de validation
    const collectionsToProcess = Object.keys(VALIDATION_RULES).filter(key => key !== 'common');
    
    for (const collectionName of collectionsToProcess) {
      results[collectionName] = await validateCollection(collectionName);
    }
  }
  
  // Générer le rapport de validation
  const report = generateValidationReport(results, reportFilePath);
  
  // Afficher le résumé
  console.log('\n======== Résumé de la validation ========');
  console.log(`Total des documents: ${report.summary.totalDocuments}`);
  console.log(`Documents valides: ${report.summary.validDocuments} (${report.summary.percentageValid}%)`);
  console.log(`Documents invalides: ${report.summary.invalidDocuments}`);
  
  Object.entries(results).forEach(([collection, result]) => {
    const validPercentage = result.total > 0 ? Math.round((result.valid / result.total) * 100) : 0;
    console.log(`${collection}: ${result.valid}/${result.total} valides (${validPercentage}%)`);
  });
  
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur dans le script de validation:', error);
  process.exit(1);
});