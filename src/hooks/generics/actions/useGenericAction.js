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
  setDoc,
  updateDoc,
  deleteDoc,
  startAfter
} from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';

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
 * @param {string} entityType - Type d'entité (concerts, contacts, etc.)
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
 *   onCreate: (data) => console.log('Date créé:', data),
 *   onUpdate: (data) => console.log('Date mis à jour:', data),
 *   onDelete: (id) => console.log('Date supprimé:', id)
 * });
 * 
 * // Créer un nouveau concert
 * const handleCreate = async () => {
 *   const newDate = await create({
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
  const { currentEntreprise } = useEntreprise();
  
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
    console.log('🟣🟣🟣 DÉBUT CREATE dans useGenericAction pour', entityType);
    console.log('🟣 Données reçues:', data);
    
    setLoading(true);
    setError(null);
    
    try {
      if (validateBeforeAction && !data) {
        throw new Error('Données manquantes pour la création');
      }
      
      let entityData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Ajouter l'entrepriseId si disponible
        ...(currentEntreprise?.id && { entrepriseId: currentEntreprise.id })
      };
      
      console.log('💾💾💾 useGenericAction.js - CREATE', entityType);
      console.log('💾 DONNÉES REÇUES:', JSON.stringify(entityData, null, 2));
      
      // VÉRIFICATION CRITIQUE pour les contacts
      if (entityType === 'contacts') {
        // Si structure imbriquée détectée, BLOQUER
        if (entityData.contact || entityData.structure) {
          console.error('🚨🚨🚨 STRUCTURE IMBRIQUÉE DÉTECTÉE - CORRECTION FORCÉE');
        console.log('🔴 Avant aplatissement:', entityData);
        
        // Aplatir les données tout en préservant TOUS les champs pour la bidirectionnalité
        entityData = {
          // Champs contact PLATS
          nom: entityData.contact.nom || '',
          prenom: entityData.contact.prenom || '',
          email: entityData.contact.email || '',
          telephone: entityData.contact.telephone || '',
          fonction: entityData.contact.fonction || '',
          adresse: entityData.contact.adresse || '',
          codePostal: entityData.contact.codePostal || '',
          ville: entityData.contact.ville || '',
          
          // Champs structure - IMPORTANT pour les relations
          structureId: entityData.structureId || '',
          structureNom: entityData.structureNom || entityData.structure?.nom || entityData.structure?.raisonSociale || '',
          
          // Si une structure complète est fournie, aplatir ses champs
          ...(entityData.structure ? {
            structureRaisonSociale: entityData.structure.raisonSociale || '',
            structureSiret: entityData.structure.siret || '',
            structureType: entityData.structure.type || '',
            structureAdresse: entityData.structure.adresse || '',
            structureCodePostal: entityData.structure.codePostal || '',
            structureVille: entityData.structure.ville || '',
            structurePays: entityData.structure.pays || 'France',
            structureTva: entityData.structure.tva || '',
            structureNumeroIntracommunautaire: entityData.structure.numeroIntracommunautaire || ''
          } : {}),
          
          // Champs obligatoires
          entrepriseId: entityData.entrepriseId || currentEntreprise?.id,
          createdAt: entityData.createdAt || new Date(),
          updatedAt: new Date(),
          
          // IMPORTANT : Préserver TOUTES les relations bidirectionnelles ✅
          datesIds: entityData.datesIds || [],
          datesAssociees: entityData.datesAssociees || [],
          lieuxIds: entityData.lieuxIds || [],
          artistesIds: entityData.artistesIds || [],
          
          // Autres champs
          notes: entityData.notes || '',
          tags: entityData.tags || [],
          statut: entityData.statut || 'actif'
        };
        
        console.log('✅ Après aplatissement:', entityData);
        }
        
        // VALIDATION FINALE - entrepriseId OBLIGATOIRE
        if (!entityData.entrepriseId) {
          throw new Error('❌ entrepriseId OBLIGATOIRE pour les contacts');
        }
      }
      
      let result;
      if (customId) {
        // Création avec ID personnalisé - utiliser setDoc pour créer un nouveau document
        await setDoc(doc(db, entityType, customId), entityData);
        result = { id: customId, ...entityData };
      } else {
        // Création avec ID auto-généré
        console.log('💾 SAUVEGARDE FINALE dans Firebase:', entityType);
        console.log('💾 Structure à sauvegarder:', JSON.stringify(entityData, null, 2));
        const docRef = await addDoc(collection(db, entityType), entityData);
        result = { id: docRef.id, ...entityData };
        console.log('✅ Document créé avec ID:', docRef.id);
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
  }, [entityType, validateBeforeAction, enableLogging, autoResetError, currentEntreprise?.id]);
  
  // ✅ CORRECTION: Fonction de mise à jour stabilisée
  const update = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!id) {
        throw new Error('ID manquant pour la mise à jour');
      }
      
      let updateData = {
        ...data,
        updatedAt: new Date(),
        // Préserver l'entrepriseId existant si non fourni
        ...(currentEntreprise?.id && !data.entrepriseId && { entrepriseId: currentEntreprise.id })
      };
      
      console.log('💾💾💾 useGenericAction.js - UPDATE', entityType);
      console.log('💾 DONNÉES REÇUES POUR UPDATE:', JSON.stringify(updateData, null, 2));
      
      // LOG SPÉCIFIQUE POUR LIEUX
      if (entityType === 'lieux') {
        console.log('🏢🏢🏢 UPDATE LIEU DÉTECTÉ');
        console.log('🏢 contactIds présent ?', updateData.contactIds);
        console.log('🏢 Toutes les clés:', Object.keys(updateData));
      }
      
      // VÉRIFICATION CRITIQUE pour les contacts
      if (entityType === 'contacts') {
        // Si structure imbriquée détectée, BLOQUER
        if (updateData.contact || updateData.structure) {
          console.error('🚨🚨🚨 STRUCTURE IMBRIQUÉE DÉTECTÉE (UPDATE) - CORRECTION FORCÉE');
        console.log('🔴 Avant aplatissement UPDATE:', updateData);
        
        // Aplatir les données tout en préservant TOUS les champs pour la bidirectionnalité
        updateData = {
          // Champs contact PLATS
          nom: updateData.contact.nom || updateData.nom || '',
          prenom: updateData.contact.prenom || updateData.prenom || '',
          email: updateData.contact.email || updateData.email || '',
          telephone: updateData.contact.telephone || updateData.telephone || '',
          fonction: updateData.contact.fonction || updateData.fonction || '',
          adresse: updateData.contact.adresse || updateData.adresse || '',
          codePostal: updateData.contact.codePostal || updateData.codePostal || '',
          ville: updateData.contact.ville || updateData.ville || '',
          
          // Champs structure - IMPORTANT pour les relations
          structureId: updateData.structureId || '',
          structureNom: updateData.structureNom || updateData.structure?.nom || updateData.structure?.raisonSociale || '',
          
          // Si une structure complète est fournie, aplatir ses champs
          ...(updateData.structure ? {
            structureRaisonSociale: updateData.structure.raisonSociale || '',
            structureSiret: updateData.structure.siret || '',
            structureType: updateData.structure.type || '',
            structureAdresse: updateData.structure.adresse || '',
            structureCodePostal: updateData.structure.codePostal || '',
            structureVille: updateData.structure.ville || '',
            structurePays: updateData.structure.pays || 'France',
            structureTva: updateData.structure.tva || '',
            structureNumeroIntracommunautaire: updateData.structure.numeroIntracommunautaire || ''
          } : {}),
          
          // Champs obligatoires
          entrepriseId: updateData.entrepriseId || currentEntreprise?.id,
          updatedAt: new Date(),
          
          // IMPORTANT : Préserver TOUTES les relations bidirectionnelles ✅
          datesIds: updateData.datesIds || [],
          datesAssociees: updateData.datesAssociees || [],
          lieuxIds: updateData.lieuxIds || [],
          artistesIds: updateData.artistesIds || [],
          
          // Autres champs
          notes: updateData.notes || '',
          tags: updateData.tags || [],
          statut: updateData.statut || 'actif',
          
          // Préserver les champs existants non modifiés
          createdAt: updateData.createdAt
        };
        
        console.log('✅ Après aplatissement UPDATE:', updateData);
        }
        
        // VALIDATION FINALE - entrepriseId OBLIGATOIRE
        if (!updateData.entrepriseId) {
          console.error('⚠️ entrepriseId manquant lors de l\'UPDATE - Ajout depuis le contexte');
          updateData.entrepriseId = currentEntreprise?.id;
          if (!updateData.entrepriseId) {
            throw new Error('❌ entrepriseId OBLIGATOIRE pour les contacts');
          }
        }
      }
      
      await updateDoc(doc(db, entityType, id), updateData);
      const result = { id, ...updateData };
      
      console.log('🚀 UPDATE SUCCESS - Calling onSuccess callback');
      console.log('🚀 onSuccessRef.current exists?', !!onSuccessRef.current);
      console.log('🚀 Result:', result);
      
      if (onSuccessRef.current) {
        console.log('🚀 Executing onSuccessRef.current');
        await onSuccessRef.current(result, 'update');
        console.log('🚀 onSuccessRef.current completed');
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
  }, [entityType, enableLogging, autoResetError, currentEntreprise?.id]);
  
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
        startAfterDoc = null,
        skipOrganizationFilter = false
      } = queryConfig;
      
      if (enableLogging) {
      }
      
      // Construction de la requête
      let q = collection(db, entityType);
      const constraints = [];
      
      // 🔒 CORRECTION CRITIQUE: Ajouter automatiquement le filtre entrepriseId
      if (!skipOrganizationFilter) {
        const currentEntrepriseId = localStorage.getItem('currentEntrepriseId');
        if (currentEntrepriseId) {
          constraints.push(where('entrepriseId', '==', currentEntrepriseId));
          if (enableLogging) {
            console.log(`🔒 [useGenericAction] Filtre entrepriseId ajouté: ${currentEntrepriseId} pour ${entityType}`);
          }
        }
      }
      
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
      
      console.log(`[useGenericAction] getById ${entityType}:`, result);
      if (entityType === 'lieux') {
        console.log('[useGenericAction] contactIds dans le lieu:', result.contactIds);
      }
      
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
