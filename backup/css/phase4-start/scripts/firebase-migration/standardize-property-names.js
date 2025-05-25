/**
 * Script de standardisation des noms de propriétés
 * 
 * Ce script applique la table de mappage définie dans le plan de standardisation,
 * restructure les propriétés plates en objets cache, et normalise les formats.
 * 
 * Utilisation: node standardize-property-names.js [--dry-run] [--collection=nom_collection]
 */

// Importer notre initialisation Firebase pour Node.js
const {
  db, collection, doc, getDoc, getDocs, 
  setDoc, updateDoc, query, writeBatch, where
} = require('./firebase-node');

// Options par défaut
const options = {
  dryRun: process.argv.includes('--dry-run'),
  collection: process.argv.find(arg => arg.startsWith('--collection='))?.split('=')[1]
};

// Définition des tables de mappage par collection
const PROPERTY_MAPPING = {
  // Pour la collection concerts
  concerts: {
    // Propriétés lieuCache
    lieuNom: 'lieuCache.nom',
    lieuAdresse: 'lieuCache.adresse',
    lieuCodePostal: 'lieuCache.codePostal',
    lieuVille: 'lieuCache.ville',
    lieuCapacite: 'lieuCache.capacite',
    // Propriétés artisteCache
    artisteNom: 'artisteCache.nom',
    // Propriétés programmateurCache
    programmateurNom: 'programmateurCache.nom',
    programmateurPrenom: 'programmateurCache.prenom',
    programmateurEmail: 'programmateurCache.email',
    programmateurTelephone: 'programmateurCache.telephone',
    programmateurFonction: 'programmateurCache.fonction',
    // Propriétés structureCache
    structureRaisonSociale: 'structureCache.raisonSociale',
    structureAdresse: 'structureCache.adresse',
    structureVille: 'structureCache.ville',
    structureCodePostal: 'structureCache.codePostal',
    structureSiret: 'structureCache.siret',
    structureTva: 'structureCache.tva',
    structureType: 'structureCache.type',
    structurePays: 'structureCache.pays'
  },
  // Pour la collection programmateurs
  programmateurs: {
    // Propriétés structureCache
    structureRaisonSociale: 'structureCache.raisonSociale',
    structureAdresse: 'structureCache.adresse',
    structureVille: 'structureCache.ville',
    structureCodePostal: 'structureCache.codePostal',
    structureSiret: 'structureCache.siret',
    structureTva: 'structureCache.tva',
    structureType: 'structureCache.type',
    structurePays: 'structureCache.pays'
  },
  // Pour la collection artistes
  artistes: {
    // Renommage de l'attribut concerts en concertsAssocies pour cohérence
    concerts: 'concertsAssocies'
  }
};

// Définition de la structure standard des objets cache
const CACHE_OBJECTS = {
  structureCache: {
    fields: [
      'raisonSociale',
      'adresse',
      'codePostal',
      'ville',
      'pays',
      'siret',
      'tva',
      'type'
    ],
    idField: 'structureId'
  },
  programmateurCache: {
    fields: [
      'nom',
      'prenom',
      'email',
      'telephone',
      'fonction'
    ],
    idField: 'programmateurId'
  },
  lieuCache: {
    fields: [
      'nom',
      'adresse',
      'codePostal',
      'ville',
      'capacite'
    ],
    idField: 'lieuId'
  },
  artisteCache: {
    fields: [
      'nom',
      'style',
      'contact'
    ],
    idField: 'artisteId'
  }
};

/**
 * Transforme un document selon les règles de mappage définies
 * @param {Object} data Document à transformer
 * @param {Object} mappingRules Règles de mappage pour la collection
 */
function standardizeDocument(data, mappingRules) {
  const result = { ...data };
  const cacheObjects = {};

  // Première passe - identifier tous les objets cache à créer
  Object.entries(mappingRules).forEach(([oldKey, newKeyPath]) => {
    // Si c'est une propriété à déplacer vers un objet cache
    if (newKeyPath.includes('.') && data[oldKey] !== undefined) {
      const [cacheObjectName, fieldName] = newKeyPath.split('.');
      
      // Initialiser l'objet cache s'il n'existe pas
      if (!cacheObjects[cacheObjectName]) {
        cacheObjects[cacheObjectName] = {};
      }
      
      // Ajouter la propriété à l'objet cache
      cacheObjects[cacheObjectName][fieldName] = data[oldKey];
    } 
    // Si c'est un simple renommage
    else if (!newKeyPath.includes('.') && oldKey !== newKeyPath && data[oldKey] !== undefined) {
      result[newKeyPath] = data[oldKey];
      delete result[oldKey];
    }
  });

  // Deuxième passe - ajouter les ID aux objets cache quand disponibles
  Object.keys(cacheObjects).forEach(cacheObjectName => {
    const cacheObject = cacheObjects[cacheObjectName];
    const cacheConfig = CACHE_OBJECTS[cacheObjectName];
    
    if (cacheConfig && data[cacheConfig.idField]) {
      cacheObject.id = data[cacheConfig.idField];
    }
    
    // Ajouter un timestamp de mise à jour
    cacheObject.updatedAt = new Date().toISOString();
  });

  // Troisième passe - incorporer les objets cache au résultat final
  Object.keys(cacheObjects).forEach(cacheObjectName => {
    result[cacheObjectName] = cacheObjects[cacheObjectName];
  });

  // Quatrième passe - supprimer les propriétés déplacées vers des objets cache
  Object.entries(mappingRules).forEach(([oldKey, newKeyPath]) => {
    if (newKeyPath.includes('.') && result[oldKey] !== undefined) {
      delete result[oldKey];
    }
  });

  return result;
}

