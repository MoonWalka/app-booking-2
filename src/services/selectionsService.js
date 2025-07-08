import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { db } from './firebase-service';

/**
 * Service pour gérer les sélections de recherche sauvegardées
 */
class SelectionsService {
  constructor() {
    this.collectionName = 'selections';
  }

  /**
   * Créer une nouvelle sélection
   * @param {Object} selectionData - Données de la sélection
   * @param {string} selectionData.nom - Nom de la sélection
   * @param {string} selectionData.type - Type de recherche (contacts, dates, lieux, etc.)
   * @param {Array} selectionData.criteres - Critères de recherche
   * @param {boolean} selectionData.shared - Si la sélection est partagée
   * @param {string} userId - ID de l'utilisateur
   * @param {string} entrepriseId - ID de l'organisation
   * @returns {Promise<Object>} - Résultat de la création
   */
  async createSelection(selectionData, userId, entrepriseId) {
    try {
      if (!userId || !entrepriseId) {
        throw new Error('userId et entrepriseId sont requis');
      }

      const newSelection = {
        ...selectionData,
        userId,
        entrepriseId,
        shared: selectionData.shared || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), newSelection);
      
      console.log('✅ [SelectionsService] Sélection créée:', docRef.id);
      
      return {
        success: true,
        id: docRef.id,
        data: { ...newSelection, id: docRef.id }
      };
    } catch (error) {
      console.error('❌ [SelectionsService] Erreur création sélection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer toutes les sélections de l'utilisateur et de l'organisation
   * @param {string} userId - ID de l'utilisateur
   * @param {string} entrepriseId - ID de l'organisation
   * @returns {Promise<Object>} - Liste des sélections
   */
  async getUserSelections(userId, entrepriseId) {
    try {
      if (!userId || !entrepriseId) {
        throw new Error('userId et entrepriseId sont requis');
      }

      // Requête pour récupérer :
      // 1. Les sélections de l'utilisateur dans cette organisation
      // 2. Les sélections partagées de l'organisation
      const q = query(
        collection(db, this.collectionName),
        where('entrepriseId', '==', entrepriseId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const selections = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Inclure si c'est la sélection de l'utilisateur OU si elle est partagée
        if (data.userId === userId || data.shared === true) {
          selections.push({
            id: doc.id,
            ...data,
            isOwner: data.userId === userId
          });
        }
      });

      console.log(`✅ [SelectionsService] ${selections.length} sélections récupérées`);

      return {
        success: true,
        data: selections
      };
    } catch (error) {
      console.error('❌ [SelectionsService] Erreur récupération sélections:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Récupérer une sélection par son ID
   * @param {string} selectionId - ID de la sélection
   * @returns {Promise<Object>} - Données de la sélection
   */
  async getSelection(selectionId) {
    try {
      if (!selectionId) {
        throw new Error('selectionId est requis');
      }

      const docRef = doc(db, this.collectionName, selectionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Sélection non trouvée');
      }

      return {
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } catch (error) {
      console.error('❌ [SelectionsService] Erreur récupération sélection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mettre à jour une sélection
   * @param {string} selectionId - ID de la sélection
   * @param {Object} updates - Mises à jour
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  async updateSelection(selectionId, updates) {
    try {
      if (!selectionId) {
        throw new Error('selectionId est requis');
      }

      const docRef = doc(db, this.collectionName, selectionId);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [SelectionsService] Sélection mise à jour:', selectionId);

      return {
        success: true,
        id: selectionId
      };
    } catch (error) {
      console.error('❌ [SelectionsService] Erreur mise à jour sélection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Supprimer une sélection
   * @param {string} selectionId - ID de la sélection
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  async deleteSelection(selectionId) {
    try {
      if (!selectionId) {
        throw new Error('selectionId est requis');
      }

      await deleteDoc(doc(db, this.collectionName, selectionId));

      console.log('✅ [SelectionsService] Sélection supprimée:', selectionId);

      return {
        success: true
      };
    } catch (error) {
      console.error('❌ [SelectionsService] Erreur suppression sélection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les sélections par type
   * @param {string} type - Type de recherche (contacts, dates, etc.)
   * @param {string} userId - ID de l'utilisateur
   * @param {string} entrepriseId - ID de l'organisation
   * @returns {Promise<Object>} - Liste des sélections du type
   */
  async getSelectionsByType(type, userId, entrepriseId) {
    try {
      const result = await this.getUserSelections(userId, entrepriseId);
      
      if (!result.success) {
        return result;
      }

      const filteredSelections = result.data.filter(s => s.type === type);

      return {
        success: true,
        data: filteredSelections
      };
    } catch (error) {
      console.error('❌ [SelectionsService] Erreur récupération par type:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}

// Exporter une instance unique du service
export const selectionsService = new SelectionsService();