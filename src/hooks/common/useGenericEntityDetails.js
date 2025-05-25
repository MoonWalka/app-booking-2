// src/hooks/common/useGenericEntityDetails.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  doc, getDoc, deleteDoc, updateDoc, 
  serverTimestamp 
} from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { debugLog } from '@/utils/logUtils';
import useCache from './useCache';
import useFirestoreSubscription from './useFirestoreSubscription';
import InstanceTracker from '@/services/InstanceTracker';

/**
 * Hook générique pour la gestion des détails d'une entité
 * Version améliorée avec gestion de cache centralisée et abonnements Firestore sécurisés
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
  autoLoadRelated = false,   // Charger automatiquement les entités liées
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
  useDeleteModal = true,     // Utiliser un modal pour confirmer la suppression
  
  // Options de cache
  cacheEnabled = true,       // Activer le cache pour ce hook
  cacheTTL                   // TTL personnalisé pour ce hook (en ms)
}) => {
  // debugLog('Hook exécuté !', 'trace', 'useGenericEntityDetails');
  // console.log('useGenericEntityDetails args:', { entityType, collectionName, id });
  
  // Enregistrer l'instance avec le tracker à la place de la variable globale
  const instanceRef = useRef({
    ...InstanceTracker.register(entityType, { id, collectionName, realtime }),
    isMounted: true,
    currentlyFetching: false,
    activeAbortController: null,
    lastId: null
  });
  
  // Logger uniquement l'initialisation du hook
  debugLog(`useGenericEntityDetails #${instanceRef.current.instanceNumber} initialisé pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
  
  // États de base
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Ajout d'un flag pour éviter les boucles infinies de chargement
  const hasFetchedRef = useRef(false);
  
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
  
  // Utiliser le hook de cache
  const cache = useCache(entityType, {
    enabled: cacheEnabled,
    ttl: cacheTTL,
    invalidateOnUnmount: false // Ne pas invalider automatiquement au démontage
  });
  
  // Fonction sécurisée pour mettre à jour les états uniquement si le composant est monté
  const safeSetState = useCallback((setter, value) => {
    if (instanceRef.current.isMounted) {
      setter(value);
    }
  }, []);
  
  debugLog(`Appel du hook avec : ${entityType}, ${collectionName}, ${id}, realtime=${realtime}, cache=${cacheEnabled}`, 'debug', 'useGenericEntityDetails');
  
  // Réinitialisation complète lors d'un changement d'ID
  useEffect(() => {
    // Ajout log pour traquer les changements d'ID
    console.log('[LOG useEffect:id/entityType] Nouvelle valeur id:', id, 'entityType:', entityType);
    // Si l'ID change, on doit réinitialiser tous les états
    if (instanceRef.current.lastId !== id) {
      // Annuler les requêtes en cours
      if (instanceRef.current.activeAbortController) {
        instanceRef.current.activeAbortController.abort();
        instanceRef.current.activeAbortController = null;
      }
      
      // Réinitialiser les états
      safeSetState(setLoading, true);
      safeSetState(setError, null);
      safeSetState(setEntity, null);
      safeSetState(setFormData, {});
      
      // Marquer l'ID comme traité
      instanceRef.current.lastId = id;
      instanceRef.current.currentlyFetching = false;
      
      // Mettre à jour les métadonnées dans le tracker
      InstanceTracker.updateMetadata(instanceRef.current.instanceId, { 
        id, state: 'id-changed', collectionName, entityType 
      });
      
      debugLog(`Réinitialisation des états pour nouvel ID: ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
    }
  }, [id, entityType, collectionName, safeSetState]);
  
  // Callback pour recevoir les données de l'abonnement Firestore
  const handleSubscriptionData = useCallback((data) => {
    if (!instanceRef.current.isMounted) return;
    
    if (data) {
      // Transformer les données si nécessaire
      const transformedData = transformData ? transformData(data) : data;
      
      // Mettre en cache si le cache est activé
      if (cacheEnabled) {
        cache.set(id, transformedData);
      }
      
      safeSetState(setEntity, transformedData);
      debugLog(`DEBUG useGenericEntityDetails - entity mis à jour par subscription : ${JSON.stringify(transformedData)}`, 'debug', 'useGenericEntityDetails');
      safeSetState(setFormData, transformedData);
      safeSetState(setLoading, false);
      
      // Charger les entités liées si demandé
      if (autoLoadRelated) {
        loadAllRelatedEntities(transformedData);
      }
    } else {
      safeSetState(setError, { message: `${entityType} non trouvé(e)` });
      safeSetState(setLoading, false);
    }
    // loadAllRelatedEntities est stable grâce à useCallback, exemption pour éviter dépendance circulaire
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformData, cacheEnabled, cache, id, entityType, autoLoadRelated, safeSetState]);
  
  // Callback pour gérer les erreurs de l'abonnement
  const handleSubscriptionError = useCallback((err) => {
    if (!instanceRef.current.isMounted) return;
    safeSetState(setError, { message: `Erreur lors du chargement des données: ${err.message}` });
    safeSetState(setLoading, false);
  }, [safeSetState]);
  
  // Utiliser le hook d'abonnement Firestore si le mode realtime est activé
  const subscription = useFirestoreSubscription({
    collectionName,
    id,
    onData: handleSubscriptionData,
    onError: handleSubscriptionError,
    enabled: realtime && !!id,
    transform: transformData
  });
  
  // Fonction pour charger l'entité principale - simplifiée grâce au hook d'abonnement
  const fetchEntity = useCallback(async () => {
    console.log('Entrée dans fetchEntity');
    debugLog(`fetchEntity appelé pour ${entityType}:${id}`, 'debug', 'useGenericEntityDetails');
    
    // Si le mode realtime est activé et que l'abonnement est actif, ne rien faire
    if (realtime) {
      return;
    }
    
    // Protection contre les appels multiples simultanés
    if (instanceRef.current.currentlyFetching) {
      debugLog(`Requête déjà en cours pour ${entityType}:${id}, ignoré`, 'info', 'useGenericEntityDetails');
      return;
    }
    
    // Si pas d'ID, ne pas essayer de charger
    if (!id) {
      safeSetState(setLoading, false);
      safeSetState(setError, { message: "Pas d'identifiant fourni" });
      return;
    }
    
    // Vérifier le cache si activé
    if (cacheEnabled) {
      const cachedData = cache.get(id);
      if (cachedData) {
        debugLog(`Utilisation du cache pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
        safeSetState(setEntity, cachedData);
        safeSetState(setFormData, cachedData);
        safeSetState(setLoading, false);
        
        // Charger les entités liées si demandé, même avec un cache hit
        if (autoLoadRelated) {
          loadAllRelatedEntities(cachedData);
        }
        
        return;
      }
    }
    
    // Marquer comme en cours de chargement
    instanceRef.current.currentlyFetching = true;
    safeSetState(setLoading, true);
    safeSetState(setError, null);
    
    try {
      // Annuler les requêtes précédentes
      if (instanceRef.current.activeAbortController) {
        instanceRef.current.activeAbortController.abort();
      }
      
      // Créer un nouveau AbortController
      const abortController = new AbortController();
      instanceRef.current.activeAbortController = abortController;
      
      debugLog(`Requête ponctuelle pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
      
      const entityDocRef = doc(db, collectionName, id);
      
      // Utiliser la méthode native pour annuler les requêtes Firestore
      const entityDoc = await getDoc(entityDocRef);
      debugLog(`getDoc terminé pour ${entityType}:${id}, exists: ${entityDoc.exists()}`, 'debug', 'useGenericEntityDetails');
      
      // Vérifier si la requête a été annulée
      if (abortController.signal.aborted) {
        debugLog(`Requête annulée pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
        return;
      }
      
      // Vérifier que le composant est toujours monté
      if (!instanceRef.current.isMounted) {
        return;
      }
      
      debugLog(`Avant fetchEntity: isMounted=${instanceRef.current.isMounted}`, 'debug', 'useGenericEntityDetails');

      if (entityDoc.exists()) {
        const entityData = { [idField]: entityDoc.id, ...entityDoc.data() };
        
        // Transformer les données si une fonction de transformation est fournie
        const transformedData = transformData ? transformData(entityData) : entityData;
        
        // Log avant safeSetState pour confirmer l'exécution
        console.log('[DEBUG] Avant safeSetState dans fetchEntity:', transformedData);

        // Mettre en cache si le cache est activé
        if (cacheEnabled) {
          cache.set(id, transformedData);
        }
        
        safeSetState(setEntity, transformedData);
        debugLog(`DEBUG useGenericEntityDetails - entity mis à jour par fetchEntity : ${JSON.stringify(transformedData)}`, 'debug', 'useGenericEntityDetails');
        safeSetState(setFormData, transformedData);
        
        // Charger les entités liées si demandé
        if (autoLoadRelated) {
          loadAllRelatedEntities(transformedData);
        }
      } else {
        safeSetState(setError, { message: `${entityType} non trouvé(e)` });
      }
      
      safeSetState(setLoading, false);
      instanceRef.current.currentlyFetching = false;
      instanceRef.current.activeAbortController = null;
    } catch (err) {
      debugLog(`Erreur dans fetchEntity pour ${entityType}:${id}: ${err}`, 'error', 'useGenericEntityDetails');
      // Ne pas traiter les erreurs si le composant est démonté ou si la requête a été annulée
      if (!instanceRef.current.isMounted || (instanceRef.current.activeAbortController && instanceRef.current.activeAbortController.signal.aborted)) {
        return;
      }
      
      safeSetState(setError, { message: `Erreur lors du chargement des données: ${err.message}` });
      safeSetState(setLoading, false);
      instanceRef.current.currentlyFetching = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, collectionName, entityType, idField, transformData, autoLoadRelated, realtime, safeSetState, cacheEnabled, cache]);
  
  // Fonction pour charger toutes les entités liées
  const loadAllRelatedEntities = useCallback(async (entityData) => {
    if (!instanceRef.current.isMounted) return;
    if (!relatedEntities || relatedEntities.length === 0) return;
    if (!entityData) return;
    
    debugLog(`Chargement des entités liées pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
    
    // Initialiser les états de chargement
    const loadingStates = {};
    relatedEntities.forEach(rel => {
      loadingStates[rel.name] = true;
    });
    safeSetState(setLoadingRelated, loadingStates);
    
    // Créer un objet pour stocker les entités liées
    const relatedEntitiesData = {};
    
    // Identifier les entités liées essentielles vs non essentielles
    const essentialEntities = relatedEntities.filter(rel => rel.essential === true);
    const nonEssentialEntities = relatedEntities.filter(rel => rel.essential !== true);
    
    try {
      // Charger d'abord les entités essentielles en parallèle (si configurées comme telles)
      if (essentialEntities.length > 0) {
        const essentialResults = await Promise.all(
          essentialEntities.map(async (relatedEntity) => {
            try {
              const data = await loadRelatedEntity(relatedEntity, entityData);
              return { name: relatedEntity.name, data };
            } catch (err) {
              debugLog(`Erreur lors du chargement de l'entité liée ${relatedEntity.name}: ${err}`, 'error', 'useGenericEntityDetails');
              return { name: relatedEntity.name, data: null };
            }
          })
        );
        
        // Traiter les résultats des entités essentielles
        essentialResults.forEach(({ name, data }) => {
          relatedEntitiesData[name] = data;
          
          // Mettre en cache si activé et si les données sont présentes
          if (cacheEnabled && data) {
            if (Array.isArray(data)) {
              data.forEach(item => {
                if (item && item.id) {
                  cache.set(`related:${name}:${item.id}`, item);
                }
              });
            } else if (data && data.id) {
              cache.set(`related:${name}:${data.id}`, data);
            }
          }
          
          // Marquer comme chargé
          loadingStates[name] = false;
        });
        
        // Mettre à jour l'état avec les entités essentielles
        if (instanceRef.current.isMounted) {
          safeSetState(setRelatedData, relatedEntitiesData);
          safeSetState(setLoadingRelated, {...loadingStates});
        }
      }
      
      // Pour les entités non essentielles, charger avec un délai ou lors d'une action utilisateur
      if (nonEssentialEntities.length > 0) {
        // Désactiver le chargement automatique des entités non essentielles au montage initial
        // Elles seront chargées à la demande par loadRelatedEntityById
        nonEssentialEntities.forEach(rel => {
          loadingStates[rel.name] = false;
        });
        
        // Mettre à jour les états de chargement
        if (instanceRef.current.isMounted) {
          safeSetState(setLoadingRelated, loadingStates);
        }
      }
    } catch (err) {
      debugLog(`Erreur globale lors du chargement des entités liées: ${err}`, 'error', 'useGenericEntityDetails');
    }
    // loadRelatedEntity est stable grâce à useCallback, exemption pour éviter dépendance circulaire
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedEntities, entityType, id, safeSetState, cacheEnabled, cache]);
  
  // Fonction pour charger une entité liée spécifique
  const loadRelatedEntity = useCallback(async (relatedConfig, entityData) => {
    const { name, collection: relatedCollection, idField: relatedIdField, type = 'one-to-one' } = relatedConfig;
    
    // Si l'identifiant de l'entité liée n'existe pas dans l'entité principale, retourner null
    if (!entityData[relatedIdField]) {
      return type === 'one-to-many' ? [] : null;
    }
    
    try {
      let result;
      
      // Vérifier s'il y a une requête personnalisée pour cette entité
      if (customQueries && customQueries[name]) {
        const customQuery = customQueries[name];
        const queryResult = await customQuery(entityData);
        result = queryResult;
      } else if (type === 'one-to-many') {
        // Charger plusieurs entités liées
        const relatedIds = Array.isArray(entityData[relatedIdField]) 
          ? entityData[relatedIdField]
          : [entityData[relatedIdField]];
          
        // Vérifier le cache d'abord
        const cachedResults = [];
        let allCached = true;
        
        if (cacheEnabled) {
          for (const relId of relatedIds) {
            const cachedItem = cache.get(`related:${name}:${relId}`);
            if (cachedItem) {
              cachedResults.push(cachedItem);
            } else {
              allCached = false;
              break;
            }
          }
        } else {
          allCached = false;
        }
        
        // Si tous les éléments sont en cache, les utiliser
        if (allCached && cachedResults.length > 0) {
          result = cachedResults;
        } else {
          // Sinon, charger depuis Firestore
          const relatedDocs = await Promise.all(
            relatedIds.map(relId => getDoc(doc(db, relatedCollection, relId)))
          );
          result = relatedDocs
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } else {
        // Charger une seule entité liée
        const relatedId = entityData[relatedIdField];
        
        // Vérifier le cache d'abord
        if (cacheEnabled) {
          const cachedItem = cache.get(`related:${name}:${relatedId}`);
          if (cachedItem) {
            result = cachedItem;
            return result;
          }
        }
        
        // Si pas en cache, charger depuis Firestore
        const relatedDoc = await getDoc(doc(db, relatedCollection, relatedId));
        if (relatedDoc.exists()) {
          result = { id: relatedDoc.id, ...relatedDoc.data() };
        } else {
          result = null;
        }
      }
      
      return result;
    } catch (err) {
      debugLog(`Erreur lors du chargement de l'entité liée ${name}: ${err}`, 'error', 'useGenericEntityDetails');
      throw err;
    }
  }, [customQueries, cacheEnabled, cache]);
  
  // Fonction pour charger une entité liée par son ID
  const loadRelatedEntityById = useCallback(async (name, id) => {
    if (!id) return null;
    
    // Trouver la configuration de cette entité liée
    const relatedConfig = relatedEntities.find(rel => rel.name === name);
    if (!relatedConfig) {
      debugLog(`Configuration pour l'entité liée ${name} non trouvée`, 'error', 'useGenericEntityDetails');
      return null;
    }
    
    // Définir l'état de chargement
    safeSetState(setLoadingRelated, prev => ({ ...prev, [name]: true }));
    
    try {
      // Essayer d'abord de récupérer depuis le cache global
      if (cacheEnabled) {
        const cachedRelated = cache.get(`related:${name}:${id}`);
        if (cachedRelated) {
          safeSetState(setRelatedData, prev => ({
            ...prev,
            [name]: cachedRelated
          }));
          return cachedRelated;
        }
      }
      
      // Charger l'entité liée
      const relatedDoc = await getDoc(doc(db, relatedConfig.collection, id));
      
      if (relatedDoc.exists()) {
        const data = { id: relatedDoc.id, ...relatedDoc.data() };
        
        // Mettre à jour l'état
        safeSetState(setRelatedData, prev => ({
          ...prev,
          [name]: data
        }));
        
        // Mettre en cache si activé
        if (cacheEnabled) {
          cache.set(`related:${name}:${id}`, data);
        }
        
        return data;
      } else {
        safeSetState(setRelatedData, prev => ({
          ...prev,
          [name]: null
        }));
        return null;
      }
    } catch (err) {
      debugLog(`Erreur lors du chargement de l'entité liée ${name}: ${err}`, 'error', 'useGenericEntityDetails');
      return null;
    } finally {
      safeSetState(setLoadingRelated, prev => ({ ...prev, [name]: false }));
    }
  }, [relatedEntities, safeSetState, cacheEnabled, cache]);
  
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
          ...prev[parent],
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
      const updatedEntity = { 
        ...dataToSave, 
        id,
        updatedAt: new Date() // Pour avoir une valeur immédiate côté client
      };
      
      setEntity(updatedEntity);
      
      // Mise à jour du cache pour refléter les changements
      if (cacheEnabled) {
        cache.set(id, updatedEntity);
      }
      
      setIsDirty(false);
      setDirtyFields([]);
      setIsEditing(false);
      
      // Appeler le callback si fourni
      if (onSaveSuccess) {
        onSaveSuccess(updatedEntity);
      }
    } catch (err) {
      debugLog(`Erreur lors de la sauvegarde de ${entityType}: ${err}`, 'error', 'useGenericEntityDetails');
      
      // Appeler le callback d'erreur si fourni
      if (onSaveError) {
        onSaveError(err);
      } else {
        setError({ message: `Erreur lors de la sauvegarde: ${err.message}` });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [id, formData, validateForm, entityType, collectionName, onSaveSuccess, onSaveError, cacheEnabled, cache]);
  
  // Fonction pour confirmer et exécuter la suppression
  const handleConfirmDelete = useCallback(async () => {
    console.log('[LOG][useGenericEntityDetails] handleConfirmDelete appelé');
    setIsDeleting(true);
    try {
      // Vérifier si l'entité peut être supprimée
      if (checkDeletePermission && !skipPermissionCheck) {
        const canDelete = await checkDeletePermission(entity);
        if (!canDelete) {
          throw new Error(`${entityType} ne peut pas être supprimé(e) car il/elle est utilisé(e) par d'autres entités.`);
        }
      }
      
      // Supprimer le document dans Firestore
      await deleteDoc(doc(db, collectionName, id));
      
      // Supprimer du cache si le cache est activé
      if (cacheEnabled) {
        cache.remove(id);
        
        // Supprimer également les entités liées du cache
        for (const rel of relatedEntities) {
          const relatedId = entity?.[rel.idField];
          if (relatedId) {
            if (Array.isArray(relatedId)) {
              relatedId.forEach(rid => cache.remove(`related:${rel.name}:${rid}`));
            } else {
              cache.remove(`related:${rel.name}:${relatedId}`);
            }
          }
        }
      }
      
      // Fermer le modal
      console.log('[LOG][useGenericEntityDetails] setShowDeleteModal(false) après suppression');
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
      debugLog(`Erreur lors de la suppression de ${entityType}: ${err}`, 'error', 'useGenericEntityDetails');
      
      // Fermer le modal
      console.log('[LOG][useGenericEntityDetails] setShowDeleteModal(false) après erreur');
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
  }, [id, entity, checkDeletePermission, skipPermissionCheck, collectionName, entityType, onDeleteSuccess, onDeleteError, navigate, returnPath, cacheEnabled, cache, relatedEntities]);
  
  // Fonction pour annuler la suppression (fermer le modal)
  const handleCancelDelete = useCallback(() => {
    console.log('[LOG][useGenericEntityDetails] handleCancelDelete appelé, setShowDeleteModal(false)');
    setShowDeleteModal(false);
  }, []);
  
  // Fonction pour déclencher le processus de suppression
  const handleDelete = useCallback(() => {
    console.log('[LOG][useGenericEntityDetails] handleDelete appelé, useDeleteModal:', useDeleteModal);
    if (useDeleteModal) {
      console.log('[LOG][useGenericEntityDetails] setShowDeleteModal(true)');
      setShowDeleteModal(true);
    } else {
      handleConfirmDelete();
    }
  }, [useDeleteModal, handleConfirmDelete]);
  
  // Fonction pour rafraîchir les données
  const refresh = useCallback(() => {
    // Invalider le cache pour cette entité
    if (cacheEnabled) {
      cache.remove(id);
    }
    
    // Si en mode temps réel, rafraîchir l'abonnement
    if (realtime) {
      subscription.refresh();
    } else {
      // Réinitialiser le flag de chargement et recharger l'entité
      instanceRef.current.currentlyFetching = false;
      fetchEntity();
    }
  }, [fetchEntity, id, cacheEnabled, cache, realtime, subscription]);
  
  // Fonction pour réessayer en cas d'erreur
  const retryFetch = useCallback(() => {
    debugLog(`Nouvelle tentative de chargement pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
    
    // Effacer le cache pour cette entité
    if (cacheEnabled) {
      cache.remove(id);
    }
    
    // Réinitialiser les erreurs et recharger
    safeSetState(setError, null);
    refresh();
  }, [entityType, id, safeSetState, cacheEnabled, cache, refresh]);
  
  // Chargement initial de l'entité
  useEffect(() => {
    // Ajout log pour traquer les appels de chargement initial
    console.log('[LOG useEffect:chargement initial] id:', id, 'entityType:', entityType);
    // Ne pas charger si pas d'ID ou si déjà fetché
    if (!id || hasFetchedRef.current) return;
    debugLog(`Chargement initial pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
    // Si en mode temps réel, l'abonnement se charge du chargement initial
    if (!realtime) {
      fetchEntity().then(() => {
        hasFetchedRef.current = true;
      });
    }
  }, [fetchEntity, entityType, id, realtime]);
  // Remettre à zéro le flag si l'ID change
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [id]);
  
  // Gestion des derniers nettoyages au démontage
  useEffect(() => {
    // Capturer la référence actuelle pour la fonction de cleanup
    const currentInstance = instanceRef.current;
    
    return () => {
      // Marquer comme démonté
      currentInstance.isMounted = false;
      
      debugLog(`Démontage du hook pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
      
      // Désenregistrer l'instance du tracker
      InstanceTracker.unregister(currentInstance.instanceId);
    };
  }, [entityType, id]);
  
  // Fonction pour définir une entité liée
  const setRelatedEntity = useCallback((name, entity) => {
    const relatedConfig = relatedEntities.find(rel => rel.name === name);
    if (!relatedConfig) {
      debugLog(`Configuration de l'entité liée ${name} non trouvée`, 'error', 'useGenericEntityDetails');
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
    
    // Stocker dans le cache si activé
    if (cacheEnabled && entity) {
      cache.set(`related:${name}:${entity.id}`, entity);
    }
    
    // Marquer le formulaire comme modifié
    setIsDirty(true);
  }, [relatedEntities, cacheEnabled, cache]);
  
  // Fonction pour supprimer une entité liée
  const removeRelatedEntity = useCallback((name) => {
    const relatedConfig = relatedEntities.find(rel => rel.name === name);
    if (!relatedConfig) {
      debugLog(`Configuration de l'entité liée ${name} non trouvée`, 'error', 'useGenericEntityDetails');
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
  
  // Fonctions utilitaires 
  const getRelatedEntityId = useCallback((name) => {
    const relatedConfig = relatedEntities.find(rel => rel.name === name);
    if (!relatedConfig || !formData) {
      return null;
    }
    
    return formData[relatedConfig.idField];
  }, [relatedEntities, formData]);
  
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
  
  // Fonctions de navigation
  const navigateToRelated = useCallback((name, id) => {
    if (!navigate) return;
    
    const relatedConfig = relatedEntities.find(rel => rel.name === name);
    if (!relatedConfig) {
      debugLog(`Configuration de l'entité liée ${name} non trouvée`, 'error', 'useGenericEntityDetails');
      return;
    }
    
    const path = `/${relatedConfig.collection}/${id}`;
    navigate(path);
  }, [navigate, relatedEntities]);
  
  const navigateToEdit = useCallback(() => {
    if (!navigate || !editPath || !id) return;
    
    const path = editPath.replace(':id', id);
    navigate(path);
  }, [navigate, editPath, id]);
  
  const navigateToList = useCallback(() => {
    if (!navigate) return;
    
    const path = `/${collectionName}`;
    navigate(path);
  }, [navigate, collectionName]);
  
  // Fonction pour obtenir des statistiques sur le cache et les instances
  const getStats = useCallback(() => {
    return {
      cache: cacheEnabled ? cache.getStats() : { enabled: false },
      instances: InstanceTracker.getStats(),
      currentInstance: {
        id: instanceRef.current.instanceId,
        number: instanceRef.current.instanceNumber,
        entityType
      },
      subscription: realtime ? {
        enabled: true,
        lastUpdateTime: subscription.lastUpdateTime,
        collectionName,
        documentId: id
      } : { enabled: false }
    };
  }, [cacheEnabled, cache, entityType, realtime, subscription, collectionName, id]);
  
  // Nettoyer le cache complet pour ce type d'entité
  const invalidateEntityCache = useCallback(() => {
    if (!cacheEnabled) return 0;
    return cache.invalidateNamespace();
  }, [cacheEnabled, cache]);
  
  // Retourner l'API du hook
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
    setFormData, // Exposé pour les consommateurs
    isDirty,
    dirtyFields,
    errors: formErrors,
    
    // États d'opérations
    isSubmitting,
    isDeleting,
    showDeleteModal,
    
    // Actions de base
    toggleEditMode,
    handleEdit: toggleEditMode,
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
    retryFetch,
    formatDisplayValue,
    navigateToRelated,
    navigateToEdit,
    navigateToList,
    validateForm,
    
    // Fonctionnalités de cache et statistiques
    getStats,
    invalidateCache: invalidateEntityCache,
    cacheEnabled,

    // Infos sur l'instance
    instanceId: instanceRef.current.instanceId,
    instanceNumber: instanceRef.current.instanceNumber
  };
};

export default useGenericEntityDetails;
