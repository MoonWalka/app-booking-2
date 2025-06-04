/**
 * Service de synchronisation entre la base locale et Firebase
 * Permet d'importer/exporter des données entre les deux environnements
 */
import { db as firebaseDB, IS_LOCAL_MODE } from '../services/firebase-service';
import { collection, getDocs, doc, setDoc } from '../services/firebase-service';
// 🚀 PHASE 3C : Remplacement mockStorage par Firebase Testing SDK
import firebaseEmulatorService from './firebase-emulator-service';

/**
 * Exporte les données locales vers Firebase
 * @param {Array} collections - Liste des collections à synchroniser
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
export async function exportLocalDataToFirebase(collections = ['concerts', 'lieux', 'programmateurs', 'artistes', 'structures']) {
  // En mode local, vérifier que Firebase est bien disponible pour la synchronisation
  if (!firebaseDB || typeof firebaseDB.collection !== 'function') {
    console.error('Firebase n\'est pas correctement initialisé pour la synchronisation');
    return false;
  }

  if (!window.confirm('Cette action va exporter vos données locales vers Firebase. Continuer?')) {
    return false;
  }
  
  try {
    const localData = await firebaseEmulatorService._getRawLocalData();
    // let successCount = 0; // Compteur de débogage - logs supprimés
    let errorCount = 0;
    
    for (const collName of collections) {
      const localCollection = localData[collName] || {};
      
      console.log(`Synchronisation de la collection ${collName} - ${Object.keys(localCollection).length} documents`);
      
      for (const [docId, data] of Object.entries(localCollection)) {
        try {
          const docRef = doc(firebaseDB, collName, docId);
          await setDoc(docRef, data);
          // successCount++;
        } catch (error) {
          console.error(`Erreur lors de la synchronisation de ${collName}/${docId}:`, error);
          errorCount++;
        }
      }
    }
    
    return errorCount === 0;
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    return false;
  }
}

/**
 * Importe des données de Firebase vers le stockage local
 * @param {Array} collections - Liste des collections à importer
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
export async function importFirebaseDataToLocal(collections = ['concerts', 'lieux', 'programmateurs', 'artistes', 'structures']) {
  // En mode local, vérifier que Firebase est bien disponible pour la synchronisation
  if (!firebaseDB || typeof firebaseDB.collection !== 'function') {
    console.error('Firebase n\'est pas correctement initialisé pour la synchronisation');
    return false;
  }

  if (!window.confirm('Cette action va importer des données de Firebase vers votre stockage local. Continuer?')) {
    return false;
  }
  
  try {
    // Obtenir les données locales actuelles
    const localData = await firebaseEmulatorService._getRawLocalData();
    // let successCount = 0; // Compteur de débogage - logs supprimés
    let errorCount = 0;
    
    // Pour chaque collection
    for (const collName of collections) {
      try {
        // Préparer une version vide si la collection n'existe pas localement
        if (!localData[collName]) {
          localData[collName] = {};
        }
        
        // Récupérer les données de Firebase
        const collRef = collection(firebaseDB, collName);
        const snapshot = await getDocs(collRef);
        
        if (snapshot.empty) {
          console.log(`Collection ${collName} vide dans Firebase, rien à importer`);
          continue;
        }
        
        // Pour chaque document
        for (const doc of snapshot.docs) {
          localData[collName][doc.id] = doc.data();
          // successCount++;
        }
        
        console.log(`Collection ${collName} importée: ${snapshot.docs.length} documents`);
      } catch (error) {
        console.error(`Erreur lors de l'importation de la collection ${collName}:`, error);
        errorCount++;
      }
    }
    
    // Sauvegarder les données importées
    await firebaseEmulatorService._importRawData(localData);
    
    return errorCount === 0;
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
    return false;
  }
}

/**
 * Exporte un sous-ensemble spécifique de données
 * @param {string} collectionName - Nom de la collection
 * @param {Array} documentIds - Liste des IDs de documents à exporter
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
export async function exportSpecificDocuments(collectionName, documentIds) {
  if (!firebaseDB || !Array.isArray(documentIds) || documentIds.length === 0) {
    return false;
  }
  
  try {
    const localData = await firebaseEmulatorService._getRawLocalData();
    const localCollection = localData[collectionName] || {};
    
    for (const docId of documentIds) {
      const data = localCollection[docId];
      if (data) {
        const docRef = doc(firebaseDB, collectionName, docId);
        await setDoc(docRef, data);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'exportation spécifique:', error);
    return false;
  }
}

/**
 * Sauvegarde les données locales dans un fichier JSON
 */
export function backupLocalData() {
  try {
    // 🚀 PHASE 3C : Fonction async pour compatibilité émulateur
    firebaseEmulatorService._getRawLocalData().then(localData => {
      const jsonData = JSON.stringify(localData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      
      a.href = url;
      a.download = `tourcraft_local_backup_${timestamp}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    }).catch(error => {
      console.error('Erreur lors de la sauvegarde des données locales:', error);
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données locales:', error);
    return false;
  }
}

/**
 * Restaure les données locales à partir d'un fichier JSON
 * @param {File} file - Le fichier de sauvegarde JSON
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
export async function restoreLocalData(file) {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/json') {
      reject(new Error('Format de fichier invalide'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        await firebaseEmulatorService._importRawData(data);
        resolve(true);
      } catch (error) {
        console.error('Erreur lors de la restauration des données:', error);
        reject(error);
      }
    };
    
    reader.onerror = (e) => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Active le mode synchronisation automatique (version de démonstration)
 * @param {number} intervalMinutes - Intervalle de synchronisation en minutes
 * @returns {Function} - Fonction pour arrêter la synchronisation
 */
export function enableAutoSync(intervalMinutes = 30) {
  // Ne fonctionne que si nous ne sommes pas en mode local
  if (IS_LOCAL_MODE) {
    console.warn('La synchronisation automatique n\'est pas disponible en mode local');
    return () => {};
  }
  
  console.log(`Synchronisation automatique activée (${intervalMinutes} minutes)`);
  
  // Démarrer la synchronisation automatique
  const interval = setInterval(async () => {
    try {
      await exportLocalDataToFirebase(['concerts', 'lieux', 'programmateurs']);
    } catch (error) {
      console.error('Erreur dans la synchronisation automatique:', error);
    }
  }, intervalMinutes * 60 * 1000);
  
  // Retourner une fonction pour arrêter la synchronisation
  return () => {
    clearInterval(interval);
    console.log('Synchronisation automatique désactivée');
  };
}

const syncService = {
  exportLocalDataToFirebase,
  importFirebaseDataToLocal,
  exportSpecificDocuments,
  backupLocalData,
  restoreLocalData,
  enableAutoSync
};

export default syncService;
