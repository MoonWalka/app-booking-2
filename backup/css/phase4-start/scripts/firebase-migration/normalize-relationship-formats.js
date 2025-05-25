/**
 * Script de normalisation des formats de relations
 * 
 * Ce script standardise les tableaux d'associations (concertsAssocies, lieuxAssocies)
 * et crée les références croisées manquantes entre les collections.
 * 
 * Utilisation: node normalize-relationship-formats.js [--dry-run] [--collection=nom_collection]
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

// Définition des relations entre collections pour les tableaux associés
const ASSOCIATION_MAPPINGS = {
  // Pour la collection programmateurs
  programmateurs: {
    associations: [
      {
        arrayField: 'lieuxAssocies',
        targetCollection: 'lieux',
        standardFormat: {
          requiredFields: ['id', 'nom'],
          dateField: 'dateAssociation'
        }
      },
      {
        arrayField: 'concertsAssocies',
        targetCollection: 'concerts',
        standardFormat: {
          requiredFields: ['id', 'titre', 'date'],
          dateField: 'dateAssociation'
        }
      }
    ]
  },
  // Pour la collection lieux
  lieux: {
    associations: [
      {
        arrayField: 'programmateursAssocies',
        targetCollection: 'programmateurs',
        standardFormat: {
          requiredFields: ['id', 'nom', 'prenom'],
          dateField: 'dateAssociation'
        }
      }
    ]
  },
  // Pour la collection artistes
  artistes: {
    associations: [
      {
        // Renommage de concerts en concertsAssocies pour cohérence
        arrayField: 'concerts',
        targetCollection: 'concerts',
        newFieldName: 'concertsAssocies',
        standardFormat: {
          requiredFields: ['id', 'titre', 'date'],
          dateField: 'dateAssociation'
        }
      }
    ]
  }
};

/**
 * Standardise un tableau d'associations selon le format défini
 * @param {Array} associationsArray Tableau d'associations à standardiser
 * @param {Object} standardFormat Format standard à appliquer
 * @param {string} targetCollection Nom de la collection cible
 * @returns {Array} Tableau standardisé
 */
