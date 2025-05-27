/**
 * @fileoverview Hook générique pour les actions CRUD - VERSION ROBUSTE
 * Version refactorisée pour éliminer les boucles infinies
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Refactor Robuste
 */

import { useState, useCallback, useRef } from 'react';
import { db } from '@/services/firebase-service';
import { 
  collection, 
  doc,
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  startAfter
} from '@/services/firebase-service';

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
    onSuccess, 
    onError,
    validateBeforeAction = true 
  } = actionConfig;
  
  const { 
    enableLogging = false, // ✅ CORRECTION: Désactiver les logs par défaut
    autoResetError = true 
  } = options;
  
  // ✅ CORRECTION: Références stables pour les callbacks
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  
  // ✅ CORRECTION: Fonction de création stabilisée
  const create = useCallback(async (data, customId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      if (validateBeforeAction && !data) {
        throw new Error('Données manquantes pour la création');
      }
      
      const entityData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      let result;
      if (customId) {
        // Création avec ID personnalisé
        await updateDoc(doc(db, entityType, customId), entityData);
        result = { id: customId, ...entityData };
      } else {
        // Création avec ID auto-généré
        const docRef = await addDoc(collection(db, entityType), entityData);
        result = { id: docRef.id, ...entityData };
      }
      
      if (onSuccessRef.current) {
        onSuccessRef.current(result, 'create');
      }
      
      return result;
      
    } catch (err) {
      const errorMessage = `Erreur création ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onErrorRef.current) {
        onErrorRef.current(err, 'create');
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
  }, [entityType, validateBeforeAction, enableLogging, autoResetError]);
  
  // ✅ CORRECTION: Fonction de mise à jour stabilisée
  const update = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!id) {
        throw new Error('ID manquant pour la mise à jour');
      }
      
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, entityType, id), updateData);
      const result = { id, ...updateData };
      
      if (onSuccessRef.current) {
        onSuccessRef.current(result, 'update');
      }
      
      return result;
      
    } catch (err) {
      const errorMessage = `Erreur mise à jour ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onErrorRef.current) {
        onErrorRef.current(err, 'update');
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
  }, [entityType, enableLogging, autoResetError]);
  
  // ✅ CORRECTION: Fonction de suppression stabilisée
  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!id) {
        throw new Error('ID manquant pour la suppression');
      }
      
      await deleteDoc(doc(db, entityType, id));
      
      if (onSuccessRef.current) {
        onSuccessRef.current(id, 'delete');
      }
      
      return id;
      
    } catch (err) {
      const errorMessage = `Erreur suppression ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onErrorRef.current) {
        onErrorRef.current(err, 'delete');
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
  }, [entityType, enableLogging, autoResetError]);
  
  // ✅ CORRECTION: Références stables pour les fonctions CRUD
  const createRef = useRef(create);
  const updateRef = useRef(update);
  const removeRef = useRef(remove);
  
  createRef.current = create;
  updateRef.current = update;
  removeRef.current = remove;
  
  // ✅ CORRECTION: Fonction d'opération en lot sans dépendances circulaires
  const batchOperation = useCallback(async (operations) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = [];
      
      for (const operation of operations) {
        const { type, id, data } = operation;
        
        switch (type) {
          case 'create':
            const created = await createRef.current(data);
            results.push({ type: 'create', result: created });
            break;
            
          case 'update':
            const updated = await updateRef.current(id, data);
            results.push({ type: 'update', result: updated });
            break;
            
          case 'delete':
            const deleted = await removeRef.current(id);
            results.push({ type: 'delete', result: deleted });
            break;
            
          default:
            throw new Error(`Type d'opération non supporté: ${type}`);
        }
      }
      
      return results;
      
    } catch (err) {
      const errorMessage = `Erreur opération en lot ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onErrorRef.current) {
        onErrorRef.current(err, 'batch');
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
  }, [entityType, enableLogging, autoResetError]); // Pas de dépendances circulaires
  
  // Fonction de requête avancée (utilise query, where, orderBy, limit, getDocs)
  const queryEntities = useCallback(async (queryConfig = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const {
        filters = {},
        orderByField = null,
        orderDirection = 'asc',
        limitCount = null,
        startAfterDoc = null
      } = queryConfig;
      
      if (enableLogging) {
      }
      
      // Construction de la requête
      let q = collection(db, entityType);
      const constraints = [];
      
      // Ajout des filtres
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            constraints.push(where(field, 'in', value));
          } else if (typeof value === 'object' && value.operator) {
            constraints.push(where(field, value.operator, value.value));
          } else {
            constraints.push(where(field, '==', value));
          }
        }
      });
      
      // Ajout du tri
      if (orderByField) {
        constraints.push(orderBy(orderByField, orderDirection));
      }
      
      // Ajout de la pagination
      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc));
      }
      
      // Ajout de la limite
      if (limitCount) {
        constraints.push(limit(limitCount));
      }
      
      // Exécution de la requête
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
      
      const querySnapshot = await getDocs(q);
      const results = [];
      
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      if (enableLogging) {
      }
      
      return {
        data: results,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: results.length === limitCount
      };
      
    } catch (err) {
      const errorMessage = `Erreur lors de la requête ${entityType}: ${err.message}`;
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
  }, [entityType, onError, enableLogging, autoResetError]);
  
  // Fonction de récupération d'une entité par ID
  const getById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      if (enableLogging) {
      }
      
      if (!id) {
        throw new Error('ID manquant pour la récupération');
      }
      
      const docRef = doc(db, entityType, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null; // ✅ CORRECTION: Retourner null au lieu de throw pour éviter les erreurs
      }
      
      const result = { id, ...docSnap.data() };
      
      if (enableLogging) {
      }
      
      return result;
      
    } catch (err) {
      const errorMessage = `Erreur récupération ${entityType}: ${err.message}`;
      setError(errorMessage);
      
      if (onErrorRef.current) {
        onErrorRef.current(err, 'getById');
      }
      
      if (enableLogging) {
        console.error('❌', errorMessage, err);
      }
      
      return null; // ✅ CORRECTION: Retourner null en cas d'erreur
    } finally {
      setLoading(false);
      
      if (autoResetError) {
        setTimeout(() => setError(null), 5000);
      }
    }
  }, [entityType, enableLogging, autoResetError]);

  return {
    loading,
    error,
    create,
    update,
    remove,
    batchOperation,
    queryEntities,
    getById
  };
};

export default useGenericAction;
