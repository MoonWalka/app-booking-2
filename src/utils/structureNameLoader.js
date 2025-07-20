/**
 * Utilitaire pour charger dynamiquement les noms de structures
 * Utilisé pour la refactorisation où on ne stocke plus structureNom dans les dates
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Cache simple pour éviter de recharger les mêmes structures
 */
const structureNameCache = new Map();

/**
 * Charge le nom d'une structure par son ID
 * @param {string} structureId - L'ID de la structure
 * @returns {Promise<string>} Le nom de la structure ou 'Structure inconnue'
 */
export async function loadStructureName(structureId) {
  if (!structureId) return 'Structure inconnue';
  
  // Vérifier le cache
  if (structureNameCache.has(structureId)) {
    return structureNameCache.get(structureId);
  }
  
  try {
    const structureDoc = await getDoc(doc(db, 'structures', structureId));
    if (structureDoc.exists()) {
      const data = structureDoc.data();
      const name = data.raisonSociale || data.nom || 'Structure sans nom';
      structureNameCache.set(structureId, name);
      return name;
    }
  } catch (error) {
    console.warn(`Erreur lors du chargement de la structure ${structureId}:`, error);
  }
  
  return 'Structure inconnue';
}

/**
 * Charge plusieurs noms de structures en parallèle
 * @param {string[]} structureIds - Tableau d'IDs de structures
 * @returns {Promise<Object>} Objet avec les IDs comme clés et les noms comme valeurs
 */
export async function loadStructureNames(structureIds) {
  const uniqueIds = [...new Set(structureIds.filter(id => id))];
  const results = {};
  
  await Promise.all(
    uniqueIds.map(async (id) => {
      results[id] = await loadStructureName(id);
    })
  );
  
  return results;
}

/**
 * Vide le cache (utile après une modification de structure)
 */
export function clearStructureNameCache() {
  structureNameCache.clear();
}

/**
 * Supprime une entrée spécifique du cache
 * @param {string} structureId - L'ID de la structure à supprimer du cache
 */
export function invalidateStructureName(structureId) {
  structureNameCache.delete(structureId);
}