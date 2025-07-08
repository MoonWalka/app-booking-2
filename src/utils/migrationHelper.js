/**
 * Helper pour les migrations de données
 */

import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Migre des données d'une collection vers une autre
 * @param {string} fromCollection - Collection source
 * @param {string} toCollection - Collection destination
 * @param {Function} transformer - Fonction pour transformer les données
 * @returns {Promise<Object>} Résultat de la migration
 */
export async function migrateCollection(fromCollection, toCollection, transformer = null) {
  console.log(`[Migration] ${fromCollection} → ${toCollection}`);
  
  try {
    const sourceSnapshot = await getDocs(collection(db, fromCollection));
    
    if (sourceSnapshot.empty) {
      return {
        success: true,
        count: 0,
        message: 'Aucun document à migrer'
      };
    }
    
    const batch = writeBatch(db);
    let count = 0;
    
    sourceSnapshot.forEach((sourceDoc) => {
      const data = sourceDoc.data();
      const transformedData = transformer ? transformer(data) : data;
      
      const destRef = doc(db, toCollection, sourceDoc.id);
      batch.set(destRef, {
        ...transformedData,
        _migratedFrom: fromCollection,
        _migratedAt: serverTimestamp()
      });
      
      count++;
      
      // Commit par batch de 500 (limite Firestore)
      if (count % 500 === 0) {
        batch.commit();
      }
    });
    
    // Commit final
    if (count % 500 !== 0) {
      await batch.commit();
    }
    
    return {
      success: true,
      count,
      message: `${count} documents migrés avec succès`
    };
    
  } catch (error) {
    console.error('[Migration] Erreur:', error);
    return {
      success: false,
      count: 0,
      message: error.message,
      error
    };
  }
}

/**
 * Vérifie l'état d'une migration
 * @param {string} collectionName - Nom de la collection
 * @returns {Promise<Object>} État de la collection
 */
export async function checkCollectionStatus(collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    
    let migrated = 0;
    let original = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data._migratedFrom) {
        migrated++;
      } else {
        original++;
      }
    });
    
    return {
      total: snapshot.size,
      migrated,
      original,
      exists: snapshot.size > 0
    };
    
  } catch (error) {
    console.error('[checkCollectionStatus] Erreur:', error);
    return {
      total: 0,
      migrated: 0,
      original: 0,
      exists: false,
      error: error.message
    };
  }
}

/**
 * Nettoie les champs de migration
 * @param {string} collectionName - Nom de la collection
 * @returns {Promise<Object>} Résultat du nettoyage
 */
export async function cleanMigrationFields(collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    let count = 0;
    
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data._migratedFrom || data._migratedAt) {
        const docRef = doc(db, collectionName, docSnapshot.id);
        const updates = {};
        
        if (data._migratedFrom) updates._migratedFrom = null;
        if (data._migratedAt) updates._migratedAt = null;
        
        batch.update(docRef, updates);
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
    }
    
    return {
      success: true,
      count,
      message: `${count} documents nettoyés`
    };
    
  } catch (error) {
    console.error('[cleanMigrationFields] Erreur:', error);
    return {
      success: false,
      count: 0,
      message: error.message,
      error
    };
  }
}

/**
 * Migration multi-organisation
 * @param {string} entrepriseId - ID de l'organisation
 * @returns {Promise<Object>} Résultat de la migration
 */
export async function migrateToMultiOrg(entrepriseId) {
  console.log('[migrateToMultiOrg] Début de la migration multi-org pour:', entrepriseId);
  
  const collections = ['artistes', 'lieux', 'dates', 'structures', 'contacts'];
  const results = {};
  
  try {
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      let updated = 0;
      
      const batch = writeBatch(db);
      
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (!data.entrepriseId) {
          batch.update(doc(db, collectionName, docSnapshot.id), {
            entrepriseId: entrepriseId
          });
          updated++;
        }
      });
      
      if (updated > 0) {
        await batch.commit();
      }
      
      results[collectionName] = {
        total: snapshot.size,
        updated
      };
    }
    
    return {
      success: true,
      results,
      message: 'Migration multi-organisation terminée'
    };
    
  } catch (error) {
    console.error('[migrateToMultiOrg] Erreur:', error);
    return {
      success: false,
      results,
      message: error.message,
      error
    };
  }
}