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
  autoRefresh = false,        // Activer le polling
  refreshInterval = 30000,    // Intervalle en ms (par défaut 30 s)
  
  // Options de cache
  cacheEnabled = true,       // Activer le cache pour ce hook
  cacheTTL                   // TTL personnalisé pour ce hook (en ms)
}) => {
  // debugLog('Hook exécuté !', 'trace', 'useGenericEntityDetails');
  
  // Enregistrer l'instance avec le tracker à la place de la variable globale
  const instanceRef = useRef({
    ...InstanceTracker.register(entityType, { id, collectionName, realtime }),
    isMounted: true,
    currentlyFetching: false,
    activeAbortController: null,
    lastId: null
  });
  
  // Logger uniquement l'initialisation du hook
  debugLog(`🚀 INIT: useGenericEntityDetails #${instanceRef.current.instanceNumber} initialisé pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
  debugLog(`📊 INIT: instanceRef.current.isMounted = ${instanceRef.current.isMounted}`, 'debug', 'useGenericEntityDetails');
  
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
  
  // Utiliser le hook de cache
  const cache = useCache(entityType, {
    enabled: cacheEnabled,
    ttl: cacheTTL,
    invalidateOnUnmount: false // Ne pas invalider automatiquement au démontage
  });
  
  // Vérification immédiate du cache au montage pour éviter les problèmes de timing
  useEffect(() => {
    if (cacheEnabled && id && !entity) {
      const cachedData = cache.get(id);
      if (cachedData) {
        debugLog(`🚀 IMMEDIATE_CACHE_CHECK: Données trouvées en cache au montage pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
        setEntity(cachedData);
        setFormData(cachedData);
        setLoading(false);
        // Le chargement des entités liées sera déclenché dans un effet séparé
        debugLog(`✅ IMMEDIATE_CACHE_CHECK: États mis à jour depuis le cache`, 'info', 'useGenericEntityDetails');
      }
    }
  }, [id, entity, cacheEnabled, cache, entityType, autoLoadRelated]);
  
  // Effet dédié pour charger les entités liées une fois que l'entité est disponible
  useEffect(() => {
    if (autoLoadRelated && entity && Object.keys(relatedData).length === 0) {
      loadAllRelatedEntities(entity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadRelated, entity, relatedData]);
  
  // Fonction sécurisée pour mettre à jour les états uniquement si le composant est monté
  const safeSetState = useCallback((setter, value) => {
    const setterName = setter.name || 'unknown';
    debugLog(`🔄 SAFE_SET_STATE: Tentative ${setterName} - isMounted: ${instanceRef.current.isMounted}`, 'debug', 'useGenericEntityDetails');
    debugLog(`🔄 SAFE_SET_STATE: Valeur à définir: ${JSON.stringify(value)}`, 'debug', 'useGenericEntityDetails');
    
    if (instanceRef.current.isMounted) {
      debugLog(`✅ SAFE_SET_STATE: Appel du setter ${setterName}`, 'debug', 'useGenericEntityDetails');
      setter(value);
      debugLog(`✅ SAFE_SET_STATE: Setter ${setterName} exécuté avec succès`, 'debug', 'useGenericEntityDetails');
    } else {
      debugLog(`⚠️ SAFE_SET_STATE: Composant démonté, setter ${setterName} ignoré (mais cache maintenu)`, 'warn', 'useGenericEntityDetails');
      // Note: Le cache est maintenu même si le composant est démonté
      // Cela permet aux prochains montages d'avoir les données immédiatement
    }
  }, []);
  
  debugLog(`Appel du hook avec : ${entityType}, ${collectionName}, ${id}, realtime=${realtime}, cache=${cacheEnabled}`, 'debug', 'useGenericEntityDetails');
  
  // Réinitialisation complète lors d'un changement d'ID
  useEffect(() => {
    debugLog(`🔄 ID_CHANGE_EFFECT: Vérification changement ID - lastId: ${instanceRef.current.lastId}, newId: ${id}`, 'debug', 'useGenericEntityDetails');
    
    // Si l'ID change, on doit réinitialiser tous les états
    if (instanceRef.current.lastId !== id) {
      debugLog(`🔄 ID_CHANGE_EFFECT: Changement d'ID détecté - ${instanceRef.current.lastId} → ${id}`, 'info', 'useGenericEntityDetails');
      
      // Annuler les requêtes en cours
      if (instanceRef.current.activeAbortController) {
        debugLog(`🔄 ID_CHANGE_EFFECT: Annulation de la requête en cours`, 'debug', 'useGenericEntityDetails');
        instanceRef.current.activeAbortController.abort();
        instanceRef.current.activeAbortController = null;
      }
      
      debugLog(`🔄 ID_CHANGE_EFFECT: Réinitialisation des états - isMounted: ${instanceRef.current.isMounted}`, 'debug', 'useGenericEntityDetails');
      
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
      
      debugLog(`✅ ID_CHANGE_EFFECT: Réinitialisation terminée pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
    } else {
      debugLog(`⏭️ ID_CHANGE_EFFECT: Pas de changement d'ID, effet ignoré`, 'debug', 'useGenericEntityDetails');
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
    debugLog(`🚀 FETCH_ENTITY: Début fetchEntity pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
    debugLog(`📊 FETCH_ENTITY: État initial - isMounted: ${instanceRef.current.isMounted}, currentlyFetching: ${instanceRef.current.currentlyFetching}`, 'debug', 'useGenericEntityDetails');
    
    // Si le mode realtime est activé et que l'abonnement est actif, ne rien faire
    if (realtime) {
      debugLog(`⏭️ FETCH_ENTITY: Mode realtime activé, sortie immédiate`, 'debug', 'useGenericEntityDetails');
      return;
    }
    
    // Protection contre les appels multiples simultanés
    if (instanceRef.current.currentlyFetching) {
      debugLog(`⏭️ FETCH_ENTITY: Requête déjà en cours pour ${entityType}:${id}, ignoré`, 'warn', 'useGenericEntityDetails');
      return;
    }
    
    // Si pas d'ID, ne pas essayer de charger
    if (!id) {
      debugLog(`❌ FETCH_ENTITY: Pas d'ID fourni, arrêt`, 'warn', 'useGenericEntityDetails');
      safeSetState(setLoading, false);
      safeSetState(setError, { message: "Pas d'identifiant fourni" });
      return;
    }
    
    // Vérifier le cache si activé
    if (cacheEnabled) {
      debugLog(`🔍 FETCH_ENTITY: Vérification du cache pour ${entityType}:${id}`, 'debug', 'useGenericEntityDetails');
      const cachedData = cache.get(id);
      if (cachedData) {
        debugLog(`✅ FETCH_ENTITY: Données trouvées en cache pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
        debugLog(`📊 FETCH_ENTITY: Données cache: ${JSON.stringify(cachedData)}`, 'debug', 'useGenericEntityDetails');
        safeSetState(setEntity, cachedData);
        safeSetState(setFormData, cachedData);
        safeSetState(setLoading, false);
        
        // Charger les entités liées si demandé, même avec un cache hit
        if (autoLoadRelated) {
          debugLog(`🔗 FETCH_ENTITY: Chargement des entités liées depuis le cache`, 'debug', 'useGenericEntityDetails');
          loadAllRelatedEntities(cachedData);
        }
        
        debugLog(`✅ FETCH_ENTITY: Terminé avec succès (cache)`, 'info', 'useGenericEntityDetails');
        return;
      } else {
        debugLog(`❌ FETCH_ENTITY: Aucune donnée en cache pour ${entityType}:${id}`, 'debug', 'useGenericEntityDetails');
      }
    } else {
      debugLog(`⏭️ FETCH_ENTITY: Cache désactivé`, 'debug', 'useGenericEntityDetails');
    }
    
    // Marquer comme en cours de chargement
    debugLog(`🔄 FETCH_ENTITY: Début du chargement depuis Firestore`, 'debug', 'useGenericEntityDetails');
    instanceRef.current.currentlyFetching = true;
    safeSetState(setLoading, true);
    safeSetState(setError, null);
    
    try {
      // Annuler les requêtes précédentes
      if (instanceRef.current.activeAbortController) {
        debugLog(`🔄 FETCH_ENTITY: Annulation de la requête précédente`, 'debug', 'useGenericEntityDetails');
        instanceRef.current.activeAbortController.abort();
      }
      
      // Créer un nouveau AbortController
      const abortController = new AbortController();
      instanceRef.current.activeAbortController = abortController;
      debugLog(`🔄 FETCH_ENTITY: Nouveau AbortController créé`, 'debug', 'useGenericEntityDetails');
      
      debugLog(`🔥 FETCH_ENTITY: Début requête Firestore pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
      
      const entityDocRef = doc(db, collectionName, id);
      debugLog(`📄 FETCH_ENTITY: Référence document créée: ${collectionName}/${id}`, 'debug', 'useGenericEntityDetails');
      
      // Utiliser la méthode native pour annuler les requêtes Firestore
      const entityDoc = await getDoc(entityDocRef);
      debugLog(`📄 FETCH_ENTITY: getDoc terminé - exists: ${entityDoc?.exists?.()}`, 'info', 'useGenericEntityDetails');
      debugLog(`📊 FETCH_ENTITY: Document reçu: ${JSON.stringify(entityDoc?.data?.())}`, 'debug', 'useGenericEntityDetails');
      
      // Vérifier si la requête a été annulée
      if (abortController.signal.aborted) {
        debugLog(`❌ FETCH_ENTITY: Requête annulée pour ${entityType}:${id}`, 'warn', 'useGenericEntityDetails');
        return;
      }
      
      // Vérifier que le composant est toujours monté
      if (!instanceRef.current.isMounted) {
        debugLog(`❌ FETCH_ENTITY: Composant démonté, mais on continue le traitement pour éviter la perte de données`, 'warn', 'useGenericEntityDetails');
        // Ne pas return ici - continuer le traitement même si le composant est démonté
        // Les données seront disponibles lors du prochain montage via le cache
      }
      
      debugLog(`✅ FETCH_ENTITY: Composant toujours monté, traitement des données - isMounted: ${instanceRef.current.isMounted}`, 'debug', 'useGenericEntityDetails');

      if (entityDoc.exists()) {
        debugLog(`✅ FETCH_ENTITY: Document existe, traitement des données`, 'info', 'useGenericEntityDetails');
        const entityData = { [idField]: entityDoc.id, ...entityDoc.data() };
        debugLog(`📊 FETCH_ENTITY: Données brutes: ${JSON.stringify(entityData)}`, 'debug', 'useGenericEntityDetails');
        
        // Transformer les données si une fonction de transformation est fournie
        const transformedData = transformData ? transformData(entityData) : entityData;
        debugLog(`🔄 FETCH_ENTITY: Données transformées: ${JSON.stringify(transformedData)}`, 'debug', 'useGenericEntityDetails');

        // Mettre en cache si le cache est activé (TOUJOURS faire cela, même si démonté)
        if (cacheEnabled) {
          debugLog(`💾 FETCH_ENTITY: Mise en cache des données`, 'debug', 'useGenericEntityDetails');
          cache.set(id, transformedData);
          debugLog(`✅ FETCH_ENTITY: Données mises en cache avec succès`, 'debug', 'useGenericEntityDetails');
        }
        
        debugLog(`🎯 FETCH_ENTITY: Avant safeSetState(setEntity) - isMounted: ${instanceRef.current.isMounted}`, 'info', 'useGenericEntityDetails');
        safeSetState(setEntity, transformedData);
        
        debugLog(`🎯 FETCH_ENTITY: Avant safeSetState(setFormData) - isMounted: ${instanceRef.current.isMounted}`, 'debug', 'useGenericEntityDetails');
        safeSetState(setFormData, transformedData);
        
        // Charger les entités liées si demandé
        if (autoLoadRelated) {
          debugLog(`🔗 FETCH_ENTITY: Chargement des entités liées`, 'debug', 'useGenericEntityDetails');
          loadAllRelatedEntities(transformedData);
        }
        
        debugLog(`✅ FETCH_ENTITY: Données entity définies avec succès`, 'info', 'useGenericEntityDetails');
      } else {
        debugLog(`❌ FETCH_ENTITY: Document n'existe pas`, 'warn', 'useGenericEntityDetails');
        safeSetState(setError, { message: `${entityType} non trouvé(e)` });
      }
      
      debugLog(`🎯 FETCH_ENTITY: Avant safeSetState(setLoading, false) - isMounted: ${instanceRef.current.isMounted}`, 'debug', 'useGenericEntityDetails');
      safeSetState(setLoading, false);
      instanceRef.current.currentlyFetching = false;
      instanceRef.current.activeAbortController = null;
      debugLog(`✅ FETCH_ENTITY: Terminé avec succès`, 'info', 'useGenericEntityDetails');
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
  
  // Fonction pour charger une entité liée spécifique
  const loadRelatedEntity = useCallback(async (relatedConfig, entityData) => {
    const { name, collection: relatedCollection, idField: relatedIdField, type = 'one-to-one' } = relatedConfig;
    
    // Si l'identifiant de l'entité liée n'existe pas dans l'entité principale, retourner null
    if (!entityData[relatedIdField]) {
      debugLog(`❌ LOAD_RELATED: Pas d'ID pour l'entité liée ${name}`, 'warn', 'useGenericEntityDetails');
      return type === 'one-to-many' ? [] : null;
    }
    
    try {
      let result;
      
      // Vérifier s'il y a une requête personnalisée pour cette entité
      if (customQueries && customQueries[name]) {
        debugLog(`🔍 LOAD_RELATED: Utilisation de la requête personnalisée pour ${name}`, 'debug', 'useGenericEntityDetails');
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
        }
        
        if (allCached && cachedResults.length > 0) {
          debugLog(`✅ LOAD_RELATED: Toutes les entités liées ${name} trouvées en cache`, 'info', 'useGenericEntityDetails');
          return cachedResults;
        }
        
        // Si pas toutes en cache, charger depuis Firestore
        const results = await Promise.all(
          relatedIds.map(async (relId) => {
            const docRef = doc(db, relatedCollection, relId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const data = { [relatedIdField]: docSnap.id, ...docSnap.data() };
              if (cacheEnabled) {
                cache.set(`related:${name}:${relId}`, data);
              }
              return data;
            }
            return null;
          })
        );
        
        result = results.filter(Boolean);
      } else {
        // Charger une seule entité liée
        const relId = entityData[relatedIdField];
        
        // Vérifier le cache d'abord
        if (cacheEnabled) {
          const cachedItem = cache.get(`related:${name}:${relId}`);
          if (cachedItem) {
            debugLog(`✅ LOAD_RELATED: Entité liée ${name} trouvée en cache`, 'info', 'useGenericEntityDetails');
            return cachedItem;
          }
        }
        
        // Si pas en cache, charger depuis Firestore
        const docRef = doc(db, relatedCollection, relId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          result = { [relatedIdField]: docSnap.id, ...docSnap.data() };
          if (cacheEnabled) {
            cache.set(`related:${name}:${relId}`, result);
          }
        } else {
          debugLog(`❌ LOAD_RELATED: Entité liée ${name} non trouvée`, 'warn', 'useGenericEntityDetails');
          result = null;
        }
      }
      
      return result;
    } catch (error) {
      debugLog(`❌ LOAD_RELATED: Erreur lors du chargement de l'entité liée ${name}: ${error}`, 'error', 'useGenericEntityDetails');
      return type === 'one-to-many' ? [] : null;
    }
  }, [cacheEnabled, cache, customQueries]);
  
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
  }, [relatedEntities, entityType, id, safeSetState, cacheEnabled, cache, loadRelatedEntity]);
  
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
    setShowDeleteModal(false);
  }, []);
  
  // Fonction pour déclencher le processus de suppression
  const handleDelete = useCallback(() => {
    if (useDeleteModal) {
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
  
  // ====== Effet d'auto-refresh (polling) ======
  useEffect(() => {
    if (!autoRefresh || realtime || !id) return;
    const intervalId = setInterval(() => {
      refresh();
    }, refreshInterval);
    return () => clearInterval(intervalId);
  }, [autoRefresh, realtime, id, refresh, refreshInterval]);
  
  // Fonction pour réessayer manuellement en cas d'erreur
  const retryFetch = useCallback(() => {
    debugLog(`Nouvelle tentative de chargement pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
    if (cacheEnabled) cache.remove(id);
    safeSetState(setError, null);
    refresh();
  }, [entityType, id, cacheEnabled, cache, safeSetState, refresh]);
  
  // Chargement initial de l'entité - Compatible StrictMode
  useEffect(() => {
    debugLog(`🚀 INITIAL_LOAD_EFFECT: Début effet chargement initial`, 'info', 'useGenericEntityDetails');
    
    // Ne pas charger si pas d'ID
    if (!id) {
      debugLog(`⏭️ INITIAL_LOAD_EFFECT: Pas d'ID, arrêt`, 'debug', 'useGenericEntityDetails');
      return;
    }
    
    // Vérifier le cache d'abord (pour éviter les requêtes inutiles en StrictMode)
    if (cacheEnabled) {
      const cachedData = cache.get(id);
      if (cachedData) {
        debugLog(`✅ INITIAL_LOAD_EFFECT: Données trouvées en cache, pas de fetch nécessaire`, 'info', 'useGenericEntityDetails');
        setEntity(cachedData);
        setFormData(cachedData);
        setLoading(false);
        return;
      }
    }
    
    debugLog(`🔄 INITIAL_LOAD_EFFECT: Démarrage chargement pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
    
    // Si en mode temps réel, l'abonnement se charge du chargement initial
    if (!realtime) {
      debugLog(`🔥 INITIAL_LOAD_EFFECT: Mode normal, appel de fetchEntity`, 'info', 'useGenericEntityDetails');
      fetchEntity().catch((error) => {
        debugLog(`❌ INITIAL_LOAD_EFFECT: Erreur dans fetchEntity: ${error}`, 'error', 'useGenericEntityDetails');
      });
    } else {
      debugLog(`⏭️ INITIAL_LOAD_EFFECT: Mode realtime activé, pas d'appel fetchEntity`, 'debug', 'useGenericEntityDetails');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, entityType, realtime]); // Suppression de fetchEntity, cacheEnabled, cache pour éviter la boucle infinie
  
  // Gestion des derniers nettoyages au démontage
  useEffect(() => {
    // Capturer la référence actuelle pour la fonction de cleanup
    const currentInstance = instanceRef.current;
    debugLog(`🔧 CLEANUP_EFFECT: Effet de nettoyage installé pour ${entityType}:${id}`, 'debug', 'useGenericEntityDetails');
    
    // S'assurer que isMounted est true au montage
    currentInstance.isMounted = true;
    debugLog(`🔧 CLEANUP_EFFECT: isMounted forcé à true au montage`, 'debug', 'useGenericEntityDetails');
    
    return () => {
      // Marquer comme démonté
      debugLog(`🧹 CLEANUP: Début démontage du hook pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
      debugLog(`🧹 CLEANUP: Marquage isMounted = false (était: ${currentInstance.isMounted})`, 'debug', 'useGenericEntityDetails');
      currentInstance.isMounted = false;
      
      // Annuler les requêtes en cours
      if (currentInstance.activeAbortController) {
        debugLog(`🧹 CLEANUP: Annulation de la requête en cours`, 'debug', 'useGenericEntityDetails');
        currentInstance.activeAbortController.abort();
        currentInstance.activeAbortController = null;
      }
      
      // Désenregistrer l'instance du tracker
      debugLog(`🧹 CLEANUP: Désenregistrement de l'instance ${currentInstance.instanceId}`, 'debug', 'useGenericEntityDetails');
      InstanceTracker.unregister(currentInstance.instanceId);
      
      debugLog(`✅ CLEANUP: Démontage terminé pour ${entityType}:${id}`, 'info', 'useGenericEntityDetails');
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
