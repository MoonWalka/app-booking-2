import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { validatePersonne } from '@/schemas/ContactRefactoredSchemas';

const COLLECTION_NAME = 'personnes';

/**
 * Service pour gérer la collection "personnes"
 * Gère les contacts individuels
 */
class PersonnesService {
  /**
   * Créer une nouvelle personne
   * Vérifie l'unicité par entrepriseId + email
   */
  async createPersonne(data, entrepriseId, userId) {
    try {
      // Validation des données
      const validation = await validatePersonne({ ...data, entrepriseId });
      if (!validation.valid) {
        throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
      }

      // Vérifier l'unicité par email seulement si un email est fourni
      if (validation.data.email) {
        const existingQuery = query(
          collection(db, COLLECTION_NAME),
          where('entrepriseId', '==', entrepriseId),
          where('email', '==', validation.data.email)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
          throw new Error(`Une personne avec cet email existe déjà`);
        }
      }

      // Créer la personne - Nettoyer les undefined pour Firestore
      const cleanedData = Object.entries(validation.data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const personneData = {
        ...cleanedData,
        entrepriseId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), personneData);
      console.log('[PersonnesService] Personne créée:', docRef.id);

      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...personneData }
      };
    } catch (error) {
      console.error('[PersonnesService] Erreur création personne:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mettre à jour une personne existante
   */
  async updatePersonne(personneId, updates, userId) {
    try {
      // Récupérer la personne actuelle
      const docRef = doc(db, COLLECTION_NAME, personneId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Personne non trouvée');
      }

      const currentData = docSnap.data();
      const updatedData = { ...currentData, ...updates };

      // Pour la validation, exclure createdAt et updatedAt qui sont gérés par Firebase
      const dataToValidate = { ...updatedData };
      delete dataToValidate.createdAt;
      delete dataToValidate.updatedAt;
      delete dataToValidate.createdBy;
      delete dataToValidate.updatedBy;

      // Validation
      const validation = await validatePersonne(dataToValidate);
      if (!validation.valid) {
        throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
      }

      // Vérifier l'unicité si l'email change
      if (updates.email && updates.email !== currentData.email) {
        const existingQuery = query(
          collection(db, COLLECTION_NAME),
          where('entrepriseId', '==', currentData.entrepriseId),
          where('email', '==', updates.email)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
          throw new Error(`Une personne avec cet email existe déjà`);
        }
      }

      // Nettoyer les undefined pour Firestore
      const cleanedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      // Mettre à jour
      await updateDoc(docRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });

      console.log('[PersonnesService] Personne mise à jour:', personneId);
      return {
        success: true,
        id: personneId
      };
    } catch (error) {
      console.error('[PersonnesService] Erreur mise à jour personne:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer une personne par ID
   */
  async getPersonne(personneId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, personneId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Personne non trouvée');
      }

      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() }
      };
    } catch (error) {
      console.error('[PersonnesService] Erreur récupération personne:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer plusieurs personnes par leurs IDs
   */
  async getPersonnesByIds(personneIds) {
    try {
      if (!personneIds || personneIds.length === 0) {
        return { success: true, data: [] };
      }

      // Firestore limite à 30 éléments dans un 'in'
      const chunks = [];
      for (let i = 0; i < personneIds.length; i += 30) {
        chunks.push(personneIds.slice(i, i + 30));
      }

      const allPersonnes = [];
      for (const chunk of chunks) {
        const q = query(
          collection(db, COLLECTION_NAME),
          where('__name__', 'in', chunk)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => {
          allPersonnes.push({ id: doc.id, ...doc.data() });
        });
      }

      return {
        success: true,
        data: allPersonnes
      };
    } catch (error) {
      console.error('[PersonnesService] Erreur récupération personnes par IDs:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Lister les personnes d'une organisation
   */
  async listPersonnes(entrepriseId, filters = {}) {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('entrepriseId', '==', entrepriseId)
      );

      // Appliquer les filtres

      if (filters.tags && filters.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filters.tags));
      }

      // Retirer le tri Firestore qui peut causer des problèmes d'index
      // Le tri sera fait côté client dans le composant

      const snapshot = await getDocs(q);
      const personnes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`[PersonnesService] ${personnes.length} personnes trouvées pour l'organisation ${entrepriseId}`);
      return {
        success: true,
        data: personnes
      };
    } catch (error) {
      console.error('[PersonnesService] Erreur liste personnes:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Rechercher des personnes
   */
  async searchPersonnes(entrepriseId, searchTerm) {
    try {
      // Firestore ne supporte pas la recherche textuelle native
      // On récupère toutes les personnes et on filtre côté client
      const allPersonnes = await this.listPersonnes(entrepriseId);
      
      if (!allPersonnes.success) {
        return allPersonnes;
      }

      const searchLower = searchTerm.toLowerCase();
      const filtered = allPersonnes.data.filter(personne => {
        const nomComplet = `${personne.prenom} ${personne.nom}`.toLowerCase();
        return (
          nomComplet.includes(searchLower) ||
          personne.email?.toLowerCase().includes(searchLower) ||
          personne.fonction?.toLowerCase().includes(searchLower) ||
          personne.ville?.toLowerCase().includes(searchLower) ||
          personne.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });

      return {
        success: true,
        data: filtered
      };
    } catch (error) {
      console.error('[PersonnesService] Erreur recherche personnes:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Supprimer une personne
   */
  async deletePersonne(personneId) {
    try {
      // Vérifier s'il y a des liaisons actives
      const liaisonsQuery = query(
        collection(db, 'liaisons'),
        where('personneId', '==', personneId),
        where('actif', '==', true)
      );
      const liaisonsSnapshot = await getDocs(liaisonsQuery);
      
      if (!liaisonsSnapshot.empty) {
        throw new Error(`Cette personne est associée à ${liaisonsSnapshot.size} structures actives`);
      }

      // Supprimer la personne
      await deleteDoc(doc(db, COLLECTION_NAME, personneId));
      
      console.log('[PersonnesService] Personne supprimée:', personneId);
      return {
        success: true,
        id: personneId
      };
    } catch (error) {
      console.error('[PersonnesService] Erreur suppression personne:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Créer ou mettre à jour une personne (upsert)
   * Utilisé pour l'import et la migration
   */
  async upsertPersonne(data, entrepriseId, userId) {
    try {
      // Chercher une personne existante par email
      const existingQuery = query(
        collection(db, COLLECTION_NAME),
        where('entrepriseId', '==', entrepriseId),
        where('email', '==', data.email)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        // Mise à jour
        const existingDoc = existingSnapshot.docs[0];
        const result = await this.updatePersonne(existingDoc.id, data, userId);
        return { ...result, id: existingDoc.id, isNew: false };
      } else {
        // Création
        const result = await this.createPersonne(data, entrepriseId, userId);
        return { ...result, isNew: true };
      }
    } catch (error) {
      console.error('[PersonnesService] Erreur upsert personne:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Chercher une personne par nom et prénom
   * Utilisé pour la détection de doublons
   */
  async findPersonneByName(entrepriseId, prenom, nom) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('entrepriseId', '==', entrepriseId),
        where('prenom', '==', prenom),
        where('nom', '==', nom)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return { success: true, data: null };
      }

      return {
        success: true,
        data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    } catch (error) {
      console.error('[PersonnesService] Erreur recherche par nom:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }


  /**
   * Import en masse de personnes
   */
  async bulkImportPersonnes(personnes, entrepriseId, userId) {
    const results = {
      success: 0,
      errors: [],
      created: [],
      updated: []
    };

    // Traiter par batch de 100
    const batchSize = 100;
    for (let i = 0; i < personnes.length; i += batchSize) {
      const batch = personnes.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (personne, index) => {
        try {
          const result = await this.upsertPersonne(personne, entrepriseId, userId);
          if (result.success) {
            results.success++;
            if (result.isNew) {
              results.created.push(result.id);
            } else {
              results.updated.push(result.id);
            }
          } else {
            results.errors.push({
              line: i + index + 1,
              error: result.error,
              data: personne
            });
          }
        } catch (error) {
          results.errors.push({
            line: i + index + 1,
            error: error.message,
            data: personne
          });
        }
      }));
    }

    console.log('[PersonnesService] Import terminé:', results);
    return results;
  }

  /**
   * Fusionner deux personnes
   * Conserve la personne principale et archive l'autre
   */
  async mergePersonnes(principalId, toMergeId, userId) {
    try {
      // Récupérer les deux personnes
      const principal = await this.getPersonne(principalId);
      const toMerge = await this.getPersonne(toMergeId);

      if (!principal.success || !toMerge.success) {
        throw new Error('Une des personnes n\'existe pas');
      }

      // Transférer toutes les liaisons
      const liaisonsQuery = query(
        collection(db, 'liaisons'),
        where('personneId', '==', toMergeId)
      );
      const liaisonsSnapshot = await getDocs(liaisonsQuery);

      const batch = writeBatch(db);
      liaisonsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { 
          personneId: principalId,
          updatedAt: serverTimestamp(),
          updatedBy: userId,
          notes: `Fusionné depuis ${toMergeId}`
        });
      });

      // Archiver la personne fusionnée
      const archiveData = {
        ...toMerge.data,
        archivedAt: serverTimestamp(),
        archivedBy: userId,
        mergedInto: principalId
      };
      const archiveRef = doc(collection(db, 'personnes_archives'));
      batch.set(archiveRef, archiveData);

      // Supprimer l'ancienne personne
      batch.delete(doc(db, COLLECTION_NAME, toMergeId));

      // Exécuter le batch
      await batch.commit();

      console.log('[PersonnesService] Personnes fusionnées:', principalId, '<-', toMergeId);
      return {
        success: true,
        principalId,
        mergedId: toMergeId,
        liaisonsMoved: liaisonsSnapshot.size
      };
    } catch (error) {
      console.error('[PersonnesService] Erreur fusion personnes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

const personnesServiceInstance = new PersonnesService();
export default personnesServiceInstance;
export const personnesService = personnesServiceInstance;