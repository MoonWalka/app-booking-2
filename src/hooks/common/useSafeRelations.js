import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase-service';

/**
 * Hook sécurisé pour charger les relations sans créer de boucles infinies
 * 
 * @param {string} entityType - Type de l'entité principale (concert, artiste, etc.)
 * @param {string} entityId - ID de l'entité principale
 * @param {number} depth - Profondeur de chargement des relations (défaut: 1)
 * @param {Object} options - Options de configuration
 * @returns {Object} { data, loading, error, loadedEntities }
 */
const useSafeRelations = (entityType, entityId, depth = 1, options = {}) => {
  const {
    includeRelations = true,
    relationTypes = null, // null = toutes les relations, ou array spécifique
    maxRelationsPerType = 10,
    onRelationLoad = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Set pour tracker les entités déjà chargées et éviter les boucles
  const loadedIds = useRef(new Set());
  const loadingPromises = useRef(new Map());

  // Configuration des relations par type d'entité (memoized pour performance)
  const relationConfigs = useMemo(() => ({
    concert: {
      artistes: { collection: 'artistes', field: 'artistesIds', isArray: true, reverseField: 'concertsIds' },
      lieu: { collection: 'lieux', field: 'lieuId', isArray: false },
      contact: { collection: 'contacts', field: 'contactIds', isArray: true }, // Format harmonisé
      structure: { collection: 'structures', field: 'structureId', isArray: false, reverseField: 'concertsIds' }
    },
    artiste: {
      concerts: { collection: 'concerts', field: 'concertsIds', isArray: true, reverseField: 'artistesIds' }
    },
    lieu: {
      concerts: { collection: 'concerts', field: 'concertsIds', isArray: true, reverseField: 'lieuId' },
      contacts: { collection: 'contacts', field: 'contactIds', isArray: true, reverseField: 'lieuxIds' }
    },
    contact: {
      lieux: { collection: 'lieux', field: 'lieuxIds', isArray: true, reverseField: 'contactIds' },
      structure: { collection: 'structures', field: 'structureId', isArray: false }
    },
    structure: {
      contacts: { collection: 'contacts', field: 'contactsIds', isArray: true, reverseField: 'structureId' },
      concerts: { collection: 'concerts', field: 'concertsIds', isArray: true, reverseField: 'structureId' }
    }
  }), []);

  /**
   * Charge une entité avec protection contre les boucles
   */
  const loadEntity = useCallback(async (collectionName, id, currentDepth = 0) => {
    const key = `${collectionName}:${id}`;
    
    // Vérifier si déjà chargé
    if (loadedIds.current.has(key)) {
      return { id, _loaded: true, _cached: true };
    }
    
    // Vérifier si en cours de chargement
    if (loadingPromises.current.has(key)) {
      return loadingPromises.current.get(key);
    }
    
    // Marquer comme en cours de chargement
    const loadPromise = (async () => {
      try {
        loadedIds.current.add(key);
        
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          return null;
        }
        
        const entityData = { id: docSnap.id, ...docSnap.data() };
        
        // Charger les relations si la profondeur le permet
        if (currentDepth < depth && includeRelations) {
          // Déduire le type d'entité depuis la collection
          let entityTypeFromCollection = collectionName;
          if (collectionName === 'lieux') {
            entityTypeFromCollection = 'lieu';
          } else if (collectionName.endsWith('s')) {
            entityTypeFromCollection = collectionName.slice(0, -1);
          }
          
          const config = relationConfigs[entityTypeFromCollection];
          
          if (config) {
            for (const [relationName, relationConfig] of Object.entries(config)) {
              // Vérifier si ce type de relation est demandé
              if (relationTypes && !relationTypes.includes(relationName)) {
                continue;
              }
              
              let relationIds = entityData[relationConfig.field];
              
              // Gestion spéciale pour les relations inverses (ex: concerts d'un lieu)
              if (relationConfig.reverseField && !relationIds) {
                // Chercher les entités qui pointent vers cette entité
                try {
                  console.log(`🔄 Recherche relation inverse: ${relationName} où ${relationConfig.reverseField} == ${entityData.id}`);
                  const relatedCollectionRef = collection(db, relationConfig.collection);
                  const q = query(
                    relatedCollectionRef,
                    where(relationConfig.reverseField, '==', entityData.id)
                  );
                  const querySnapshot = await getDocs(q);
                  const relatedEntities = [];
                  
                  for (const docSnap of querySnapshot.docs) {
                    const relatedEntity = { id: docSnap.id, ...docSnap.data() };
                    relatedEntities.push(relatedEntity);
                  }
                  
                  console.log(`✅ Trouvé ${relatedEntities.length} ${relationName}`);
                  
                  entityData[relationName] = relatedEntities.slice(0, maxRelationsPerType);
                  if (relatedEntities.length > maxRelationsPerType) {
                    entityData[`${relationName}Count`] = relatedEntities.length;
                    entityData[`${relationName}HasMore`] = true;
                  }
                  continue; // Passer à la relation suivante
                } catch (err) {
                  console.error(`❌ Erreur chargement relation inverse ${relationName}:`, err);
                  continue;
                }
              }
              
              if (relationIds) {
                if (relationConfig.isArray && Array.isArray(relationIds)) {
                  // Cas normal : tableau d'IDs simples
                  const idsToLoad = relationIds.slice(0, maxRelationsPerType);
                  
                  const relatedEntities = await Promise.all(
                    idsToLoad.map(relId => 
                      loadEntity(relationConfig.collection, relId, currentDepth + 1)
                    )
                  );
                  
                  entityData[relationName] = relatedEntities.filter(Boolean);
                  
                  // Indiquer s'il y a plus d'éléments
                  if (relationIds.length > maxRelationsPerType) {
                    entityData[`${relationName}Count`] = relationIds.length;
                    entityData[`${relationName}HasMore`] = true;
                  }
                } else if (!relationConfig.isArray && relationIds) {
                  entityData[relationName] = await loadEntity(
                    relationConfig.collection, 
                    relationIds, 
                    currentDepth + 1
                  );
                }
              }
            }
          }
        }
        
        // Callback optionnel après chargement
        if (onRelationLoad) {
          onRelationLoad(entityData, currentDepth);
        }
        
        return entityData;
      } catch (err) {
        console.error(`Erreur chargement ${key}:`, err);
        return null;
      } finally {
        loadingPromises.current.delete(key);
      }
    })();
    
    loadingPromises.current.set(key, loadPromise);
    return loadPromise;
  }, [depth, includeRelations, relationTypes, maxRelationsPerType, onRelationLoad, relationConfigs]);

  /**
   * Effet principal pour charger l'entité
   */
  useEffect(() => {
    console.log('🔄 useSafeRelations useEffect déclenché:', { entityId, entityType });
    
    if (!entityId || !entityType) {
      console.log('⚠️ useSafeRelations - Pas d\'ID ou de type:', { entityId, entityType });
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Réinitialiser les trackers
        loadedIds.current.clear();
        loadingPromises.current.clear();
        
        // Gestion spéciale pour "lieu" -> "lieux" (pluriel irrégulier)
        const collectionName = entityType === 'lieu' ? 'lieux' : `${entityType}s`;
        console.log('🔍 useSafeRelations - Chargement:', { entityType, entityId, collection: collectionName });
        const result = await loadEntity(collectionName, entityId, 0);
        console.log('📦 useSafeRelations - Résultat:', result);
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error('Erreur useSafeRelations:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [entityId, entityType, loadEntity]);

  return {
    data,
    loading,
    error,
    loadedEntities: loadedIds.current.size,
    reload: () => {
      loadedIds.current.clear();
      loadingPromises.current.clear();
      setData(null);
      setLoading(true);
    }
  };
};

export default useSafeRelations;