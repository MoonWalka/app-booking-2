/**
 * Hook pour gérer les relations bidirectionnelles dans les formulaires
 * Utilise le service bidirectionalRelationsService pour maintenir la cohérence
 */

import { useCallback, useState } from 'react';
import { updateBidirectionalRelation, checkAndFixBidirectionalRelations } from '@/services/bidirectionalRelationsService';

/**
 * Hook pour gérer les relations bidirectionnelles
 * 
 * @param {string} entityType - Type de l'entité principale
 * @param {string} entityId - ID de l'entité principale
 * @returns {Object} - Méthodes pour gérer les relations
 */
export function useBidirectionalRelations(entityType, entityId) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Ajoute une relation bidirectionnelle
   */
  const addRelation = useCallback(async (targetType, targetId, relationName) => {
    if (!entityId || !targetId) {
      console.warn('[useBidirectionalRelations] IDs manquants', { entityId, targetId });
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      await updateBidirectionalRelation({
        sourceType: entityType,
        sourceId: entityId,
        targetType,
        targetId,
        relationName,
        action: 'add'
      });

      console.log(`[useBidirectionalRelations] Relation ajoutée: ${entityType}(${entityId}) -> ${targetType}(${targetId})`);
    } catch (err) {
      console.error('[useBidirectionalRelations] Erreur lors de l\'ajout:', err);
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [entityType, entityId]);

  /**
   * Supprime une relation bidirectionnelle
   */
  const removeRelation = useCallback(async (targetType, targetId, relationName) => {
    if (!entityId || !targetId) {
      console.warn('[useBidirectionalRelations] IDs manquants', { entityId, targetId });
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      await updateBidirectionalRelation({
        sourceType: entityType,
        sourceId: entityId,
        targetType,
        targetId,
        relationName,
        action: 'remove'
      });

      console.log(`[useBidirectionalRelations] Relation supprimée: ${entityType}(${entityId}) -X-> ${targetType}(${targetId})`);
    } catch (err) {
      console.error('[useBidirectionalRelations] Erreur lors de la suppression:', err);
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [entityType, entityId]);

  /**
   * Met à jour une relation (supprime l'ancienne et ajoute la nouvelle)
   */
  const updateRelation = useCallback(async (targetType, oldTargetId, newTargetId, relationName) => {
    if (!entityId) {
      console.warn('[useBidirectionalRelations] ID entité manquant');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      // Supprimer l'ancienne relation si elle existe
      if (oldTargetId && oldTargetId !== newTargetId) {
        await removeRelation(targetType, oldTargetId, relationName);
      }

      // Ajouter la nouvelle relation si elle est différente
      if (newTargetId && newTargetId !== oldTargetId) {
        await addRelation(targetType, newTargetId, relationName);
      }

      console.log(`[useBidirectionalRelations] Relation mise à jour: ${oldTargetId} -> ${newTargetId}`);
    } catch (err) {
      console.error('[useBidirectionalRelations] Erreur lors de la mise à jour:', err);
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [entityId, addRelation, removeRelation]);

  /**
   * Vérifie et corrige les relations bidirectionnelles
   */
  const checkAndFix = useCallback(async () => {
    if (!entityId) {
      console.warn('[useBidirectionalRelations] ID entité manquant pour la vérification');
      return null;
    }

    setUpdating(true);
    setError(null);

    try {
      const result = await checkAndFixBidirectionalRelations(entityType, entityId);
      
      if (result.corrections && result.corrections.length > 0) {
        console.log(`[useBidirectionalRelations] ${result.corrections.length} corrections appliquées`);
      }
      
      return result;
    } catch (err) {
      console.error('[useBidirectionalRelations] Erreur lors de la vérification:', err);
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [entityType, entityId]);

  return {
    addRelation,
    removeRelation,
    updateRelation,
    checkAndFix,
    updating,
    error
  };
}

export default useBidirectionalRelations;