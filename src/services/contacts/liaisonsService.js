import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { validateLiaison } from '@/schemas/ContactRefactoredSchemas';

const COLLECTION_NAME = 'liaisons';

/**
 * Service pour gérer la collection "liaisons"
 * Gère les relations N-à-N entre structures et personnes
 */
class LiaisonsService {
  /**
   * Créer une nouvelle liaison structure-personne
   */
  async createLiaison(data, userId) {
    try {
      // Validation des données
      const validation = await validateLiaison(data);
      if (!validation.valid) {
        throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
      }

      // Vérifier l'unicité de la liaison
      const existingQuery = query(
        collection(db, COLLECTION_NAME),
        where('organizationId', '==', validation.data.organizationId),
        where('structureId', '==', validation.data.structureId),
        where('personneId', '==', validation.data.personneId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        // Si une liaison existe déjà, on peut la réactiver si elle était inactive
        const existingLiaison = existingSnapshot.docs[0];
        const existingData = existingLiaison.data();
        
        if (!existingData.actif) {
          return this.updateLiaison(existingLiaison.id, { 
            ...data, 
            actif: true,
            dateDebut: new Date()
          }, userId);
        }
        
        throw new Error('Cette personne est déjà associée à cette structure');
      }

      // Créer la liaison
      const liaisonData = {
        ...validation.data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), liaisonData);
      console.log('[LiaisonsService] Liaison créée:', docRef.id);
      
      // Mettre à jour le statut isPersonneLibre de la personne
      try {
        const personneRef = doc(db, 'personnes', validation.data.personneId);
        await updateDoc(personneRef, {
          isPersonneLibre: false,
          updatedAt: serverTimestamp(),
          updatedBy: userId
        });
        console.log('[LiaisonsService] Statut isPersonneLibre mis à jour pour la personne:', validation.data.personneId);
      } catch (error) {
        console.error('[LiaisonsService] Erreur mise à jour isPersonneLibre:', error);
        // On ne fait pas échouer la création de la liaison pour ça
      }

      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...liaisonData }
      };
    } catch (error) {
      console.error('[LiaisonsService] Erreur création liaison:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mettre à jour une liaison existante
   */
  async updateLiaison(liaisonId, updates, userId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, liaisonId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Liaison non trouvée');
      }

      const currentData = docSnap.data();
      const updatedData = { ...currentData, ...updates };

      // Validation
      const validation = await validateLiaison(updatedData);
      if (!validation.valid) {
        throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
      }

      // Vérifier qu'une seule personne est prioritaire par structure
      if (updates.prioritaire === true) {
        const prioritairesQuery = query(
          collection(db, COLLECTION_NAME),
          where('organizationId', '==', currentData.organizationId),
          where('structureId', '==', currentData.structureId),
          where('prioritaire', '==', true)
        );
        const prioritairesSnapshot = await getDocs(prioritairesQuery);
        
        // Désactiver les autres contacts prioritaires
        const batch = writeBatch(db);
        prioritairesSnapshot.docs.forEach(doc => {
          if (doc.id !== liaisonId) {
            batch.update(doc.ref, { 
              prioritaire: false,
              updatedAt: serverTimestamp(),
              updatedBy: userId
            });
          }
        });
        await batch.commit();
      }

      // Mettre à jour
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });

      console.log('[LiaisonsService] Liaison mise à jour:', liaisonId);
      return {
        success: true,
        id: liaisonId
      };
    } catch (error) {
      console.error('[LiaisonsService] Erreur mise à jour liaison:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer toutes les liaisons d'une structure
   */
  async getLiaisonsByStructure(structureId, includeInactive = false) {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('structureId', '==', structureId)
      );

      if (!includeInactive) {
        q = query(q, where('actif', '==', true));
      }

      q = query(q, orderBy('prioritaire', 'desc'), orderBy('fonction', 'asc'));

      const snapshot = await getDocs(q);
      const liaisons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: liaisons
      };
    } catch (error) {
      console.error('[LiaisonsService] Erreur récupération liaisons structure:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Récupérer toutes les liaisons d'une personne
   */
  async getLiaisonsByPersonne(personneId, includeInactive = false) {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('personneId', '==', personneId)
      );

      if (!includeInactive) {
        q = query(q, where('actif', '==', true));
      }

      q = query(q, orderBy('dateDebut', 'desc'));

      const snapshot = await getDocs(q);
      const liaisons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: liaisons
      };
    } catch (error) {
      console.error('[LiaisonsService] Erreur récupération liaisons personne:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Dissocier une personne d'une structure (soft delete)
   */
  async dissociate(liaisonId, userId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, liaisonId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Liaison non trouvée');
      }

      const liaisonData = docSnap.data();
      
      // Soft delete : on marque comme inactif
      await updateDoc(docRef, {
        actif: false,
        dateFin: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });

      console.log('[LiaisonsService] Liaison désactivée:', liaisonId);
      
      // Vérifier si la personne n'a plus aucune liaison active
      try {
        const activeLiaisonsQuery = query(
          collection(db, COLLECTION_NAME),
          where('personneId', '==', liaisonData.personneId),
          where('actif', '==', true)
        );
        const activeLiaisonsSnapshot = await getDocs(activeLiaisonsQuery);
        
        // Si plus aucune liaison active, marquer la personne comme libre
        if (activeLiaisonsSnapshot.empty) {
          const personneRef = doc(db, 'personnes', liaisonData.personneId);
          await updateDoc(personneRef, {
            isPersonneLibre: true,
            updatedAt: serverTimestamp(),
            updatedBy: userId
          });
          console.log('[LiaisonsService] Personne marquée comme libre:', liaisonData.personneId);
        }
      } catch (error) {
        console.error('[LiaisonsService] Erreur vérification personne libre:', error);
        // On ne fait pas échouer la dissociation pour ça
      }
      
      return {
        success: true,
        id: liaisonId
      };
    } catch (error) {
      console.error('[LiaisonsService] Erreur dissociation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Réactiver une liaison
   */
  async reactivate(liaisonId, userId) {
    try {
      // Récupérer les données de la liaison pour avoir le personneId
      const docRef = doc(db, COLLECTION_NAME, liaisonId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Liaison non trouvée');
      }
      
      const liaisonData = docSnap.data();
      
      // Réactiver la liaison
      const result = await this.updateLiaison(liaisonId, {
        actif: true,
        dateFin: null,
        dateDebut: new Date()
      }, userId);
      
      // Marquer la personne comme non libre
      if (result.success) {
        try {
          const personneRef = doc(db, 'personnes', liaisonData.personneId);
          await updateDoc(personneRef, {
            isPersonneLibre: false,
            updatedAt: serverTimestamp(),
            updatedBy: userId
          });
          console.log('[LiaisonsService] Personne marquée comme non libre après réactivation:', liaisonData.personneId);
        } catch (error) {
          console.error('[LiaisonsService] Erreur mise à jour isPersonneLibre:', error);
        }
      }
      
      return result;
    } catch (error) {
      console.error('[LiaisonsService] Erreur réactivation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Définir le contact prioritaire d'une structure
   */
  async setPrioritaire(structureId, personneId, userId) {
    try {
      // Trouver la liaison
      const liaisonQuery = query(
        collection(db, COLLECTION_NAME),
        where('structureId', '==', structureId),
        where('personneId', '==', personneId),
        where('actif', '==', true)
      );
      const liaisonSnapshot = await getDocs(liaisonQuery);
      
      if (liaisonSnapshot.empty) {
        throw new Error('Liaison active non trouvée');
      }

      const liaisonId = liaisonSnapshot.docs[0].id;
      return this.updateLiaison(liaisonId, { prioritaire: true }, userId);
    } catch (error) {
      console.error('[LiaisonsService] Erreur set prioritaire:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les contacts actifs d'une organisation
   */
  async getActiveContacts(organizationId, filters = {}) {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('organizationId', '==', organizationId),
        where('actif', '==', true)
      );

      // Filtres additionnels
      if (filters.prioritaire !== undefined) {
        q = query(q, where('prioritaire', '==', filters.prioritaire));
      }

      if (filters.interesse !== undefined) {
        q = query(q, where('interesse', '==', filters.interesse));
      }

      if (filters.fonction) {
        q = query(q, where('fonction', '==', filters.fonction));
      }

      const snapshot = await getDocs(q);
      const liaisons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: liaisons
      };
    } catch (error) {
      console.error('[LiaisonsService] Erreur récupération contacts actifs:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Statistiques des liaisons
   */
  async getStatistics(organizationId) {
    try {
      const allLiaisonsQuery = query(
        collection(db, COLLECTION_NAME),
        where('organizationId', '==', organizationId)
      );
      const allLiaisonsSnapshot = await getDocs(allLiaisonsQuery);

      const stats = {
        total: allLiaisonsSnapshot.size,
        actives: 0,
        inactives: 0,
        prioritaires: 0,
        interesses: 0,
        parFonction: {}
      };

      allLiaisonsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        
        if (data.actif) {
          stats.actives++;
          
          if (data.prioritaire) stats.prioritaires++;
          if (data.interesse) stats.interesses++;
          
          if (data.fonction) {
            stats.parFonction[data.fonction] = (stats.parFonction[data.fonction] || 0) + 1;
          }
        } else {
          stats.inactives++;
        }
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('[LiaisonsService] Erreur calcul statistiques:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Import en masse de liaisons
   */
  async bulkCreateLiaisons(liaisons, userId) {
    const results = {
      success: 0,
      errors: [],
      created: []
    };

    // Traiter par batch
    const batchSize = 100;
    for (let i = 0; i < liaisons.length; i += batchSize) {
      const batch = liaisons.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (liaison, index) => {
        try {
          const result = await this.createLiaison(liaison, userId);
          if (result.success) {
            results.success++;
            results.created.push(result.id);
          } else {
            results.errors.push({
              index: i + index,
              error: result.error,
              data: liaison
            });
          }
        } catch (error) {
          results.errors.push({
            index: i + index,
            error: error.message,
            data: liaison
          });
        }
      }));
    }

    console.log('[LiaisonsService] Import terminé:', results);
    return results;
  }
}

const liaisonsServiceInstance = new LiaisonsService();
export default liaisonsServiceInstance;