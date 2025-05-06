/**
 * Script de transformation des données Firebase
 * 
 * Ce script transforme les données de Firebase pour:
 * - Standardiser les noms de propriétés
 * - Restructurer les relations entre entités selon le modèle hybride
 * - Créer des caches de données fréquemment utilisées
 * 
 * Utilisation: node transform-data.js [--dry-run] [--collection=nom_collection]
 */

// Importer notre initialisation Firebase pour Node.js
const {
  db, collection, doc, getDoc, getDocs, 
  setDoc, updateDoc, query, writeBatch
} = require('./firebase-node');

// Options par défaut
const options = {
  dryRun: process.argv.includes('--dry-run'),
  collection: process.argv.find(arg => arg.startsWith('--collection='))?.split('=')[1]
};

// Définir les relations entre collections pour le caching
const ENTITY_RELATIONS = {
  programmateurs: {
    relations: [
      { 
        field: 'structureId', 
        collection: 'structures', 
        cacheFields: ['raisonSociale', 'type', 'ville', 'siren']
      }
    ]
  },
  concerts: {
    relations: [
      {
        field: 'lieuId',
        collection: 'lieux',
        cacheFields: ['nom', 'ville', 'adresse', 'capacite']
      },
      {
        field: 'artisteId',
        collection: 'artistes',
        cacheFields: ['nom', 'style', 'contact']
      }
    ]
  },
  contrats: {
    relations: [
      {
        field: 'concertId',
        collection: 'concerts',
        cacheFields: ['date', 'titre']
      },
      {
        field: 'programmeurId',
        collection: 'programmateurs',
        cacheFields: ['nom', 'prenom', 'email']
      }
    ]
  }
};

// Mapping des propriétés à standardiser
const PROPERTY_MAPPING = {
  structure_id: 'structureId',
  'structure-id': 'structureId',
  StructureId: 'structureId',
  Programmateur_ID: 'programmateurId',
  programmateur_id: 'programmateurId',
  artisteID: 'artisteId',
  LieuID: 'lieuId',
  lieu_id: 'lieuId',
  concert_id: 'concertId',
  Concert_ID: 'concertId',
  Structure: 'structure',
  Nom: 'nom',
  Email: 'email',
  Prenom: 'prenom',
  Date_Concert: 'date',
  raison_sociale: 'raisonSociale',
  RaisonSociale: 'raisonSociale'
};

/**
 * Standardise les noms des propriétés d'un objet
 */
function standardizePropertyNames(data) {
  const result = { ...data };
  
  Object.entries(data).forEach(([key, value]) => {
    // Si ce nom de propriété doit être remappé
    if (PROPERTY_MAPPING[key]) {
      const standardizedKey = PROPERTY_MAPPING[key];
      
      // Éviter les doublons si la propriété standardisée existe déjà
      if (result[standardizedKey] === undefined) {
        result[standardizedKey] = value;
        delete result[key];
      }
    }
  });
  
  return result;
}

/**
 * Récupère les données d'une entité pour le cache
 */
async function getEntityDataForCache(collectionName, docId, fieldsToCache) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.warn(`Document ${docId} dans ${collectionName} n'existe pas pour le cache`);
      return null;
    }
    
    const data = docSnap.data();
    const cache = {};
    
    fieldsToCache.forEach(field => {
      cache[field] = data[field] !== undefined ? data[field] : null;
    });
    
    return cache;
  } catch (error) {
    console.error(`Erreur lors de la récupération du cache pour ${collectionName}/${docId}:`, error);
    return null;
  }
}

/**
 * Transforme une collection selon le nouveau modèle
 */
