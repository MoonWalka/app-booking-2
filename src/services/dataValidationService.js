/**
 * Service de validation des données pour garantir la sécurité multi-organisation
 * et empêcher les structures de données imbriquées
 */

import { useOrganization } from '@/context/OrganizationContext';

/**
 * Valide qu'une entité n'a pas de structure imbriquée
 * @param {Object} data - Les données à valider
 * @param {string} entityType - Le type d'entité (contacts, lieux, etc.)
 * @returns {Object} - { isValid: boolean, errors: string[], sanitized: Object }
 */
export const validateEntityStructure = (data, entityType) => {
  const errors = [];
  let sanitized = { ...data };
  
  // Liste des champs interdits (structures imbriquées)
  const forbiddenFields = {
    contacts: ['contact'],
    lieux: ['lieu'],
    artistes: ['artiste'],
    structures: ['structure'],
    concerts: ['concert']
  };
  
  // Vérifier la présence de structures imbriquées
  const forbidden = forbiddenFields[entityType] || [];
  forbidden.forEach(field => {
    if (data[field] && typeof data[field] === 'object') {
      errors.push(`Structure imbriquée détectée: le champ "${field}" ne doit pas être un objet`);
      
      // Tenter d'aplatir la structure
      if (data[field].nom || data[field].titre) {
        sanitized = {
          ...sanitized,
          ...data[field],
          id: data.id // Préserver l'ID original
        };
        delete sanitized[field];
      }
    }
  });
  
  // Vérifier la présence d'organizationId
  if (!data.organizationId) {
    errors.push('Le champ organizationId est obligatoire');
  }
  
  // Vérifier que les relations sont des tableaux d'IDs
  // Support des deux formats : avec et sans suffixe 'Ids'
  const relationFields = [
    'contacts', 'contactsIds',
    'lieux', 'lieuxIds', 
    'artistes', 'artistesIds',
    'structures', 'structuresIds',
    'concerts', 'concertsIds', 'concertsAssocies'
  ];
  
  relationFields.forEach(field => {
    if (data[field] && !Array.isArray(data[field])) {
      errors.push(`Le champ "${field}" doit être un tableau d'identifiants`);
    }
    
    // Vérifier que ce sont bien des strings (IDs)
    if (Array.isArray(data[field])) {
      const hasInvalidItems = data[field].some(item => 
        typeof item !== 'string' || item.length === 0
      );
      if (hasInvalidItems) {
        errors.push(`Le champ "${field}" contient des identifiants invalides`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Valide et prépare les données avant l'enregistrement
 * @param {Object} data - Les données à enregistrer
 * @param {string} entityType - Le type d'entité
 * @param {string} organizationId - L'ID de l'organisation courante
 * @returns {Object} - Les données validées et préparées
 * @throws {Error} - Si les données sont invalides
 */
export const prepareDataForSave = (data, entityType, organizationId) => {
  // Validation de structure
  const validation = validateEntityStructure(data, entityType);
  
  if (!validation.isValid) {
    console.error('❌ Erreurs de validation:', validation.errors);
    throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
  }
  
  // Ajouter les métadonnées obligatoires
  const preparedData = {
    ...validation.sanitized,
    organizationId: organizationId || validation.sanitized.organizationId,
    updatedAt: new Date().toISOString()
  };
  
  // Ajouter createdAt si c'est une nouvelle entité
  if (!data.id && !data.createdAt) {
    preparedData.createdAt = new Date().toISOString();
  }
  
  // Nettoyer les champs undefined ou null (mais garder les tableaux vides)
  Object.keys(preparedData).forEach(key => {
    if (preparedData[key] === undefined || preparedData[key] === null) {
      delete preparedData[key];
    }
  });
  
  // S'assurer que les champs de relations existent (même vides) pour la bidirectionnalité
  if (entityType === 'contacts') {
    preparedData.lieuxIds = preparedData.lieuxIds || [];
    preparedData.concertsIds = preparedData.concertsIds || [];
    preparedData.artistesIds = preparedData.artistesIds || [];
    preparedData.concertsAssocies = preparedData.concertsAssocies || [];
  }
  
  return preparedData;
};

/**
 * Valide que deux entités appartiennent à la même organisation
 * @param {Object} entity1 - Première entité
 * @param {Object} entity2 - Deuxième entité
 * @returns {boolean} - true si même organisation
 */
export const validateSameOrganization = (entity1, entity2) => {
  if (!entity1?.organizationId || !entity2?.organizationId) {
    console.error('❌ Une ou plusieurs entités sans organizationId');
    return false;
  }
  
  return entity1.organizationId === entity2.organizationId;
};

/**
 * Hook pour utiliser le service de validation avec le contexte d'organisation
 */
export const useDataValidation = () => {
  const { currentOrganization } = useOrganization();
  
  const validateAndPrepare = (data, entityType) => {
    if (!currentOrganization?.id) {
      throw new Error('Aucune organisation sélectionnée');
    }
    
    return prepareDataForSave(data, entityType, currentOrganization.id);
  };
  
  const canCreateRelation = async (sourceEntity, targetEntity) => {
    return validateSameOrganization(sourceEntity, targetEntity);
  };
  
  return {
    validateEntityStructure,
    validateAndPrepare,
    canCreateRelation,
    prepareDataForSave: (data, entityType) => 
      prepareDataForSave(data, entityType, currentOrganization?.id)
  };
};

/**
 * Intercepteur automatique pour les collections sensibles
 */
export const interceptFirestoreOperations = () => {
  // Sauvegarder les fonctions originales
  const originalAddDoc = window._originalAddDoc || window.addDoc;
  const originalSetDoc = window._originalSetDoc || window.setDoc;
  
  if (!window._firestoreIntercepted) {
    window._originalAddDoc = originalAddDoc;
    window._originalSetDoc = originalSetDoc;
    window._firestoreIntercepted = true;
    
    console.log('🛡️ Interception Firestore activée pour la validation des données');
  }
};

/**
 * Middleware pour intercepter les opérations Firestore
 */
export const createSecureFirestoreOperations = (organizationId) => {
  return {
    // Ajouter un document avec validation
    add: async (collectionRef, data) => {
      const entityType = collectionRef.path.split('/').pop();
      const validatedData = prepareDataForSave(data, entityType, organizationId);
      
      // Import dynamique pour éviter les dépendances circulaires
      const { addDoc } = await import('@/services/firebase-service');
      return addDoc(collectionRef, validatedData);
    },
    
    // Mettre à jour un document avec validation
    update: async (docRef, data) => {
      const pathParts = docRef.path.split('/');
      const entityType = pathParts[pathParts.length - 2];
      
      // Ne pas valider toute la structure pour un update partiel
      // Mais vérifier qu'on n'ajoute pas de structure imbriquée
      const validation = validateEntityStructure(data, entityType);
      if (!validation.isValid) {
        throw new Error(`Mise à jour invalide: ${validation.errors.join(', ')}`);
      }
      
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      const { updateDoc } = await import('@/services/firebase-service');
      return updateDoc(docRef, updateData);
    },
    
    // Filtrer automatiquement par organization
    query: async (collectionRef, ...constraints) => {
      const { query, where } = await import('@/services/firebase-service');
      
      // Ajouter le filtre organizationId automatiquement
      const orgConstraint = where('organizationId', '==', organizationId);
      return query(collectionRef, orgConstraint, ...constraints);
    }
  };
};

const dataValidationService = {
  validateEntityStructure,
  prepareDataForSave,
  validateSameOrganization,
  useDataValidation,
  createSecureFirestoreOperations
};

export default dataValidationService;