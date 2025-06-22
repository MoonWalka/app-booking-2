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
import { validateQualification } from '@/schemas/ContactRefactoredSchemas';

const COLLECTION_NAME = 'qualifications';

/**
 * Service pour gérer la taxonomie hiérarchique des qualifications
 * Compatible avec la logique Bob Booking (catégories, sous-catégories, réseaux)
 */
class QualificationsService {

  /**
   * Qualifications par défaut pour initialiser le système
   */
  static DEFAULT_QUALIFICATIONS = [
    // Diffuseurs
    { code: 'DIFFUSEUR', label: 'Diffuseur', type: 'activite', parentId: null },
    { code: 'FESTIVAL', label: 'Festival', type: 'activite', parentId: 'DIFFUSEUR' },
    { code: 'SALLE', label: 'Salle de spectacle', type: 'activite', parentId: 'DIFFUSEUR' },
    { code: 'THEATRE', label: 'Théâtre', type: 'activite', parentId: 'DIFFUSEUR' },
    { code: 'CAFE_CONCERT', label: 'Café-concert', type: 'activite', parentId: 'DIFFUSEUR' },
    
    // Médias
    { code: 'MEDIA', label: 'Média', type: 'activite', parentId: null },
    { code: 'PRESSE_ECRITE', label: 'Presse écrite', type: 'activite', parentId: 'MEDIA' },
    { code: 'RADIO', label: 'Radio', type: 'activite', parentId: 'MEDIA' },
    { code: 'TELEVISION', label: 'Télévision', type: 'activite', parentId: 'MEDIA' },
    { code: 'WEB_MEDIA', label: 'Média web', type: 'activite', parentId: 'MEDIA' },
    
    // Production
    { code: 'PRODUCTION', label: 'Production', type: 'activite', parentId: null },
    { code: 'LABEL', label: 'Label', type: 'activite', parentId: 'PRODUCTION' },
    { code: 'EDITEUR', label: 'Éditeur', type: 'activite', parentId: 'PRODUCTION' },
    { code: 'PRODUCTEUR', label: 'Producteur', type: 'activite', parentId: 'PRODUCTION' },
    
    // Institutions
    { code: 'INSTITUTION', label: 'Institution', type: 'activite', parentId: null },
    { code: 'COLLECTIVITE', label: 'Collectivité', type: 'activite', parentId: 'INSTITUTION' },
    { code: 'ASSOCIATION', label: 'Association', type: 'activite', parentId: 'INSTITUTION' },
    { code: 'FEDERATION', label: 'Fédération', type: 'activite', parentId: 'INSTITUTION' },
    
    // Genres musicaux
    { code: 'ROCK', label: 'Rock', type: 'genre', parentId: null },
    { code: 'JAZZ', label: 'Jazz', type: 'genre', parentId: null },
    { code: 'CLASSIQUE', label: 'Classique', type: 'genre', parentId: null },
    { code: 'ELECTRONIQUE', label: 'Électronique', type: 'genre', parentId: null },
    { code: 'CHANSON', label: 'Chanson française', type: 'genre', parentId: null },
    { code: 'WORLD', label: 'Musiques du monde', type: 'genre', parentId: null },
    
    // Réseaux
    { code: 'FEDUROK', label: 'Fédurok', type: 'reseau', parentId: null },
    { code: 'SMA', label: 'SMA', type: 'reseau', parentId: null },
    { code: 'ZONE_FRANCHE', label: 'Zone Franche', type: 'reseau', parentId: null }
  ];

