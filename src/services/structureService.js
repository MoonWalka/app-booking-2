import { db } from '@/services/firebase-service';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  limit,
  Timestamp 
} from 'firebase/firestore';

/**
 * Service pour la gestion des structures
 * Gère la synchronisation bidirectionnelle entre structures et programmateurs
 */

/**
 * Assure qu'une structure existe et est synchronisée
 * @param {string} structureId - ID de la structure
 * @param {Object} structureData - Données de la structure (optionnel)
 * @returns {Promise<string>} - ID de la structure
 */
export async function ensureStructureEntity(structureId, structureData = {}) {
  if (!structureId) {
    throw new Error('ID de structure requis');
  }

  try {
    // Vérifier si la structure existe
    const structureRef = doc(db, 'structures', structureId);
    const structureDoc = await getDoc(structureRef);

    if (structureDoc.exists()) {
      // Structure existe, la mettre à jour si des données sont fournies
      if (Object.keys(structureData).length > 0) {
        const updateData = {
          ...structureData,
          updatedAt: Timestamp.now()
        };
        
        await updateDoc(structureRef, updateData);
      }
      
      return structureId;
    } else {
      // Structure n'existe pas, la créer
      const newStructureData = {
        nom: structureData.nom || `Structure ${structureId}`,
        type: structureData.type || 'association',
        adresse: structureData.adresse || {},
        contacts: structureData.contacts || {},
        programmateursAssocies: structureData.programmateursAssocies || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...structureData
      };

      await setDoc(structureRef, newStructureData);
      
      return structureId;
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation de la structure via structureService:', error);
    throw error;
  }
}

/**
 * Recherche des structures par nom
 * @param {string} searchTerm - Terme de recherche
 * @param {number} maxResults - Nombre maximum de résultats (défaut: 10)
 * @returns {Promise<Array>} - Liste des structures trouvées
 */
export async function searchStructures(searchTerm, maxResults = 10) {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  try {
    const searchTermLower = searchTerm.toLowerCase();
    
    // Recherche par nom/raison sociale
    const q = query(
      collection(db, 'structures'),
      where('nom', '>=', searchTerm),
      where('nom', '<=', searchTerm + '\uf8ff'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      const structure = {
        id: doc.id,
        ...doc.data()
      };
      results.push(structure);
    });

    return results;
  } catch (error) {
    console.error('Erreur lors de la recherche de structures:', error);
    return [];
  }
}

/**
 * Récupère une structure par son ID
 * @param {string} structureId - ID de la structure
 * @returns {Promise<Object|null>} - Données de la structure ou null si non trouvée
 */
export async function getStructureById(structureId) {
  if (!structureId) {
    return null;
  }

  try {
    const structureDoc = await getDoc(doc(db, 'structures', structureId));
    
    if (structureDoc.exists()) {
      return {
        id: structureDoc.id,
        ...structureDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la structure:', error);
    return null;
  }
}

/**
 * Synchronise les données d'une structure avec ses programmateurs associés
 * @param {string} structureId - ID de la structure
 */
export async function syncStructureToAssociatedProgrammateurs(structureId) {
  // Fonction désactivée temporairement pour éviter les boucles infinies
  // TODO: Réactiver quand la logique bidirectionnelle sera stabilisée
  
  if (!structureId) {
    console.warn(`Structure ${structureId} introuvable`);
    return;
  }

  return Promise.resolve();
  
  /* TODO: Réactiver ce code quand nécessaire
  try {
    // Récupérer la structure
    const structureDoc = await getDoc(doc(db, 'structures', structureId));
    if (!structureDoc.exists()) {
      return;
    }

    const structureData = structureDoc.data();
    const programmateursAssocies = structureData.programmateursAssocies || [];

    // Mettre à jour chaque programmateur associé
    for (const progId of programmateursAssocies) {
      try {
        const progRef = doc(db, 'programmateurs', progId);
        await updateDoc(progRef, {
          structure: {
            id: structureId,
            nom: structureData.nom,
            type: structureData.type
          },
          updatedAt: Timestamp.now()
        });
      } catch (error) {
        console.error(`Erreur lors de la synchronisation des programmateurs avec la structure ${structureId}:`, error);
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la synchronisation des programmateurs avec la structure ${structureId}:`, error);
  }
  */
}