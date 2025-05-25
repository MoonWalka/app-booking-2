/**
 * @fileoverview Hook générique pour les actions CRUD
 * Hook générique créé lors de la Phase 2 de généralisation
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation
 */

import { useState, useCallback } from 'react';
import { db } from '@/firebaseInit';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from '@/firebaseInit';

/**
 * Hook générique pour les actions CRUD
 * 
 * @description
 * Fonctionnalités supportées :
 * - create: Création d'entités
 * - update: Mise à jour d'entités
 * - delete: Suppression d'entités
 * - batch_operations: Opérations en lot
 * 
 * @param {string} entityType - Type d'entité (concerts, programmateurs, etc.)
 * @param {Object} actionConfig - Configuration des actions
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {boolean} returns.loading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur
 * @returns {Function} returns.create - Fonction de création
 * @returns {Function} returns.update - Fonction de mise à jour
 * @returns {Function} returns.remove - Fonction de suppression
 * @returns {Function} returns.batchOperation - Fonction d'opération en lot
 * 
 * @example
 * ```javascript
 * const { loading, error, create, update, remove } = useGenericAction('concerts', {
 *   onCreate: (data) => console.log('Concert créé:', data),
 *   onUpdate: (data) => console.log('Concert mis à jour:', data),
 *   onDelete: (id) => console.log('Concert supprimé:', id)
 * });
 * 
 * // Créer un nouveau concert
 * const handleCreate = async () => {
 *   const newConcert = await create({
 *     titre: 'Nouveau concert',
 *     date: new Date(),
 *     statut: 'contact'
 *   });
 * };
 * ```
 * 
 * @complexity MEDIUM
 * @businessCritical false
 * @generic true
 * @replaces useActionHandler, useFormActions
 */
const useGenericAction = (entityType, actionConfig = {}, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { 
    onCreate, 
    onUpdate, 
    onDelete, 
    onError,
    validateBeforeAction = true 
  } = actionConfig;
  
  const { 
    enableLogging = true,
    autoResetError = true 
  } = options;
  
  // Fonction de création
  const create = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      if (enableLogging) {
        console.log(`🆕 Création ${entityType}:`, data);
      }
      
      // Validation optionnelle
      if (validateBeforeAction && !data) {
        throw new Error('Données manquantes pour la création');
      }
      
      // Ajouter les métadonnées
      const entityData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, entityType), entityData);
      const result = { id: docRef.id, ...entityData };
      
      if (onCreate) {
        onCreate(result);
      }
      
      if (enableLogging) {
        console.log(`✅ ${entityType} créé:`, result);
      }
      
      return result;
      
    } catch (err) {
      const errorMessage = `Erreur lors de la création de ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (enableLogging) {
        console.error('❌', errorMessage, err);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (autoResetError) {
        setTimeout(() => setError(null), 5000);
      }
    }
  }, [entityType, onCreate, onError, validateBeforeAction, enableLogging, autoResetError]);
  
  // Fonction de mise à jour
  const update = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    
    try {
      if (enableLogging) {
        console.log(`🔄 Mise à jour ${entityType} ${id}:`, data);
      }
      
      if (!id) {
        throw new Error('ID manquant pour la mise à jour');
      }
      
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, entityType, id), updateData);
      const result = { id, ...updateData };
      
      if (onUpdate) {
        onUpdate(result);
      }
      
      if (enableLogging) {
        console.log(`✅ ${entityType} mis à jour:`, result);
      }
      
      return result;
      
    } catch (err) {
      const errorMessage = `Erreur lors de la mise à jour de ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (enableLogging) {
        console.error('❌', errorMessage, err);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (autoResetError) {
        setTimeout(() => setError(null), 5000);
      }
    }
  }, [entityType, onUpdate, onError, enableLogging, autoResetError]);
  
  // Fonction de suppression
  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      if (enableLogging) {
        console.log(`🗑️ Suppression ${entityType} ${id}`);
      }
      
      if (!id) {
        throw new Error('ID manquant pour la suppression');
      }
      
      await deleteDoc(doc(db, entityType, id));
      
      if (onDelete) {
        onDelete(id);
      }
      
      if (enableLogging) {
        console.log(`✅ ${entityType} supprimé: ${id}`);
      }
      
      return id;
      
    } catch (err) {
      const errorMessage = `Erreur lors de la suppression de ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (enableLogging) {
        console.error('❌', errorMessage, err);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (autoResetError) {
        setTimeout(() => setError(null), 5000);
      }
    }
  }, [entityType, onDelete, onError, enableLogging, autoResetError]);
  
  // Fonction d'opération en lot
  const batchOperation = useCallback(async (operations) => {
    setLoading(true);
    setError(null);
    
    try {
      if (enableLogging) {
        console.log(`📦 Opération en lot ${entityType}:`, operations.length, 'opérations');
      }
      
      const results = [];
      
      for (const operation of operations) {
        const { type, id, data } = operation;
        
        switch (type) {
          case 'create':
            const created = await create(data);
            results.push({ type: 'create', result: created });
            break;
            
          case 'update':
            const updated = await update(id, data);
            results.push({ type: 'update', result: updated });
            break;
            
          case 'delete':
            const deleted = await remove(id);
            results.push({ type: 'delete', result: deleted });
            break;
            
          default:
            throw new Error(`Type d'opération non supporté: ${type}`);
        }
      }
      
      if (enableLogging) {
        console.log(`✅ Opération en lot terminée:`, results.length, 'opérations');
      }
      
      return results;
      
    } catch (err) {
      const errorMessage = `Erreur lors de l'opération en lot ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (enableLogging) {
        console.error('❌', errorMessage, err);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (autoResetError) {
        setTimeout(() => setError(null), 5000);
      }
    }
  }, [entityType, create, update, remove, onError, enableLogging, autoResetError]);
  
  return {
    loading,
    error,
    create,
    update,
    remove,
    batchOperation
  };
};

export default useGenericAction;
