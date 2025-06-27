import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, orderBy, addDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

const devisService = {
  // Créer un nouveau devis
  async createDevis(devisData) {
    try {
      // Générer un numéro de devis unique
      const year = new Date().getFullYear();
      const count = await this.getDevisCountForYear(devisData.organizationId, year);
      const numero = `DEV-${year}-${String(count + 1).padStart(4, '0')}`;
      
      const newDevis = {
        ...devisData,
        numero,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'devis'), newDevis);
      return {
        id: docRef.id,
        ...newDevis
      };
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      throw error;
    }
  },

  // Mettre à jour un devis existant
  async updateDevis(devisId, devisData) {
    try {
      const devisRef = doc(db, 'devis', devisId);
      await updateDoc(devisRef, {
        ...devisData,
        updatedAt: new Date()
      });
      return {
        id: devisId,
        ...devisData,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
      throw error;
    }
  },

  // Récupérer un devis par ID
  async getDevisById(devisId) {
    try {
      const devisDoc = await getDoc(doc(db, 'devis', devisId));
      if (devisDoc.exists()) {
        const data = devisDoc.data();
        
        // Convertir les timestamps Firebase en dates ISO
        if (data.createdAt && data.createdAt.toDate) {
          data.createdAt = data.createdAt.toDate();
        }
        if (data.updatedAt && data.updatedAt.toDate) {
          data.updatedAt = data.updatedAt.toDate();
        }
        
        return {
          id: devisDoc.id,
          ...data
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du devis:', error);
      throw error;
    }
  },

  // Récupérer tous les devis d'une organisation
  async getDevisByOrganization(organizationId) {
    try {
      const devisRef = collection(db, 'devis');
      const q = query(
        devisRef,
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      return [];
    }
  },

  // Récupérer les devis d'un concert
  async getDevisByConcert(concertId) {
    try {
      const devisRef = collection(db, 'devis');
      const q = query(
        devisRef,
        where('concertId', '==', concertId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des devis du concert:', error);
      return [];
    }
  },

  // Compter les devis pour une année donnée (pour la numérotation)
  async getDevisCountForYear(organizationId, year) {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      
      const devisRef = collection(db, 'devis');
      const q = query(
        devisRef,
        where('organizationId', '==', organizationId),
        where('createdAt', '>=', startDate),
        where('createdAt', '<', endDate)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Erreur lors du comptage des devis:', error);
      return 0;
    }
  },

  // Dupliquer un devis
  async duplicateDevis(devisId) {
    try {
      const originalDevis = await this.getDevisById(devisId);
      if (!originalDevis) {
        throw new Error('Devis non trouvé');
      }

      // Retirer l'ID et mettre à jour les dates
      const { id, numero, createdAt, updatedAt, ...devisData } = originalDevis;
      
      return await this.createDevis({
        ...devisData,
        statut: 'brouillon', // Toujours créer comme brouillon
        lignesReglement: [] // Réinitialiser les règlements
      });
    } catch (error) {
      console.error('Erreur lors de la duplication du devis:', error);
      throw error;
    }
  }
};

export default devisService;