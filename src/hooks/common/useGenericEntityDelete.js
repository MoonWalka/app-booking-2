// src/hooks/common/useGenericEntityDelete.js
import { useState, useCallback } from 'react';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs } from '@/firebaseInit';
import { db } from '@/firebaseInit';
import { toast } from 'react-toastify';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook générique pour gérer la suppression d'entités
 * 
 * @param {Object} options - Options de configuration
 * @param {string} options.entityType - Type d'entité (ex: 'lieu', 'concert', etc.)
 * @param {string} options.collectionName - Nom de la collection Firestore
 * @param {Function} options.onSuccess - Callback appelé après une suppression réussie
 * @param {Function} options.onError - Callback appelé en cas d'erreur
 * @param {Function} options.validateDelete - Fonction pour valider si la suppression est autorisée
 * @param {boolean} options.showConfirmation - Afficher une confirmation avant la suppression
 * @param {string} options.confirmationMessage - Message de confirmation personnalisé
 * @param {Array} options.relatedEntities - Entités liées à vérifier avant la suppression
 * @returns {Object} État et fonctions pour la gestion de la suppression
 */
const useGenericEntityDelete = (options) => {
  const {
    entityType = 'élément',
    collectionName,
    onSuccess = null,
    onError = null,
    validateDelete = null,
    showConfirmation = true,
    confirmationMessage = null,
    relatedEntities = []
  } = options || {};

  const [isDeleting, setIsDeleting] = useState(false);
  const [hasRelatedEntities, setHasRelatedEntities] = useState(false);
  const [relatedEntitiesDetails, setRelatedEntitiesDetails] = useState(null);

  // Message de confirmation par défaut ou personnalisé
  const defaultConfirmationMessage = `Êtes-vous sûr de vouloir supprimer cet ${entityType} ?`;
  const confirmMessage = confirmationMessage || defaultConfirmationMessage;

  /**
   * Vérifier si l'entité peut être supprimée en contrôlant les entités liées
   * 
   * @param {string} entityId - ID de l'entité à supprimer
   * @returns {Promise<boolean>} True si la suppression est autorisée
   */
  const checkRelatedEntities = useCallback(async (entityId) => {
    if (!relatedEntities || relatedEntities.length === 0) {
      return true;
    }

    try {
      debugLog(`Vérification des relations pour ${entityType} avec ID ${entityId}`, 'info', 'useGenericEntityDelete');
      
      // Récupérer l'entité complète
      const entityRef = doc(db, collectionName, entityId);
      const entityDoc = await getDoc(entityRef);
      
      if (!entityDoc.exists()) {
        debugLog(`${entityType} avec ID ${entityId} introuvable`, 'warn', 'useGenericEntityDelete');
        return true;
      }
      
      const entityData = {
        id: entityId,
        ...entityDoc.data()
      };
      
      const relatedDetails = [];
      
      // Vérifier chaque relation définie
      for (const relation of relatedEntities) {
        const { collection: relatedCollection, field, message } = relation;
        
        // Si la relation a une méthode de vérification personnalisée
        if (typeof relation.check === 'function') {
          const hasRelation = await relation.check(entityData);
          if (hasRelation) {
            const errorMessage = message || `Impossible de supprimer : ${entityType} utilisé ailleurs`;
            toast.error(errorMessage);
            
            debugLog(`Relation trouvée via méthode personnalisée: ${errorMessage}`, 'warn', 'useGenericEntityDelete');
            
            relatedDetails.push({
              type: relation.type || 'custom',
              message: errorMessage
            });
            
            setHasRelatedEntities(true);
            setRelatedEntitiesDetails(relatedDetails);
            return false;
          }
          continue;
        }
        
        // Méthode standard de vérification par requête à la collection liée
        if (relatedCollection && field) {
          debugLog(`Vérification des références dans la collection ${relatedCollection} sur le champ ${field}`, 'debug', 'useGenericEntityDelete');
          
          // Détecter le type de champ de référence
          let queryToExecute;
          
          // Cas 1: Champ direct contenant l'ID (ex: { lieuId: 'abc123' })
          if (relation.referenceType === 'direct' || !relation.referenceType) {
            queryToExecute = query(
              collection(db, relatedCollection),
              where(field, '==', entityId)
            );
          } 
          // Cas 2: Champ dans un tableau (ex: { artistes: ['abc123', 'def456'] })
          else if (relation.referenceType === 'array') {
            queryToExecute = query(
              collection(db, relatedCollection),
              where(field, 'array-contains', entityId)
            );
          }
          // Cas 3: Champ dans un objet (ex: { lieu: { id: 'abc123', nom: 'Nom' } })
          else if (relation.referenceType === 'object' && relation.objectIdPath) {
            queryToExecute = query(
              collection(db, relatedCollection),
              where(`${field}.${relation.objectIdPath}`, '==', entityId)
            );
          }
          // Cas 4: Vérification personnalisée basée sur un autre champ
          else if (relation.referenceType === 'custom-field' && relation.customFieldValue) {
            // Le champ à vérifier peut être dynamique, basé sur une valeur de l'entité
            const fieldValue = relation.customFieldValue(entityData);
            queryToExecute = query(
              collection(db, relatedCollection),
              where(field, '==', fieldValue)
            );
          }
          
          if (queryToExecute) {
            const querySnapshot = await getDocs(queryToExecute);
            
            if (!querySnapshot.empty) {
              const count = querySnapshot.size;
              const relatedDocs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              const errorMessage = message || 
                `Impossible de supprimer : ${entityType} est référencé par ${count} ${relatedCollection}`;
              
              debugLog(`${count} références trouvées dans ${relatedCollection}`, 'warn', 'useGenericEntityDelete');
              
              toast.error(errorMessage);
              
              // Pour le premier document lié trouvé, afficher des détails plus spécifiques
              if (relation.detailsField && relatedDocs.length > 0) {
                const detailField = relation.detailsField;
                const details = relatedDocs.map(doc => doc[detailField]).slice(0, 3);
                
                debugLog(`Entités liées: ${details.join(', ')}${relatedDocs.length > 3 ? '...' : ''}`, 'info', 'useGenericEntityDelete');
                
                const detailsMessage = `Utilisé par: ${details.join(', ')}${relatedDocs.length > 3 ? '...' : ''}`;
                toast.info(detailsMessage);
              }
              
              relatedDetails.push({
                type: relatedCollection,
                count,
                message: errorMessage,
                items: relatedDocs.slice(0, 5) // Limiter à 5 documents pour éviter de surcharger l'état
              });
              
              setHasRelatedEntities(true);
              setRelatedEntitiesDetails(relatedDetails);
              return false;
            }
          }
        }
      }
      
      // Aucune relation trouvée, suppression autorisée
      setHasRelatedEntities(false);
      setRelatedEntitiesDetails(null);
      return true;
    } catch (error) {
      debugLog(`Erreur lors de la vérification des entités liées: ${error.message}`, 'error', 'useGenericEntityDelete');
      
      if (onError) onError(error);
      toast.error(`Erreur lors de la vérification des dépendances: ${error.message}`);
      return false;
    }
  }, [relatedEntities, entityType, collectionName, onError]);

  /**
   * Gérer la suppression d'une entité
   * 
   * @param {string} entityId - ID de l'entité à supprimer
   * @param {Event} e - Événement (facultatif)
   * @returns {Promise<boolean>} True si la suppression a réussi
   */
  const handleDelete = useCallback(async (entityId, e) => {
    console.log('[LOG][useGenericEntityDelete] handleDelete appelé', entityId);
    // Empêcher la propagation de l'événement si fourni
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    // Vérifier si la validation personnalisée autorise la suppression
    if (validateDelete && !await validateDelete(entityId)) {
      debugLog(`Suppression du ${entityType} refusée par la fonction de validation`, 'info', 'useGenericEntityDelete');
      return false;
    }
    
    // Vérifier les entités liées si spécifiées
    if (relatedEntities.length > 0 && !await checkRelatedEntities(entityId)) {
      return false;
    }
    
    // Demander confirmation si nécessaire
    if (showConfirmation && !window.confirm(confirmMessage)) {
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      debugLog(`Suppression du ${entityType} avec ID: ${entityId}`, 'info', 'useGenericEntityDelete');
      
      // Supprimer l'entité de Firestore
      const entityRef = doc(db, collectionName, entityId);
      await deleteDoc(entityRef);
      
      // Notification de succès
      toast.success(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} supprimé avec succès`);
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess(entityId);
      }
      
      console.log('[LOG][useGenericEntityDelete] Suppression réussie', entityId);
      return true;
    } catch (error) {
      debugLog(`Erreur lors de la suppression du ${entityType}: ${error.message}`, 'error', 'useGenericEntityDelete');
      console.error('[LOG][useGenericEntityDelete] Erreur lors de la suppression', error);
      
      // Notification d'erreur
      toast.error(`Erreur lors de la suppression: ${error.message}`);
      
      // Appeler le callback d'erreur si fourni
      if (onError) {
        onError(error);
      }
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [
    entityType,
    collectionName,
    validateDelete,
    relatedEntities,
    showConfirmation,
    confirmMessage,
    onSuccess,
    onError,
    checkRelatedEntities
  ]);

  return {
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    handleDelete,
    checkRelatedEntities
  };
};

export default useGenericEntityDelete;