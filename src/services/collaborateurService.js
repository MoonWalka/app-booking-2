import { collection, query, where, getDocs, doc, getDoc, updateDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

const collaborateurService = {
  async getCollaborateursByOrganization(organizationId) {
    try {
      const collaborateursRef = collection(db, 'users');
      const q = query(
        collaborateursRef, 
        where('organizationId', '==', organizationId)
      );
      const snapshot = await getDocs(q);
      const collaborateurs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Trier les résultats en JavaScript pour éviter le besoin d'index
      return collaborateurs.sort((a, b) => {
        const nameA = (a.displayName || a.email || '').toLowerCase();
        const nameB = (b.displayName || b.email || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des collaborateurs:', error);
      return [];
    }
  },

  async getCollaborateurById(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du collaborateur:', error);
      return null;
    }
  },

  async updateCollaborateur(userId, userData) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du collaborateur:', error);
      throw error;
    }
  }
};

export default collaborateurService;