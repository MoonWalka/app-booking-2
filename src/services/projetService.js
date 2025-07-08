import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

const projetService = {
  async getProjetsByOrganization(entrepriseId) {
    try {
      const projetsRef = collection(db, 'projets');
      const q = query(
        projetsRef, 
        where('entrepriseId', '==', entrepriseId),
        orderBy('intitule', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return [];
    }
  },

  async getProjetById(projetId) {
    try {
      const projetDoc = await getDoc(doc(db, 'projets', projetId));
      if (projetDoc.exists()) {
        return {
          id: projetDoc.id,
          ...projetDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du projet:', error);
      return null;
    }
  },

  async createProjet(projetData) {
    try {
      const docRef = await addDoc(collection(db, 'projets'), {
        ...projetData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      throw error;
    }
  },

  async updateProjet(projetId, projetData) {
    try {
      await updateDoc(doc(db, 'projets', projetId), {
        ...projetData,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      throw error;
    }
  },

  async deleteProjet(projetId) {
    try {
      await deleteDoc(doc(db, 'projets', projetId));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      throw error;
    }
  }
};

export default projetService;