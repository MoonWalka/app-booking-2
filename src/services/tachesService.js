import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Service de gestion des tâches (manuel + automatique)
 */
const tachesService = {
  /**
   * Crée une nouvelle tâche (manuelle ou automatique)
   * @param {Object} tacheData - Données de la tâche (voir structure dans useTaches.js)
   * @returns {Promise<string>} - ID de la tâche créée
   */
  async creerTache(tacheData) {
    const now = new Date();
    const docRef = await addDoc(collection(db, 'taches'), {
      ...tacheData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      statut: tacheData.statut || 'a_faire',
      automatique: !!tacheData.automatique,
      historique: [
        {
          action: 'création',
          date: now,
          userId: tacheData.createdBy || null,
          commentaire: tacheData.automatique ? 'Tâche créée automatiquement' : 'Tâche créée manuellement'
        }
      ]
    });
    return docRef.id;
  }
};

export default tachesService; 