async function standardizeAssociationArray(associationsArray, standardFormat, targetCollection) {
  // Si le tableau n'existe pas ou n'est pas un tableau, retourner un tableau vide
  if (!associationsArray || !Array.isArray(associationsArray)) {
    return [];
  }

  // Tableau qui contiendra les associations standardisées
  const standardizedArray = [];

  // Pour chaque élément du tableau d'associations
  for (const item of associationsArray) {
    // Si l'item est null ou n'est pas un objet, l'ignorer
    if (!item || typeof item !== 'object') {
      continue;
    }

    // Récupérer l'ID de l'item
    const itemId = item.id;
    if (!itemId) {
      console.warn('Élément sans ID trouvé, ignoré:', item);
      continue;
    }

    // Créer l'objet standardisé
    const standardizedItem = {
      id: itemId,
      // Ajouter un timestamp de date d'association si absent
      [standardFormat.dateField]: item[standardFormat.dateField] || new Date().toISOString()
    };

    // Essayer de récupérer les données complètes de l'entité associée
    try {
      const entityRef = doc(db, targetCollection, itemId);
      const entitySnap = await getDoc(entityRef);

      // Si l'entité existe, récupérer les champs requis
      if (entitySnap.exists()) {
        const entityData = entitySnap.data();

        // Ajouter tous les champs requis
        for (const field of standardFormat.requiredFields) {
          if (field !== 'id') { // L'ID est déjà géré
            standardizedItem[field] = entityData[field] || item[field] || null;
          }
        }
      }
      // Sinon, essayer d'utiliser les données de l'item actuel
      else {
        console.warn(`Entité ${targetCollection}/${itemId} non trouvée, utilisation des données existantes.`);
        
        // Ajouter tous les champs requis à partir des données existantes
        for (const field of standardFormat.requiredFields) {
          if (field !== 'id') { // L'ID est déjà géré
            standardizedItem[field] = item[field] || null;
          }
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'entité ${targetCollection}/${itemId}:`, error);
      
      // En cas d'erreur, utiliser les données existantes
      for (const field of standardFormat.requiredFields) {
        if (field !== 'id') { // L'ID est déjà géré
          standardizedItem[field] = item[field] || null;
        }
      }
    }

    // Ajouter l'item standardisé au tableau
    standardizedArray.push(standardizedItem);
  }

  return standardizedArray;
}

/**
 * Normalise les tableaux d'associations d'une collection
 */
async function normalizeCollection(collectionName) {
  console.log(`\n======== Normalisation de la collection "${collectionName}" ========`);
  
  // Vérifier si nous avons des mappings d'associations pour cette collection
  const associationMappings = ASSOCIATION_MAPPINGS[collectionName];
  if (!associationMappings || !associationMappings.associations.length) {
    console.log(`Aucun mapping d'association défini pour la collection "${collectionName}"`);
    return { total: 0, normalized: 0 };
  }
  
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Aucun document trouvé dans la collection "${collectionName}"`);
      return { total: 0, normalized: 0 };
    }
    
    console.log(`Normalisation de ${snapshot.size} documents...`);
    
    // Créer un batch pour les écritures
    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 400; // Limité par Firestore (max 500)
    
    let normalizedCount = 0;
    
    // Pour chaque document
    for (const docSnapshot of snapshot.docs) {
      const docId = docSnapshot.id;
      const originalData = docSnapshot.data();
      
      // Nouveau document qui contiendra les données normalisées
      const normalizedData = { ...originalData };
      
      // Indicateur pour savoir si le document a été modifié
      let hasChanged = false;
      
      // Pour chaque configuration d'association
      for (const associationConfig of associationMappings.associations) {
        const { arrayField, targetCollection, standardFormat, newFieldName } = associationConfig;
        
        // Vérifier si le tableau est présent
        if (originalData[arrayField]) {
          // Standardiser le tableau
          const standardizedArray = await standardizeAssociationArray(
            originalData[arrayField], 
            standardFormat, 
            targetCollection
          );
          
          // Si un nouveau nom de champ est spécifié, renommer le champ
          const fieldNameToUse = newFieldName || arrayField;
          
          // Mettre à jour le document avec le tableau standardisé
          normalizedData[fieldNameToUse] = standardizedArray;
          
          // Si on a renommé le champ et que c'est différent, supprimer l'ancien
          if (newFieldName && newFieldName !== arrayField) {
            delete normalizedData[arrayField];
          }
          
          // Vérifier si le tableau a été modifié
          const originalJson = JSON.stringify(originalData[arrayField]);
          const newJson = JSON.stringify(standardizedArray);
          
          if (originalJson !== newJson || (newFieldName && newFieldName !== arrayField)) {
            hasChanged = true;
          }
        }
      }
      
      // Si le document a été modifié, le mettre à jour
      if (hasChanged) {
        console.log(`\nNormalisation du document ${docId}...`);
        
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
          console.log(`[MODE SIMULATION] Document ${docId} serait normalisé avec:`, JSON.stringify(normalizedData, null, 2).substring(0, 200) + '...');
        }
        
        normalizedCount++;
      }
    }
    
    // Exécuter le dernier batch s'il n'est pas vide
    if (!options.dryRun && batchCount > 0) {
      await batch.commit();
      console.log(`Dernier batch de ${batchCount} opérations exécuté`);
    }
    
    console.log(`\nNormalisation de ${collectionName} terminée: ${normalizedCount}/${snapshot.size} documents normalisés.`);
    
    return { total: snapshot.size, normalized: normalizedCount };
    
  } catch (error) {
    console.error(`Erreur lors de la normalisation de la collection "${collectionName}":`, error);
    return { total: 0, normalized: 0, error: true };
  }
}

/**
 * Exécute la normalisation sur les collections spécifiées
 */
async function main() {
  console.log('Démarrage de la normalisation des formats de relations...');
  console.log('Date: ' + new Date().toISOString());
  console.log('Mode: ' + (options.dryRun ? 'SIMULATION' : 'RÉEL'));
  
  if (options.dryRun) {
    console.log('⚠️  Mode simulation: aucune modification ne sera écrite dans Firebase');
  }
  
  const results = {};
  
  // Si une collection spécifique est demandée
  if (options.collection) {
    if (ASSOCIATION_MAPPINGS[options.collection]) {
      results[options.collection] = await normalizeCollection(options.collection);
    } else {
      console.error(`Collection non reconnue ou sans mappings d'association: ${options.collection}`);
      process.exit(1);
    }
  } 
  // Sinon, traiter toutes les collections configurées
  else {
    // Collecter toutes les collections avec mappings
    const collectionsToProcess = Object.keys(ASSOCIATION_MAPPINGS);
    
    for (const collectionName of collectionsToProcess) {
      results[collectionName] = await normalizeCollection(collectionName);
    }
  }
  
  // Afficher le résumé
  console.log('\n======== Résumé de la normalisation ========');
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
  console.error('Erreur dans le script de normalisation:', error);
  process.exit(1);
});