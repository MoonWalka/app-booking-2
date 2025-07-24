import { collection, doc, getDoc, updateDoc, query, where, getDocs, orderBy, addDoc, deleteDoc, serverTimestamp } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import tachesService from '@/services/tachesService';
import dateNiveauService from '@/services/dateNiveauService';

const devisService = {
  // Créer un nouveau devis
  async createDevis(devisData) {
    try {
      console.log('=== CRÉATION DEVIS - DÉBUT ===');
      console.log('Données reçues:', devisData);
      
      // Générer un numéro de devis unique
      const year = new Date().getFullYear();
      const count = await this.getDevisCountForYear(devisData.entrepriseId, year);
      const numero = `DEV-${year}-${String(count + 1).padStart(4, '0')}`;
      
      const newDevis = {
        ...devisData,
        numero,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Données à sauvegarder dans Firebase:', newDevis);
      
      const docRef = await addDoc(collection(db, 'devis'), newDevis);
      console.log('✅ Devis créé avec succès - ID:', docRef.id);
      
      // Mettre à jour la date pour indiquer qu'elle a un devis
      if (devisData.dateId) {
        try {
          const dateRef = doc(db, 'dates', devisData.dateId);
          await updateDoc(dateRef, {
            hasDevis: true,
            devisId: docRef.id,
            devisNumero: numero,
            devisStatut: devisData.statut || 'brouillon',
            updatedAt: serverTimestamp()
          });
          console.log('✅ Date mise à jour avec les infos du devis');
        } catch (error) {
          console.error('⚠️ Erreur lors de la mise à jour de la date:', error);
        }
      }
      
      // Créer automatiquement une tâche pour le pré-contrat
      try {
        await tachesService.creerTache({
          titre: `Créer le pré-contrat pour ${devisData.nomContact || 'le client'}`,
          description: `Un devis (${numero}) a été créé. Il faut maintenant créer le pré-contrat.`,
          type: 'pre_contrat',
          priorite: 'normale',
          dateEcheance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
          entrepriseId: devisData.entrepriseId,
          dateId: devisData.dateId,
          contactId: devisData.contactId,
          entityType: 'devis',
          entityId: docRef.id,
          automatique: true,
          createdBy: devisData.createdBy || null
        });
        console.log('✅ Tâche automatique créée pour le pré-contrat');
      } catch (error) {
        console.error('⚠️ Erreur lors de la création de la tâche automatique:', error);
        // Ne pas bloquer la création du devis si la tâche échoue
      }

      // Mettre à jour le niveau de la date (interet -> option)
      if (devisData.dateId) {
        try {
          await dateNiveauService.onDevisCreated(devisData.dateId);
          console.log('✅ Niveau de la date mis à jour automatiquement');
        } catch (error) {
          console.error('⚠️ Erreur lors de la mise à jour du niveau:', error);
          // Ne pas bloquer la création du devis si la mise à jour du niveau échoue
        }
      }
      
      console.log('=== CRÉATION DEVIS - FIN ===');
      
      return {
        id: docRef.id,
        ...newDevis
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création du devis:', error);
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
      
      // Mettre à jour la date si le statut du devis a changé
      if (devisData.dateId && devisData.statut) {
        try {
          const dateRef = doc(db, 'dates', devisData.dateId);
          await updateDoc(dateRef, {
            devisStatut: devisData.statut,
            updatedAt: serverTimestamp()
          });
          console.log('✅ Statut du devis mis à jour dans la date');
        } catch (error) {
          console.error('⚠️ Erreur lors de la mise à jour du statut dans la date:', error);
        }
      }
      
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
      console.log('=== RÉCUPÉRATION DEVIS - DÉBUT ===');
      console.log('ID recherché:', devisId);
      
      const devisDoc = await getDoc(doc(db, 'devis', devisId));
      if (devisDoc.exists()) {
        const data = devisDoc.data();
        console.log('✅ Devis trouvé:', data);
        
        // Convertir les timestamps Firebase en dates ISO
        if (data.createdAt && data.createdAt.toDate) {
          data.createdAt = data.createdAt.toDate();
        }
        if (data.updatedAt && data.updatedAt.toDate) {
          data.updatedAt = data.updatedAt.toDate();
        }
        
        console.log('=== RÉCUPÉRATION DEVIS - FIN ===');
        return {
          id: devisDoc.id,
          ...data
        };
      }
      console.log('❌ Devis non trouvé avec ID:', devisId);
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du devis:', error);
      throw error;
    }
  },

  // Récupérer tous les devis d'une organisation
  async getDevisByOrganization(entrepriseId) {
    try {
      const devisRef = collection(db, 'devis');
      const q = query(
        devisRef,
        where('entrepriseId', '==', entrepriseId),
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

  // Récupérer les devis d'une date
  async getDevisByDate(dateId) {
    try {
      const devisRef = collection(db, 'devis');
      // Requête simplifiée pour éviter l'index composite
      const q = query(
        devisRef,
        where('dateId', '==', dateId)
      );
      const snapshot = await getDocs(q);
      
      // Trier localement par date de création
      const devisList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      devisList.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // Tri décroissant (plus récent en premier)
      });
      
      return devisList;
    } catch (error) {
      console.error('Erreur lors de la récupération des devis de la date:', error);
      return [];
    }
  },

  // Compter les devis pour une année donnée (pour la numérotation)
  async getDevisCountForYear(entrepriseId, year) {
    try {
      // Requête simplifiée pour éviter l'index composite
      const devisRef = collection(db, 'devis');
      const q = query(
        devisRef,
        where('entrepriseId', '==', entrepriseId)
      );
      const snapshot = await getDocs(q);
      
      // Filtrer localement par année
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      
      let count = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || 0);
        
        if (createdAt >= startDate && createdAt < endDate) {
          count++;
        }
      });
      
      return count;
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
  },

  // Supprimer un devis
  async deleteDevis(devisId) {
    try {
      console.log('=== SUPPRESSION DEVIS - DÉBUT ===');
      console.log('ID à supprimer:', devisId);
      
      // Vérifier que le devis existe
      const devisDoc = await getDoc(doc(db, 'devis', devisId));
      if (!devisDoc.exists()) {
        console.log('❌ Devis non trouvé avec ID:', devisId);
        throw new Error('Devis non trouvé');
      }
      
      // Supprimer le devis
      await deleteDoc(doc(db, 'devis', devisId));
      
      console.log('✅ Devis supprimé avec succès - ID:', devisId);
      console.log('=== SUPPRESSION DEVIS - FIN ===');
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du devis:', error);
      throw error;
    }
  }
};

export default devisService;