import { collection, query, where, getDocs, doc, getDoc, updateDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

const collaborateurService = {
  async getCollaborateursByOrganization(entrepriseId) {
    try {
      console.log('[CollaborateurService] Recherche collaborateurs pour entreprise:', entrepriseId);
      
      // Approche 1: Chercher dans la collection users
      const collaborateursRef = collection(db, 'users');
      const q = query(
        collaborateursRef, 
        where('entrepriseId', '==', entrepriseId)
      );
      const snapshot = await getDocs(q);
      console.log('[CollaborateurService] Nombre de documents trouvés dans users:', snapshot.size);
      
      let collaborateurs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Approche 2: Si aucun résultat, chercher dans collaborationConfig
      if (collaborateurs.length === 0) {
        console.log('[CollaborateurService] Aucun collaborateur dans users, recherche dans collaborationConfig');
        const configDoc = await getDoc(doc(db, 'collaborationConfig', entrepriseId));
        
        if (configDoc.exists()) {
          const data = configDoc.data();
          if (data.collaborateurs && Array.isArray(data.collaborateurs)) {
            console.log('[CollaborateurService] Collaborateurs trouvés dans collaborationConfig:', data.collaborateurs.length);
            // Transformer le format pour être compatible avec le reste de l'app
            collaborateurs = data.collaborateurs.map(collab => ({
              id: collab.id,
              uid: collab.id,
              email: collab.email,
              displayName: collab.prenom && collab.nom ? 
                `${collab.prenom} ${collab.nom}`.trim() : 
                collab.email || 'Sans nom',
              firstName: collab.prenom || '',
              lastName: collab.nom || '',
              entrepriseId: entrepriseId,
              ...collab
            }));
          }
        }
      }
      
      console.log('[CollaborateurService] Total collaborateurs récupérés:', collaborateurs.length, collaborateurs);
      
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