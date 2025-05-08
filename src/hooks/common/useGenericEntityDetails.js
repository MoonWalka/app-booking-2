// src/hooks/common/useGenericEntityDetails.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  doc, getDoc, setDoc, deleteDoc, updateDoc, 
  collection, query, where, getDocs,
  serverTimestamp, onSnapshot
} from 'firebase/firestore';
import { db } from '@/firebaseInit';

// Compteur global pour suivre les instances
const hookInstances = {
  count: 0,
  byEntityType: {}
};

/**
 * Hook générique pour la gestion des détails d'une entité
 * Centralise les fonctionnalités de chargement, visualisation, édition et suppression
 * Optimisé pour résister aux cycles de montage/démontage
 * 
 * @param {Object} config - Configuration du hook
 * @returns {Object} États et méthodes pour gérer l'entité
 */
const useGenericEntityDetails = ({
  // Configuration de base
  entityType,                // Type d'entité (pour les logs et les messages)
  collectionName,            // Nom de la collection Firestore
  id,                        // ID de l'entité
  idField = 'id',            // Nom du champ identifiant
  initialMode = 'view',      // Mode initial ('view' ou 'edit')
  
  // Configuration des entités liées
  relatedEntities = [],      // Configuration des entités liées
  autoLoadRelated = false,    // Charger automatiquement les entités liées
  customQueries = {},        // Requêtes personnalisées pour certaines entités liées
  
  // Callbacks et transformateurs
  transformData,             // Transformation des données après chargement
  validateFormFn,            // Validation personnalisée avant sauvegarde
  formatValue,               // Formatage des valeurs pour l'affichage
  checkDeletePermission,     // Vérifier si la suppression est autorisée
  
  // Callbacks d'événements
  onSaveSuccess,             // Appelé après sauvegarde réussie
  onSaveError,               // Appelé en cas d'erreur de sauvegarde
  onDeleteSuccess,           // Appelé après suppression réussie
  onDeleteError,             // Appelé en cas d'erreur de suppression
  onModeChange,              // Appelé lors du changement de mode
  
  // Options de navigation
  navigate,                  // Fonction de navigation (optionnel)
  returnPath,                // Chemin de retour après suppression
  editPath,                  // Format de chemin d'édition
  
  // Options avancées
  additionalFields = [],     // Champs supplémentaires à charger
  skipPermissionCheck = false, // Ignorer la vérification des permissions
  realtime = false,          // Utiliser des écouteurs temps réel
  useDeleteModal = true      // Utiliser un modal pour confirmer la suppression
}) => {
  // Générer un ID d'instance unique
  hookInstances.count++;
  if (!hookInstances.byEntityType[entityType]) {
    hookInstances.byEntityType[entityType] = 0;
  }
  const instanceId = ++hookInstances.byEntityType[entityType];
  
  console.log(`[DEBUG-PROBLEME] useGenericEntityDetails #${hookInstances.count} (instance #${instanceId} pour ${entityType}:${id})`);
  
  // États de base
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États d'édition
  const [isEditing, setIsEditing] = useState(initialMode === 'edit');
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [dirtyFields, setDirtyFields] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  
  // États pour les opérations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour les entités liées
  const [relatedData, setRelatedData] = useState({});
  const [loadingRelated, setLoadingRelated] = useState({});
  
  // Référence pour les listeners Firestore et l'état de montage
  const refs = useRef({
    unsubscribe: null,
    isMounted: true,
    hasStartedFetch: false,
    requestCounter: 0,
    fetchPromise: null,
    isEntityLoaded: false,
    lastId: id,
    entityCache: {} // Cache des entités déjà chargées
  });
  
  // Mettre à jour la référence à l'ID
  if (id !== refs.current.lastId) {
    refs.current.lastId = id;
    refs.current.hasStartedFetch = false;
    refs.current.isEntityLoaded = false;
  }
  
  // Maintenir un flag de montage pour éviter les mises à jour sur des composants démontés
  useEffect(() => {
    refs.current.isMounted = true;
    
    console.log(`[DEBUG-PROBLEME] useGenericEntityDetails - composant monté #${instanceId} (${entityType}:${id})`);
    
    // Définition de l'état de montage à false lors du démontage
    return () => {
      console.log(`[DEBUG-PROBLEME] useGenericEntityDetails - composant démonté #${instanceId} (${entityType}:${id})`);
      refs.current.isMounted = false;
      // Nettoyer les écouteurs s'ils existent
      if (refs.current.unsubscribe) {
        refs.current.unsubscribe();
        refs.current.unsubscribe = null;
      }
    };
  }, [entityType, id, instanceId]);
  
  // Fonction sécurisée pour mettre à jour les états uniquement si le composant est monté
  const safeSetState = useCallback((setter, value) => {
    if (refs.current.isMounted) {
      setter(value);
    }
  }, []);
  
  // Fonction pour charger l'entité principale
  const fetchEntity = useCallback(async () => {
    // Vérifier si nous avons déjà commencé à charger cette entité
    if (refs.current.hasStartedFetch) {
      console.log(`[DEBUG-PROBLEME] fetchEntity #${instanceId}: Requête déjà en cours pour ${entityType} avec ID ${id}, ignoré`);
      if (entityType === 'programmateur') {
        console.log(`[DIAGNOSTIC] fetchEntity: Requête déjà en cours pour ${entityType} avec ID ${id}, ignoré`);
      }
      return;
    }
    
    console.log(`[DEBUG-PROBLEME] fetchEntity #${instanceId}: Début du chargement pour ${entityType} avec ID ${id}`);
    
    // Marqueur que nous avons commencé à charger
    refs.current.hasStartedFetch = true;
    refs.current.requestCounter++;
    const currentRequest = refs.current.requestCounter;
    
    // Log de diagnostic pour tracer les appels de fetch
    if (entityType === 'programmateur') {
      console.log(`[DIAGNOSTIC] fetchEntity appelé pour ${entityType} avec ID:`, id, 
                  `(Requête #${currentRequest})`);
    }
    
    if (!id) {
      if (entityType === 'programmateur') {
        console.log(`[DIAGNOSTIC] fetchEntity: ID manquant pour ${entityType}`);
      }
      safeSetState(setLoading, false);
      return;
    }
    
    // Vérifier si cette entité est dans notre cache local
    if (refs.current.entityCache[id]) {
      if (entityType === 'programmateur') {
        console.log(`[DIAGNOSTIC] fetchEntity: Utilisation du cache pour ${entityType} avec ID ${id}`);
      }
      
      const cachedData = refs.current.entityCache[id];
      safeSetState(setEntity, cachedData);
      safeSetState(setFormData, cachedData);
      
      // Même avec le cache, chargez les entités liées si nécessaire
      if (autoLoadRelated) {
        loadAllRelatedEntities(cachedData);
      }
      
      safeSetState(setLoading, false);
      refs.current.isEntityLoaded = true;
      return;
    }
    
    safeSetState(setLoading, true);
    safeSetState(setError, null);
    
    try {
      let entityData;
      
      if (realtime) {
        // Utiliser un listener temps réel
        if (entityType === 'programmateur') {
          console.log(`[DIAGNOSTIC] fetchEntity: Configuration d'un écouteur realtime pour ${entityType} ${id}`);
        }
        
        const unsubscribe = onSnapshot(doc(db, collectionName, id), (doc) => {
          // Vérifier que c'est toujours la dernière requête et que le composant est monté
          if (!refs.current.isMounted || currentRequest !== refs.current.requestCounter) {
            console.log(`[DIAGNOSTIC] fetchEntity: Ignoré (démonté ou requête périmée) pour ${entityType} ${id}`);
            return;
          }
          
          if (doc.exists()) {
            entityData = { [idField]: doc.id, ...doc.data() };
            
            if (entityType === 'programmateur') {
              console.log(`[DIAGNOSTIC] fetchEntity: Document trouvé en temps réel pour ${entityType} ${id}:`, entityData);
            }
            
            // Transformer les données si nécessaire
            if (transformData) {
              entityData = transformData(entityData);
            }
            
            // Mettre en cache
            refs.current.entityCache[id] = entityData;
            
            safeSetState(setEntity, entityData);
            safeSetState(setFormData, entityData);
            refs.current.isEntityLoaded = true;
            
            // Charger les entités liées si demandé
            if (autoLoadRelated) {
              loadAllRelatedEntities(entityData);
            }
          } else {
            if (entityType === 'programmateur') {
              console.log(`[DIAGNOSTIC] fetchEntity: Document NON trouvé en temps réel pour ${entityType} ${id}`);
            }
            safeSetState(setError, { message: `${entityType} non trouvé(e)` });
          }
          
          safeSetState(setLoading, false);
        });
        
        refs.current.unsubscribe = unsubscribe;
      } else {
        // Utiliser une requête ponctuelle
        if (entityType === 'programmateur') {
          console.log(`[DIAGNOSTIC] fetchEntity: Requête ponctuelle pour ${entityType} ${id} dans collection ${collectionName}`);
        }
        
        const entityDocRef = doc(db, collectionName, id);
        if (entityType === 'programmateur') {
          console.log(`[DIAGNOSTIC] fetchEntity: Référence du document:`, entityDocRef);
        }
        
        let fetchPromise = getDoc(entityDocRef);
        refs.current.fetchPromise = fetchPromise; // Stocker la promesse pour les annulations
        
        const entityDoc = await fetchPromise;
        
        // Vérifier que c'est toujours la dernière requête et que le composant est monté
        if (!refs.current.isMounted || refs.current.fetchPromise !== fetchPromise) {
          console.log(`[DIAGNOSTIC] fetchEntity: Ignoré (démonté ou requête annulée) pour ${entityType} ${id}`);
          return;
        }
        
        if (entityDoc.exists()) {
          entityData = { [idField]: entityDoc.id, ...entityDoc.data() };
          
          if (entityType === 'programmateur') {
            console.log(`[DIAGNOSTIC] fetchEntity: Document trouvé pour ${entityType} ${id}:`, entityData);
          }
          
          // Transformer les données si nécessaire
          if (transformData) {
            entityData = transformData(entityData);
          }
          
          // Mettre en cache
          refs.current.entityCache[id] = entityData;
          
          safeSetState(setEntity, entityData);
          safeSetState(setFormData, entityData);
          refs.current.isEntityLoaded = true;
          
          // Charger les entités liées si demandé
          if (autoLoadRelated) {
            loadAllRelatedEntities(entityData);
          }
        } else {
          if (entityType === 'programmateur') {
            console.log(`[DIAGNOSTIC] fetchEntity: Document NON trouvé pour ${entityType} ${id}`);
            // Vérification supplémentaire pour voir si l'ID semble valide
            console.log(`[DIAGNOSTIC] fetchEntity: Format de l'ID reçu:`, 
              { id, longueur: id?.length, type: typeof id });
          }
          
          safeSetState(setError, { message: `${entityType} non trouvé(e)` });
        }
        
        safeSetState(setLoading, false);
      }
    } catch (err) {
      if (entityType === 'programmateur') {
        console.error(`[DIAGNOSTIC] fetchEntity: Erreur lors du chargement de ${entityType} ${id}:`, err);
        console.error(`[DIAGNOSTIC] fetchEntity: Stack trace:`, err.stack);
      }
      console.error(`Erreur lors du chargement de l'entité ${entityType}:`, err);
      
      // Vérifier que c'est toujours la dernière requête et que le composant est monté
      if (refs.current.isMounted && currentRequest === refs.current.requestCounter) {
        safeSetState(setError, { message: `Erreur lors du chargement des données: ${err.message}` });
        safeSetState(setLoading, false);
      }
    }
  }, [id, collectionName, entityType, idField, transformData, autoLoadRelated, realtime, safeSetState, instanceId]);

  // Fonction pour réessayer en cas d'erreur, avec gestion des retries limités
  const retryFetch = useCallback(() => {
    if (entityType === 'programmateur') {
      console.log(`[DIAGNOSTIC] Nouvelle tentative de chargement pour ${entityType} ${id}`);
    }
    
    // Réinitialiser les flags pour permettre une nouvelle tentative
    refs.current.hasStartedFetch = false;
    refs.current.isEntityLoaded = false;
    
    // Réessayer de charger l'entité
    fetchEntity();
  }, [fetchEntity, entityType, id]);
  
  // Chargement initial de l'entité
  useEffect(() => {
    console.log(`[DEBUG-PROBLEME] useEffect pour chargement initial #${instanceId} (${entityType}:${id})`);
    
    if (entityType === 'programmateur') {
      console.log(`[DIAGNOSTIC] useEffect pour chargement initial de ${entityType} avec ID:`, id);
    }
    
    fetchEntity();
    
    // Nettoyage automatique lors des démontages
    return () => {
      console.log(`[DEBUG-PROBLEME] Nettoyage de l'effet pour #${instanceId} (${entityType}:${id})`);
      
      if (entityType === 'programmateur') {
        console.log(`[DIAGNOSTIC] Nettoyage de l'effet pour ${entityType} avec ID:`, id);
      }
    };
  }, [fetchEntity, entityType, id, instanceId]);
  
  // Fonction pour charger toutes les entités liées
  const loadAllRelatedEntities = useCallback(async (entityData) => {
    console.log(`[DEBUG] loadAllRelatedEntities appelé pour ${entityType} avec ID: ${id}`, {
      timestamp: new Date().toISOString(),
      caller: new Error().stack.split('\n')[2].trim(),
      entityId: entityData?.[idField],
      relatedEntitiesCount: relatedEntities?.length || 0
    });
    
    // Protection contre les appels multiples trop rapprochés
    const now = Date.now();
    if (!refs.current.lastLoadRelatedCall) {
      refs.current.lastLoadRelatedCall = now;
    } else if (now - refs.current.lastLoadRelatedCall < 300) { // 300ms minimum entre les appels
      console.log(`[DEBUG] loadAllRelatedEntities ignoré - appel trop rapproché (${now - refs.current.lastLoadRelatedCall}ms)`);
      return;
    }
    refs.current.lastLoadRelatedCall = now;
    
    if (!relatedEntities || relatedEntities.length === 0) return;
    if (!refs.current.isMounted) return;
    
    // Initialiser les états de chargement
    const loadingStates = {};
    relatedEntities.forEach(rel => {
      loadingStates[rel.name] = true;
    });
    safeSetState(setLoadingRelated, loadingStates);
    
    // Créer un objet pour stocker les entités liées
    const relatedEntitiesData = {};
    
    // Charger chaque entité liée
    const promises = relatedEntities.map(async relatedEntity => {
      try {
        const data = await loadRelatedEntity(relatedEntity, entityData);
        relatedEntitiesData[relatedEntity.name] = data;
      } catch (err) {
        console.error(`Erreur lors du chargement de l'entité liée ${relatedEntity.name}:`, err);
        relatedEntitiesData[relatedEntity.name] = null;
      } finally {
        if (refs.current.isMounted) {
          safeSetState(setLoadingRelated, prev => ({
            ...prev,
            [relatedEntity.name]: false
          }));
        }
      }
    });
    
    await Promise.all(promises);
    if (refs.current.isMounted) {
      safeSetState(setRelatedData, relatedEntitiesData);
    }
  }, [relatedEntities, safeSetState]);
  
  // Fonction pour charger une entité liée spécifique
  const loadRelatedEntity = useCallback(async (relatedConfig, entityData) => {
    const { name, collection: relatedCollection, idField: relatedIdField, type = 'one-to-one' } = relatedConfig;
    
    // Si l'identifiant de l'entité liée n'existe pas dans l'entité principale, retourner null
    if (!entityData[relatedIdField]) {
      return type === 'one-to-many' ? [] : null;
    }
    
    // Définir l'état de chargement
    safeSetState(setLoadingRelated, prev => ({ ...prev, [name]: true }));
    
    try {
      let result;
      
      // Vérifier s'il y a une requête personnalisée pour cette entité
      if (customQueries && customQueries[name]) {
        const customQuery = customQueries[name];
        const queryResult = await customQuery(entityData);
        result = queryResult;
      } else if (type === 'one-to-many') {
        // Charger plusieurs entités liées
        const ids = Array.isArray(entityData[relatedIdField]) 
          ? entityData[relatedIdField] 
          : [entityData[relatedIdField]];
        
        if (ids.length === 0) {
          result = [];
        } else {
          const q = query(
            collection(db, relatedCollection),
            where(idField, 'in', ids)
          );
          
          const querySnapshot = await getDocs(q);
          result = querySnapshot.docs.map(doc => ({
            [idField]: doc.id,
            ...doc.data()
          }));
        }
      } else {
        // Charger une seule entité liée
        const relatedId = entityData[relatedIdField];
        const relatedDoc = await getDoc(doc(db, relatedCollection, relatedId));
        
        if (relatedDoc.exists()) {
          result = { [idField]: relatedDoc.id, ...relatedDoc.data() };
        } else {
          result = null;
        }
      }
      
      return result;
    } catch (err) {
      console.error(`Erreur lors du chargement de l'entité liée ${name}:`, err);
      throw err;
    } finally {
      safeSetState(setLoadingRelated, prev => ({ ...prev, [name]: false }));
    }
  }, [customQueries, idField, safeSetState]);
  
  // Fonction pour charger une entité liée par son ID
  const loadRelatedEntityById = useCallback(async (name, id) => {
    if (!id) return;
    
    // Trouver la configuration de cette entité liée
    const relatedConfig = relatedEntities.find(rel => rel.name === name);
    if (!relatedConfig) {
      console.error(`Configuration pour l'entité liée ${name} non trouvée`);
      return;
    }
    
    // Définir l'état de chargement
    safeSetState(setLoadingRelated, prev => ({ ...prev, [name]: true }));
    
    try {
      // Charger l'entité liée
      const relatedDoc = await getDoc(doc(db, relatedConfig.collection, id));
      
      if (relatedDoc.exists()) {
        const data = { [idField]: relatedDoc.id, ...relatedDoc.data() };
        
        // Mettre à jour l'état
        safeSetState(setRelatedData, prev => ({
          ...prev,
          [name]: data
        }));
        
        return data;
      } else {
        safeSetState(setRelatedData, prev => ({
          ...prev,
          [name]: null
        }));
        
        return null;
      }
    } catch (err) {
      console.error(`Erreur lors du chargement de l'entité liée ${name}:`, err);
      return null;
    } finally {
      safeSetState(setLoadingRelated, prev => ({ ...prev, [name]: false }));
    }
  }, [relatedEntities, idField, safeSetState]);
  
  // Fonction pour basculer entre les modes d'édition
  const toggleEditMode = useCallback(() => {
    if (isEditing) {
      // Quitter le mode édition
      setFormData(entity || {});
      setFormErrors({});
      setDirtyFields([]);
      setIsDirty(false);
      setIsEditing(false);
      
      // Appeler le callback si fourni
      if (onModeChange) {
        onModeChange('view');
      }
    } else {
      // Passer en mode édition
      setIsEditing(true);
      
      // Appeler le callback si fourni
      if (onModeChange) {
        onModeChange('edit');
      }
    }
  }, [isEditing, entity, onModeChange]);
  
  // Gestionnaire de changements pour les champs du formulaire
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Gérer les champs imbriqués (par exemple: contact.email)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value
        }
      }));
    } else {
      // Champ simple
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Marquer le champ comme modifié
    if (!dirtyFields.includes(name)) {
      setDirtyFields(prev => [...prev, name]);
    }
    
    // Marquer le formulaire comme modifié
    setIsDirty(true);
    
    // Effacer l'erreur pour ce champ si elle existe
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [dirtyFields, formErrors]);
  
  // Fonction pour valider le formulaire
  const validateForm = useCallback(() => {
    // Réinitialiser les erreurs
    setFormErrors({});
    
    // Utiliser la fonction de validation personnalisée si fournie
    if (validateFormFn) {
      const result = validateFormFn(formData);
      
      if (!result.isValid) {
        setFormErrors(result.errors || {});
        return false;
      }
    }
    
    return true;
  }, [formData, validateFormFn]);
  
  // Fonction pour soumettre les modifications
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // Valider le formulaire
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Préparer les données à sauvegarder
      const dataToSave = {
        ...formData,
        updatedAt: serverTimestamp()
      };
      
      // Mettre à jour le document dans Firestore
      await updateDoc(doc(db, collectionName, id), dataToSave);
      
      // Mettre à jour l'état local
      setEntity(dataToSave);
      setIsDirty(false);
      setDirtyFields([]);
      setIsEditing(false);
      
      // Appeler le callback si fourni
      if (onSaveSuccess) {
        onSaveSuccess(dataToSave);
      }
    } catch (err) {
      console.error(`Erreur lors de la sauvegarde de ${entityType}:`, err);
      
      // Appeler le callback d'erreur si fourni
      if (onSaveError) {
        onSaveError(err);
      } else {
        setError({ message: `Erreur lors de la sauvegarde: ${err.message}` });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [id, formData, validateForm, entityType, collectionName, onSaveSuccess, onSaveError]);
  
  // Fonction pour supprimer l'entité
  const handleDelete = useCallback(() => {
    if (useDeleteModal) {
      setShowDeleteModal(true);
    } else {
      handleConfirmDelete();
    }
  }, [useDeleteModal]);
  
  // Fonction pour annuler la suppression (fermer le modal)
  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
  }, []);
  
  // Fonction pour confirmer et exécuter la suppression
  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    
    try {
      // Vérifier si l'entité peut être supprimée
      if (checkDeletePermission && !skipPermissionCheck) {
        const canDelete = await checkDeletePermission(id);
        
        if (!canDelete) {
          throw new Error(`Impossible de supprimer ce ${entityType} car il est utilisé ailleurs.`);
        }
      }
      
      // Supprimer le document dans Firestore
      await deleteDoc(doc(db, collectionName, id));
      
      // Fermer le modal
      setShowDeleteModal(false);
      
      // Appeler le callback si fourni
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      
      // Naviguer vers la page de retour si spécifiée
      if (navigate && returnPath) {
        navigate(returnPath);
      }
    } catch (err) {
      console.error(`Erreur lors de la suppression de ${entityType}:`, err);
      
      // Fermer le modal
      setShowDeleteModal(false);
      
      // Appeler le callback d'erreur si fourni
      if (onDeleteError) {
        onDeleteError(err);
      } else {
        setError({ message: `Erreur lors de la suppression: ${err.message}` });
      }
    } finally {
      setIsDeleting(false);
    }
  }, [id, checkDeletePermission, skipPermissionCheck, collectionName, entityType, onDeleteSuccess, onDeleteError, navigate, returnPath]);
  
  // Fonction pour rafraîchir les données
  const refresh = useCallback(() => {
    fetchEntity();
  }, [fetchEntity]);
  
  // Fonction pour définir une entité liée
  const setRelatedEntity = useCallback((name, entity) => {
    const relatedConfig = relatedEntities.find(rel => rel.name === name);
    if (!relatedConfig) {
      console.error(`Configuration de l'entité liée ${name} non trouvée`);
      return;
    }
    
    // Mettre à jour les données du formulaire
    setFormData(prev => ({
      ...prev,
      [relatedConfig.idField]: entity ? entity.id : null
    }));
    
    // Mettre à jour les données liées
    setRelatedData(prev => ({
      ...prev,
      [name]: entity
    }));
    
    // Marquer le formulaire comme modifié
    setIsDirty(true);
  }, [relatedEntities]);
  
  // Fonction pour supprimer une entité liée
  const removeRelatedEntity = useCallback((name) => {
    const relatedConfig = relatedEntities.find(rel => rel.name === name);
    if (!relatedConfig) {
      console.error(`Configuration de l'entité liée ${name} non trouvée`);
      return;
    }
    
    // Mettre à jour les données du formulaire
    setFormData(prev => ({
      ...prev,
      [relatedConfig.idField]: null
    }));
    
    // Mettre à jour les données liées
    setRelatedData(prev => ({
      ...prev,
      [name]: null
    }));
    
    // Marquer le formulaire comme modifié
    setIsDirty(true);
  }, [relatedEntities]);
  
  // Fonction pour récupérer l'ID d'une entité liée
  const getRelatedEntityId = useCallback((name) => {
    const relatedConfig = relatedEntities.find(rel => rel.name === name);
    if (!relatedConfig || !formData) {
      return null;
    }
    
    return formData[relatedConfig.idField];
  }, [relatedEntities, formData]);
  
  // Fonction pour récupérer le nom d'une entité liée
  const getRelatedEntityName = useCallback((name) => {
    const entity = relatedData[name];
    if (!entity) {
      return '';
    }
    
    // Essayer d'utiliser un champ standard pour le nom
    for (const field of ['nom', 'name', 'title', 'label']) {
      if (entity[field]) {
        return entity[field];
      }
    }
    
    // Par défaut, retourner l'ID
    return entity.id;
  }, [relatedData]);
  
  // Fonction pour formater les valeurs pour l'affichage
  const formatDisplayValue = useCallback((field, value) => {
    if (formatValue) {
      return formatValue(field, value);
    }
    
    // Formatage par défaut
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    return String(value);
  }, [formatValue]);
  
  // Fonction pour naviguer vers une entité liée
  const navigateToRelated = useCallback((name, id) => {
    if (!navigate) return;
    
    const relatedConfig = relatedEntities.find(rel => rel.name === name);
    if (!relatedConfig) {
      console.error(`Configuration de l'entité liée ${name} non trouvée`);
      return;
    }
    
    const path = `/${relatedConfig.collection}/${id}`;
    navigate(path);
  }, [navigate, relatedEntities]);
  
  // Fonction pour naviguer vers la route d'édition
  const navigateToEdit = useCallback(() => {
    if (!navigate || !editPath || !id) return;
    
    const path = editPath.replace(':id', id);
    navigate(path);
  }, [navigate, editPath, id]);
  
  // Fonction pour naviguer vers la liste des entités
  const navigateToList = useCallback(() => {
    if (!navigate) return;
    
    const path = `/${collectionName}`;
    navigate(path);
  }, [navigate, collectionName]);
  
  // Retourner l'API du hook avec la fonction de réessai
  return {
    // Données et état
    entity,
    loading,
    error,
    relatedData,
    loadingRelated,
    
    // États d'édition et formulaire
    isEditing,
    formData,
    isDirty,
    dirtyFields,
    errors: formErrors,
    
    // États d'opérations
    isSubmitting,
    isDeleting,
    showDeleteModal,
    
    // Actions de base
    toggleEditMode,
    handleChange,
    handleSubmit,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
    
    // Gestion des entités liées
    loadRelatedEntity: loadRelatedEntityById,
    setRelatedEntity,
    removeRelatedEntity,
    getRelatedEntityId,
    getRelatedEntityName,
    
    // Utilitaires et navigation
    refresh,
    retryFetch, // Nouvelle fonction pour réessayer en cas d'erreur
    formatDisplayValue,
    navigateToRelated,
    navigateToEdit,
    navigateToList,
    validateForm
  };
};

export default useGenericEntityDetails;