async function transformCollection(collectionName) {
  console.log(`\n======== Transformation de la collection "${collectionName}" ========`);
  
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Aucun document trouvé dans la collection "${collectionName}"`);
      return { total: 0, transformed: 0 };
    }
    
    console.log(`Transformation de ${snapshot.size} documents...`);
    
    // Obtenir la configuration des relations pour cette collection
    const relationConfig = ENTITY_RELATIONS[collectionName]?.relations || [];
    
    // Créer un batch pour les écritures
    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 400; // Limité par Firestore (max 500)
    
    let transformedCount = 0;
    
    // Pour chaque document
    for (const docSnapshot of snapshot.docs) {
      const docId = docSnapshot.id;
      let data = docSnapshot.data();
      
      console.log(`\nTransformation du document ${docId}...`);
      
      // Standardiser les noms de propriétés
      data = standardizePropertyNames(data);
      
      // Traiter les relations et ajouter les caches
      for (const relation of relationConfig) {
        const entityId = data[relation.field];
        
        if (entityId) {
          // Si c'est un tableau d'IDs
          if (Array.isArray(entityId)) {
            const caches = [];
            for (const id of entityId) {
              const cache = await getEntityDataForCache(relation.collection, id, relation.cacheFields);
              if (cache) {
                caches.push(cache);
              }
            }
            
            // Ajouter le cache au document
            const cacheFieldName = `${relation.collection.slice(0, -1)}Cache`; // Enlever le 's' final
            data[`${cacheFieldName}s`] = caches; // Mettre au pluriel pour les tableaux
          } 
          // Si c'est un ID simple
          else {
            const cache = await getEntityDataForCache(relation.collection, entityId, relation.cacheFields);
            
            if (cache) {
              // Ajouter le cache au document
              const cacheFieldName = `${relation.collection.slice(0, -1)}Cache`; // Enlever le 's' final
              data[cacheFieldName] = cache;
            }
          }
        }
      }
      
      // Mise à jour ou remplacement du document
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
        console.log(`[MODE SIMULATION] Document ${docId} serait mis à jour avec:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
      }
      
      transformedCount++;
    }
    
    // Exécuter le dernier batch s'il n'est pas vide
    if (!options.dryRun && batchCount > 0) {
      await batch.commit();
      console.log(`Dernier batch de ${batchCount} opérations exécuté`);
    }
    
    console.log(`\nTransformation de ${collectionName} terminée: ${transformedCount}/${snapshot.size} documents transformés.`);
    
    return { total: snapshot.size, transformed: transformedCount };
    
  } catch (error) {
    console.error(`Erreur lors de la transformation de la collection "${collectionName}":`, error);
    return { total: 0, transformed: 0, error: true };
  }
}

/**
 * Exécute la transformation sur les collections spécifiées
 */
async function main() {
  console.log('Démarrage de la transformation des données Firebase...');
  console.log('Date: ' + new Date().toISOString());
  console.log('Mode: ' + (options.dryRun ? 'SIMULATION' : 'RÉEL'));
  
  if (options.dryRun) {
    console.log('⚠️  Mode simulation: aucune modification ne sera écrite dans Firebase');
  }
  
  const results = {};
  
  // Si une collection spécifique est demandée
  if (options.collection) {
    if (ENTITY_RELATIONS[options.collection] || options.collection) {
      results[options.collection] = await transformCollection(options.collection);
    } else {
      console.error(`Collection non reconnue: ${options.collection}`);
      process.exit(1);
    }
  } 
  // Sinon, traiter toutes les collections configurées
  else {
    for (const collectionName of Object.keys(ENTITY_RELATIONS)) {
      results[collectionName] = await transformCollection(collectionName);
    }
  }
  
  // Afficher le résumé
  console.log('\n======== Résumé de la transformation ========');
  let totalDocuments = 0;
  let totalTransformed = 0;
  
  Object.entries(results).forEach(([collection, result]) => {
    console.log(`${collection}: ${result.transformed}/${result.total} documents transformés`);
    totalDocuments += result.total;
    totalTransformed += result.transformed;
  });
  
  console.log(`\nTotal: ${totalTransformed}/${totalDocuments} documents transformés`);
  
  if (options.dryRun) {
    console.log('\n⚠️  C\'était une simulation. Pour effectuer les modifications réelles, exécuter sans --dry-run');
  }
  
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur dans le script de transformation:', error);
  process.exit(1);
});