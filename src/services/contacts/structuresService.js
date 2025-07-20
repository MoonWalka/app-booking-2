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
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { validateStructure } from '@/schemas/ContactRefactoredSchemas';
import { prepareDataForValidation, prepareDataForFirestore } from '@/utils/firebaseDataUtils';

const COLLECTION_NAME = 'structures';

/**
 * Service pour gérer la collection "structures"
 * Gère les organisations (festivals, salles, labels, etc.)
 */
class StructuresService {
  /**
   * Créer une nouvelle structure
   * Vérifie l'unicité par entrepriseId + raisonSociale
   */
  async createStructure(data, entrepriseId, userId) {
    try {
      // Préparer les données pour la validation (convertir les timestamps Firebase)
      const dataForValidation = prepareDataForValidation({ ...data, entrepriseId });
      
      // Validation des données
      const validation = await validateStructure(dataForValidation);
      if (!validation.valid) {
        throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
      }

      // Vérifier l'unicité
      const existingQuery = query(
        collection(db, COLLECTION_NAME),
        where('entrepriseId', '==', entrepriseId),
        where('raisonSociale', '==', validation.data.raisonSociale)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error(`Une structure avec cette raison sociale existe déjà`);
      }

      // Créer la structure - Utiliser l'utilitaire pour nettoyer les données
      const cleanedData = prepareDataForFirestore(validation.data);
      
      const structureData = {
        ...cleanedData,
        entrepriseId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), structureData);
      console.log('[StructuresService] Structure créée:', docRef.id);

      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...structureData }
      };
    } catch (error) {
      console.error('[StructuresService] Erreur création structure:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mettre à jour une structure existante
   */
  async updateStructure(structureId, updates, userId) {
    try {
      // Récupérer la structure actuelle
      const docRef = doc(db, COLLECTION_NAME, structureId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Structure non trouvée');
      }

      const currentData = docSnap.data();
      const updatedData = { ...currentData, ...updates };

      // Préparer les données pour la validation (convertir les timestamps Firebase)
      const dataForValidation = prepareDataForValidation(updatedData);

      // Debug spécifique pour les commentaires
      if (dataForValidation.commentaires && dataForValidation.commentaires.length > 0) {
        console.log('[StructuresService] Debug commentaires avant validation:', {
          commentaires: dataForValidation.commentaires,
          firstCommentDate: dataForValidation.commentaires[0]?.date,
          firstCommentDateType: typeof dataForValidation.commentaires[0]?.date,
          isValidDate: dataForValidation.commentaires[0]?.date instanceof Date
        });
      }

      // Validation
      const validation = await validateStructure(dataForValidation);
      if (!validation.valid) {
        console.error('[StructuresService] Erreur de validation détaillée:', {
          errors: validation.errors,
          dataForValidation: dataForValidation,
          periodeActivite: dataForValidation.periodeActivite,
          commentaires: dataForValidation.commentaires
        });
        throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
      }

      // Vérifier l'unicité si la raison sociale change
      if (updates.raisonSociale && updates.raisonSociale !== currentData.raisonSociale) {
        const existingQuery = query(
          collection(db, COLLECTION_NAME),
          where('entrepriseId', '==', currentData.entrepriseId),
          where('raisonSociale', '==', updates.raisonSociale)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
          throw new Error(`Une structure avec cette raison sociale existe déjà`);
        }
      }

      // Nettoyer les données pour Firestore
      const cleanedUpdates = prepareDataForFirestore(updates);
      
      // Mettre à jour
      await updateDoc(docRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });

      console.log('[StructuresService] Structure mise à jour:', structureId);
      
      // Émettre un événement pour signaler la modification
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('structureModified', { 
          detail: { structureId, updates: cleanedUpdates } 
        }));
      }
      
      return {
        success: true,
        id: structureId
      };
    } catch (error) {
      console.error('[StructuresService] Erreur mise à jour structure:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer une structure par ID
   */
  async getStructure(structureId) {
    try {
      // Protection contre les IDs vides ou invalides
      if (!structureId || structureId.trim() === '') {
        console.warn('[StructuresService] ID de structure vide ou invalide:', structureId);
        return {
          success: false,
          error: 'ID de structure invalide'
        };
      }

      const docRef = doc(db, COLLECTION_NAME, structureId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Structure non trouvée');
      }

      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() }
      };
    } catch (error) {
      console.error('[StructuresService] Erreur récupération structure:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lister les structures d'une organisation
   */
  async listStructures(entrepriseId, filters = {}) {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('entrepriseId', '==', entrepriseId)
      );

      // Appliquer les filtres
      if (filters.isClient !== undefined) {
        q = query(q, where('isClient', '==', filters.isClient));
      }

      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters.tags && filters.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filters.tags));
      }

      // Tri par défaut
      q = query(q, orderBy('raisonSociale', 'asc'));

      const snapshot = await getDocs(q);
      const structures = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`[StructuresService] ${structures.length} structures trouvées`);
      return {
        success: true,
        data: structures
      };
    } catch (error) {
      console.error('[StructuresService] Erreur liste structures:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Rechercher des structures
   */
  async searchStructures(entrepriseId, searchTerm) {
    try {
      // Firestore ne supporte pas la recherche textuelle native
      // On récupère toutes les structures et on filtre côté client
      const allStructures = await this.listStructures(entrepriseId);
      
      if (!allStructures.success) {
        return allStructures;
      }

      const searchLower = searchTerm.toLowerCase();
      const filtered = allStructures.data.filter(structure => {
        return (
          structure.raisonSociale?.toLowerCase().includes(searchLower) ||
          structure.email?.toLowerCase().includes(searchLower) ||
          structure.ville?.toLowerCase().includes(searchLower) ||
          structure.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });

      return {
        success: true,
        data: filtered
      };
    } catch (error) {
      console.error('[StructuresService] Erreur recherche structures:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Supprimer une structure (soft delete recommandé)
   */
  async deleteStructure(structureId) {
    try {
      // Vérifier s'il y a des liaisons actives
      const liaisonsQuery = query(
        collection(db, 'liaisons'),
        where('structureId', '==', structureId),
        where('actif', '==', true)
      );
      const liaisonsSnapshot = await getDocs(liaisonsQuery);
      
      if (!liaisonsSnapshot.empty) {
        throw new Error(`Cette structure a ${liaisonsSnapshot.size} personnes actives associées`);
      }

      // Supprimer la structure
      await deleteDoc(doc(db, COLLECTION_NAME, structureId));
      
      console.log('[StructuresService] Structure supprimée:', structureId);
      return {
        success: true,
        id: structureId
      };
    } catch (error) {
      console.error('[StructuresService] Erreur suppression structure:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Créer ou mettre à jour une structure (upsert)
   * Utilisé pour l'import
   */
  async upsertStructure(data, entrepriseId, userId) {
    try {
      // Chercher une structure existante
      const existingQuery = query(
        collection(db, COLLECTION_NAME),
        where('entrepriseId', '==', entrepriseId),
        where('raisonSociale', '==', data.raisonSociale)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        // Mise à jour
        const existingDoc = existingSnapshot.docs[0];
        const result = await this.updateStructure(existingDoc.id, data, userId);
        return { ...result, id: existingDoc.id, isNew: false };
      } else {
        // Création
        const result = await this.createStructure(data, entrepriseId, userId);
        return { ...result, isNew: true };
      }
    } catch (error) {
      console.error('[StructuresService] Erreur upsert structure:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marquer une structure comme client
   */
  async setClientStatus(structureId, isClient, userId) {
    return this.updateStructure(structureId, { isClient }, userId);
  }

  /**
   * Mettre à jour les tags d'une structure
   */
  async updateTags(structureId, tags, userId) {
    return this.updateStructure(structureId, { tags }, userId);
  }

  /**
   * Import en masse de structures
   */
  async bulkImportStructures(structures, entrepriseId, userId) {
    const results = {
      success: 0,
      errors: [],
      created: [],
      updated: []
    };

    // Traiter par batch de 100
    const batchSize = 100;
    for (let i = 0; i < structures.length; i += batchSize) {
      const batch = structures.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (structure, index) => {
        try {
          const result = await this.upsertStructure(structure, entrepriseId, userId);
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
              data: structure
            });
          }
        } catch (error) {
          results.errors.push({
            line: i + index + 1,
            error: error.message,
            data: structure
          });
        }
      }));
    }

    console.log('[StructuresService] Import terminé:', results);
    return results;
  }
}

const structuresServiceInstance = new StructuresService();
export default structuresServiceInstance;
export const structuresService = structuresServiceInstance;