/**
 * Standardise les noms des propriétés d'une collection
 */
async function standardizeCollection(collectionName) {
  console.log(`\n======== Standardisation de la collection "${collectionName}" ========`);
  
  // Vérifier si nous avons des règles de mappage pour cette collection
  const mappingRules = PROPERTY_MAPPING[collectionName];
  if (!mappingRules) {
    console.log(`Aucune règle de mappage définie pour la collection "${collectionName}"`);
    return { total: 0, standardized: 0 };
  }
  
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Aucun document trouvé dans la collection "${collectionName}"`);
      return { total: 0, standardized: 0 };
    }
    
    console.log(`Standardisation de ${snapshot.size} documents...`);
    
    // Créer un batch pour les écritures
    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 400; // Limité par Firestore (max 500)
    
    let standardizedCount = 0;
    
    // Pour chaque document
    for (const docSnapshot of snapshot.docs) {
      const docId = docSnapshot.id;
      const originalData = docSnapshot.data();
      
      // Appliquer les règles de standardisation
      const standardizedData = standardizeDocument(originalData, mappingRules);
      
      // Vérifier si le document a effectivement été modifié
      const hasChanged = JSON.stringify(originalData) !== JSON.stringify(standardizedData);
      
      // Si le document a été modifié, le mettre à jour
      if (hasChanged) {
        console.log(`\nStandardisation du document ${docId}...`);
        
        if (!options.dryRun) {
          const docRef = doc(db, collectionName, docId);
          batch.set(docRef, standardizedData);
          
          batchCount++;
          
          // Si le batch est plein, l'exécuter et en créer un nouveau
          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            batch = writeBatch(db);
            batchCount = 0;
            console.log(`Batch de ${BATCH_SIZE} opérations exécuté`);
          }
        } else {
          console.log(`[MODE SIMULATION] Document ${docId} serait standardisé avec:`, JSON.stringify(standardizedData, null, 2).substring(0, 200) + '...');
        }
        
        standardizedCount++;
      }
    }
    
    // Exécuter le dernier batch s'il n'est pas vide
    if (!options.dryRun && batchCount > 0) {
      await batch.commit();
      console.log(`Dernier batch de ${batchCount} opérations exécuté`);
    }
    
    console.log(`\nStandardisation de ${collectionName} terminée: ${standardizedCount}/${snapshot.size} documents standardisés.`);
    
    return { total: snapshot.size, standardized: standardizedCount };
    
  } catch (error) {
    console.error(`Erreur lors de la standardisation de la collection "${collectionName}":`, error);
    return { total: 0, standardized: 0, error: true };
  }
}

/**
 * Exécute la standardisation sur les collections spécifiées
 */
async function main() {
  console.log('Démarrage de la standardisation des noms de propriétés...');
  console.log('Date: ' + new Date().toISOString());
  console.log('Mode: ' + (options.dryRun ? 'SIMULATION' : 'RÉEL'));
  
  if (options.dryRun) {
    console.log('⚠️  Mode simulation: aucune modification ne sera écrite dans Firebase');
  }
  
  const results = {};
  
  // Si une collection spécifique est demandée
  if (options.collection) {
    if (PROPERTY_MAPPING[options.collection]) {
      results[options.collection] = await standardizeCollection(options.collection);
    } else {
      console.error(`Collection non reconnue ou sans règles de mappage: ${options.collection}`);
      process.exit(1);
    }
  } 
  // Sinon, traiter toutes les collections configurées
  else {
    // Traiter dans un ordre spécifique pour minimiser les impacts
    const collectionOrder = ['lieux', 'artistes', 'structures', 'programmateurs', 'concerts'];
    
    for (const collectionName of collectionOrder) {
      if (PROPERTY_MAPPING[collectionName]) {
        results[collectionName] = await standardizeCollection(collectionName);
      }
    }
  }
  
  // Afficher le résumé
  console.log('\n======== Résumé de la standardisation ========');
  let totalDocuments = 0;
  let totalStandardized = 0;
  
  Object.entries(results).forEach(([collection, result]) => {
    console.log(`${collection}: ${result.standardized}/${result.total} documents standardisés`);
    totalDocuments += result.total;
    totalStandardized += result.standardized;
  });
  
  console.log(`\nTotal: ${totalStandardized}/${totalDocuments} documents standardisés`);
  
  if (options.dryRun) {
    console.log('\n⚠️  C\'était une simulation. Pour effectuer les modifications réelles, exécuter sans --dry-run');
  }
  
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur dans le script de standardisation:', error);
  process.exit(1);
});