  /**
   * Créer une nouvelle qualification
   */
  async createQualification(data, organizationId, userId) {
    try {
      // Validation des données
      const validation = await validateQualification({ ...data, organizationId });
      if (!validation.valid) {
        throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
      }

      // Vérifier l'unicité du code dans l'organisation
      if (data.code) {
        const existingQuery = query(
          collection(db, COLLECTION_NAME),
          where('organizationId', '==', organizationId),
          where('code', '==', data.code)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
          throw new Error(`Une qualification avec ce code existe déjà: ${data.code}`);
        }
      }

      // Vérifier que le parent existe si fourni
      if (data.parentId) {
        const parentResult = await this.getQualification(data.parentId);
        if (!parentResult.success) {
          throw new Error('Qualification parent non trouvée');
        }
      }

      // Créer la qualification
      const qualificationData = {
        ...validation.data,
        organizationId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), qualificationData);
      console.log('[QualificationsService] Qualification créée:', docRef.id);

      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...qualificationData }
      };
    } catch (error) {
      console.error('[QualificationsService] Erreur création qualification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mettre à jour une qualification
   */
  async updateQualification(qualificationId, updates, userId) {
    try {
      // Récupérer la qualification actuelle
      const docRef = doc(db, COLLECTION_NAME, qualificationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Qualification non trouvée');
      }

      const currentData = docSnap.data();
      const updatedData = { ...currentData, ...updates };

      // Validation
      const validation = await validateQualification(updatedData);
      if (!validation.valid) {
        throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
      }

      // Vérifier l'unicité du code si modifié
      if (updates.code && updates.code !== currentData.code) {
        const existingQuery = query(
          collection(db, COLLECTION_NAME),
          where('organizationId', '==', currentData.organizationId),
          where('code', '==', updates.code)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
          throw new Error(`Une qualification avec ce code existe déjà: ${updates.code}`);
        }
      }

      // Éviter les références circulaires
      if (updates.parentId && updates.parentId !== currentData.parentId) {
        const isCircular = await this.checkCircularReference(qualificationId, updates.parentId);
        if (isCircular) {
          throw new Error('Référence circulaire détectée');
        }
      }

      // Mettre à jour
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });

      console.log('[QualificationsService] Qualification mise à jour:', qualificationId);
      return {
        success: true,
        id: qualificationId
      };
    } catch (error) {
      console.error('[QualificationsService] Erreur mise à jour qualification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer une qualification par ID
   */
  async getQualification(qualificationId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, qualificationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Qualification non trouvée');
      }

      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() }
      };
    } catch (error) {
      console.error('[QualificationsService] Erreur récupération qualification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lister les qualifications d'une organisation
   */
  async listQualifications(organizationId, filters = {}) {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('organizationId', '==', organizationId)
      );

      // Appliquer les filtres
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters.parentId !== undefined) {
        q = query(q, where('parentId', '==', filters.parentId));
      }

      if (filters.actif !== undefined) {
        q = query(q, where('actif', '==', filters.actif));
      }

      // Tri par ordre puis par label
      q = query(q, orderBy('ordre', 'asc'), orderBy('label', 'asc'));

      const snapshot = await getDocs(q);
      const qualifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`[QualificationsService] ${qualifications.length} qualifications trouvées`);
      return {
        success: true,
        data: qualifications
      };
    } catch (error) {
      console.error('[QualificationsService] Erreur liste qualifications:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Construire l'arbre hiérarchique des qualifications
   */
  async buildQualificationTree(organizationId, type = null) {
    try {
      // Récupérer toutes les qualifications
      const filters = { actif: true };
      if (type) filters.type = type;
      
      const result = await this.listQualifications(organizationId, filters);
      if (!result.success) return result;

      const qualifications = result.data;
      const tree = this.buildTree(qualifications);

      return {
        success: true,
        data: tree
      };
    } catch (error) {
      console.error('[QualificationsService] Erreur construction arbre:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Construire un arbre à partir d'une liste plate
   */
  buildTree(qualifications, parentId = null) {
    const children = qualifications
      .filter(q => q.parentId === parentId)
      .sort((a, b) => (a.ordre || 0) - (b.ordre || 0) || a.label.localeCompare(b.label))
      .map(qualification => ({
        ...qualification,
        children: this.buildTree(qualifications, qualification.id)
      }));

    return children;
  }

  /**
   * Vérifier les références circulaires
   */
  async checkCircularReference(qualificationId, parentId) {
    try {
      if (!parentId) return false;
      
      let currentId = parentId;
      const visited = new Set();
      
      while (currentId && !visited.has(currentId)) {
        if (currentId === qualificationId) {
          return true; // Référence circulaire détectée
        }
        
        visited.add(currentId);
        
        const result = await this.getQualification(currentId);
        if (!result.success) break;
        
        currentId = result.data.parentId;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur vérification référence circulaire:', error);
      return true; // En cas d'erreur, on considère qu'il y a un problème
    }
  }

  /**
   * Supprimer une qualification
   */
  async deleteQualification(qualificationId) {
    try {
      // Vérifier s'il y a des enfants
      const childrenQuery = query(
        collection(db, COLLECTION_NAME),
        where('parentId', '==', qualificationId)
      );
      const childrenSnapshot = await getDocs(childrenQuery);
      
      if (!childrenSnapshot.empty) {
        throw new Error(`Cette qualification a ${childrenSnapshot.size} sous-qualifications`);
      }

      // TODO: Vérifier l'utilisation dans les structures/personnes
      
      // Supprimer la qualification
      await deleteDoc(doc(db, COLLECTION_NAME, qualificationId));
      
      console.log('[QualificationsService] Qualification supprimée:', qualificationId);
      return {
        success: true,
        id: qualificationId
      };
    } catch (error) {
      console.error('[QualificationsService] Erreur suppression qualification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Initialiser les qualifications par défaut pour une organisation
   */
  async initializeDefaultQualifications(organizationId, userId) {
    try {
      console.log('[QualificationsService] Initialisation qualifications par défaut...');
      
      const results = [];
      const qualificationMap = new Map(); // code -> id
      
      // Créer d'abord les qualifications parent (parentId = null)
      const parents = this.DEFAULT_QUALIFICATIONS.filter(q => q.parentId === null);
      
      for (const qualification of parents) {
        const result = await this.createQualification({
          ...qualification,
          ordre: results.length
        }, organizationId, userId);
        
        if (result.success) {
          qualificationMap.set(qualification.code, result.id);
          results.push(result);
        }
      }
      
      // Puis créer les enfants
      const children = this.DEFAULT_QUALIFICATIONS.filter(q => q.parentId !== null);
      
      for (const qualification of children) {
        const parentId = qualificationMap.get(qualification.parentId);
        if (!parentId) continue;
        
        const result = await this.createQualification({
          ...qualification,
          parentId,
          ordre: results.length
        }, organizationId, userId);
        
        if (result.success) {
          qualificationMap.set(qualification.code, result.id);
          results.push(result);
        }
      }
      
      console.log(`[QualificationsService] ${results.length} qualifications créées`);
      return {
        success: true,
        created: results.length,
        qualifications: results
      };
      
    } catch (error) {
      console.error('[QualificationsService] Erreur initialisation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Migrer les tags plats vers les qualifications hiérarchiques
   */
  async migrateFlatTagsToQualifications(organizationId, tagMappings) {
    try {
      console.log('[QualificationsService] Migration tags vers qualifications...');
      
      // tagMappings = { "tag_string": "qualification_id" }
      const results = {
        migratedStructures: 0,
        migratedPersonnes: 0,
        errors: []
      };

      // TODO: Implémenter la migration des tags
      // - Récupérer toutes les structures avec tags
      // - Remplacer les strings par les IDs de qualification
      // - Même chose pour les personnes
      
      console.log('[QualificationsService] Migration terminée');
      return {
        success: true,
        results
      };
      
    } catch (error) {
      console.error('[QualificationsService] Erreur migration tags:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Rechercher des qualifications par label
   */
  async searchQualifications(organizationId, searchTerm) {
    try {
      // Récupérer toutes les qualifications et filtrer côté client
      const result = await this.listQualifications(organizationId, { actif: true });
      if (!result.success) return result;

      const searchLower = searchTerm.toLowerCase();
      const filtered = result.data.filter(qualification => 
        qualification.label.toLowerCase().includes(searchLower) ||
        qualification.code?.toLowerCase().includes(searchLower)
      );

      return {
        success: true,
        data: filtered
      };
    } catch (error) {
      console.error('[QualificationsService] Erreur recherche qualifications:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtenir le chemin complet d'une qualification
   */
  async getQualificationPath(qualificationId) {
    try {
      const path = [];
      let currentId = qualificationId;
      
      while (currentId) {
        const result = await this.getQualification(currentId);
        if (!result.success) break;
        
        path.unshift(result.data);
        currentId = result.data.parentId;
      }
      
      return {
        success: true,
        path,
        fullPath: path.map(q => q.label).join(' > ')
      };
    } catch (error) {
      console.error('[QualificationsService] Erreur chemin qualification:', error);
      return {
        success: false,
        error: error.message,
        path: []
      };
    }
  }
}

const qualificationsServiceInstance = new QualificationsService();
export default qualificationsServiceInstance;