import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase-service';

/**
 * Service pour gérer les fonctions (qualifications des personnes)
 */
class FonctionsService {
  constructor() {
    this.collectionName = 'fonctions';
  }

  /**
   * Récupère toutes les fonctions d'une entreprise
   */
  async getAllFonctions(entrepriseId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('entrepriseId', '==', entrepriseId)
      );
      
      const snapshot = await getDocs(q);
      const fonctions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Tri côté client temporaire pendant que l'index se construit
      return fonctions.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
    } catch (error) {
      console.error('Erreur lors de la récupération des fonctions:', error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les fonctions actives
   */
  async getActiveFonctions(entrepriseId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('entrepriseId', '==', entrepriseId),
        where('actif', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const fonctions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Tri côté client temporaire pendant que l'index se construit
      return fonctions.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
    } catch (error) {
      console.error('Erreur lors de la récupération des fonctions actives:', error);
      throw error;
    }
  }

  /**
   * Récupère une fonction par son ID
   */
  async getFonctionById(fonctionId) {
    try {
      const docRef = doc(db, this.collectionName, fonctionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la fonction:', error);
      throw error;
    }
  }

  /**
   * Crée une nouvelle fonction
   */
  async createFonction(fonctionData) {
    try {
      const newFonction = {
        ...fonctionData,
        utilisations: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), newFonction);
      return { id: docRef.id, ...newFonction };
    } catch (error) {
      console.error('Erreur lors de la création de la fonction:', error);
      throw error;
    }
  }

  /**
   * Met à jour une fonction existante
   */
  async updateFonction(fonctionId, updateData) {
    try {
      const docRef = doc(db, this.collectionName, fonctionId);
      const updatedData = {
        ...updateData,
        updatedAt: new Date()
      };
      
      await updateDoc(docRef, updatedData);
      return { id: fonctionId, ...updatedData };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la fonction:', error);
      throw error;
    }
  }

  /**
   * Supprime une fonction (seulement si non utilisée)
   */
  async deleteFonction(fonctionId) {
    try {
      const fonction = await this.getFonctionById(fonctionId);
      
      if (fonction && fonction.utilisations > 0) {
        throw new Error('Cette fonction ne peut pas être supprimée car elle est utilisée');
      }
      
      await deleteDoc(doc(db, this.collectionName, fonctionId));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la fonction:', error);
      throw error;
    }
  }

  /**
   * Active ou désactive une fonction
   */
  async toggleFonctionStatus(fonctionId, actif) {
    try {
      return await this.updateFonction(fonctionId, { actif });
    } catch (error) {
      console.error('Erreur lors du changement de statut de la fonction:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un code existe déjà pour une entreprise
   */
  async checkCodeExists(entrepriseId, code, excludeId = null) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('entrepriseId', '==', entrepriseId),
        where('code', '==', code.toUpperCase())
      );
      
      const snapshot = await getDocs(q);
      const exists = snapshot.docs.some(doc => doc.id !== excludeId);
      
      return exists;
    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      throw error;
    }
  }

  /**
   * Incrémente le compteur d'utilisation d'une fonction
   */
  async incrementUsage(fonctionId) {
    try {
      const fonction = await this.getFonctionById(fonctionId);
      if (fonction) {
        await this.updateFonction(fonctionId, {
          utilisations: (fonction.utilisations || 0) + 1
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des utilisations:', error);
      // Ne pas propager l'erreur pour ne pas bloquer l'opération principale
    }
  }

  /**
   * Décrémente le compteur d'utilisation d'une fonction
   */
  async decrementUsage(fonctionId) {
    try {
      const fonction = await this.getFonctionById(fonctionId);
      if (fonction && fonction.utilisations > 0) {
        await this.updateFonction(fonctionId, {
          utilisations: fonction.utilisations - 1
        });
      }
    } catch (error) {
      console.error('Erreur lors de la décrémentation des utilisations:', error);
      // Ne pas propager l'erreur pour ne pas bloquer l'opération principale
    }
  }

  /**
   * Initialise les fonctions par défaut pour une nouvelle entreprise
   */
  async initializeDefaultFonctions(entrepriseId) {
    const defaultFonctions = [
      { nom: 'Directeur', code: 'DIR', actif: true },
      { nom: 'Manager', code: 'MGR', actif: true },
      { nom: 'Responsable communication', code: 'COM', actif: true },
      { nom: 'Chargé de production', code: 'PROD', actif: true },
      { nom: 'Assistant', code: 'ASS', actif: true },
      { nom: 'Programmateur', code: 'PROG', actif: true },
      { nom: 'Régisseur', code: 'REG', actif: true },
      { nom: 'Technicien', code: 'TECH', actif: true },
      { nom: 'Comptable', code: 'COMP', actif: true },
      { nom: 'Attaché de presse', code: 'PRESS', actif: true }
    ];

    try {
      const promises = defaultFonctions.map(fonction => 
        this.createFonction({ ...fonction, entrepriseId })
      );
      
      await Promise.all(promises);
      console.log('Fonctions par défaut initialisées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des fonctions par défaut:', error);
      throw error;
    }
  }
}

export const fonctionsService = new FonctionsService();