import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, db } from '@/firebaseInit';

/**
 * Hook pour s'abonner aux changements d'un document Firestore.
 * Version optimisée avec moins de logs et sélection de champs.
 * 
 * @param {string} collectionName - Nom de la collection
 * @param {string} id - ID du document
 * @param {Function} onData - Callback appelé quand les données changent
 * @param {Function} onError - Callback appelé en cas d'erreur
 * @param {Function} transform - Transformation à appliquer aux données
 * @param {Array<string>} selectedFields - Champs à retourner (optionnel, tous par défaut)
 * @returns {Object} loading, error, lastUpdateTime, refresh
 */
const useFirestoreSubscription = (
  collectionName, 
  id, 
  onData, 
  onError, 
  transform,
  selectedFields
) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  
  // Stocker les références dans un ref pour éviter les problèmes lors du démontage
  const instanceRef = useRef({
    collectionName,
    id,
    isMounted: true,
    unsubscribe: null,
    cacheKey: `${collectionName}/${id}`
  });
  
  // Cache interne des snapshot par ID
  const cacheRef = useRef({});
  
  // Fonction pour imprimer les logs de debug
  const debugLog = (message, level = 'info', source = '') => {
    // Désactiver les logs trop verbeux en production
    if (process.env.NODE_ENV === 'production' && level !== 'error') return;
    
    const prefix = source ? `[${source}] ` : '';
    switch (level) {
      case 'error':
        console.error(`${prefix}${message}`);
        break;
      case 'warn':
        console.warn(`${prefix}${message}`);
        break;
      case 'debug':
        // Ne logger qu'en développement
        if (process.env.NODE_ENV !== 'production') {
          console.log(`${prefix}${message}`);
        }
        break;
      default:
        // Ne logger qu'en développement
        if (process.env.NODE_ENV !== 'production') {
          console.log(`${prefix}${message}`);
        }
    }
  };

  // Fonction pour rafraîchir l'abonnement
  const refresh = () => {
    if (!instanceRef.current.isMounted) return;
    
    // Mettre à jour les props stockées
    instanceRef.current.collectionName = collectionName;
    instanceRef.current.id = id;
    
    // Si l'ID change, désabonner de l'ancien et réinitialiser l'état
    if (instanceRef.current.cacheKey !== `${collectionName}/${id}`) {
      if (instanceRef.current.unsubscribe) {
        instanceRef.current.unsubscribe();
        instanceRef.current.unsubscribe = null;
      }
      
      instanceRef.current.cacheKey = `${collectionName}/${id}`;
      setLoading(true);
      setError(null);
    }
    
    // Si ID ou collection manquant, ne pas s'abonner
    if (!collectionName || !id) {
      setLoading(false);
      return;
    }
    
    try {
      // Désabonner de l'ancien si existant
      if (instanceRef.current.unsubscribe) {
        instanceRef.current.unsubscribe();
        instanceRef.current.unsubscribe = null;
      }
      
      setLoading(true);
      setError(null);
      
      // Créer un nouvel abonnement
      const unsubscribe = onSnapshot(
        doc(db, instanceRef.current.collectionName, instanceRef.current.id),
        (snapshot) => {
          // Ne pas traiter si le composant est démonté
          if (!instanceRef.current.isMounted) return;
          
          setLoading(false);
          setLastUpdateTime(Date.now());
          
          if (snapshot.exists()) {
            const data = { id: snapshot.id, ...snapshot.data() };
            
            // Filtrer les champs si une liste est fournie
            let filteredData = data;
            if (selectedFields && Array.isArray(selectedFields) && selectedFields.length > 0) {
              filteredData = { id: data.id };
              selectedFields.forEach(field => {
                if (data[field] !== undefined) {
                  filteredData[field] = data[field];
                }
              });
            }
            
            // Transformer les données si une fonction de transformation est fournie
            const processedData = transform ? transform(filteredData) : filteredData;
            
            // Mettre en cache
            cacheRef.current[instanceRef.current.cacheKey] = processedData;
            
            // Appeler le callback avec les données
            if (onData && instanceRef.current.isMounted) {
              onData(processedData);
            }
          } else {
            if (onData && instanceRef.current.isMounted) {
              onData(null);
            }
          }
        },
        (err) => {
          // Ne pas traiter si le composant est démonté
          if (!instanceRef.current.isMounted) return;
          
          debugLog(`Erreur dans l'abonnement Firestore pour ${instanceRef.current.collectionName}/${instanceRef.current.id}: ${err}`, 'error', 'useFirestoreSubscription');
          
          setLoading(false);
          setError(err);
          
          if (onError && instanceRef.current.isMounted) {
            onError(err);
          }
        }
      );
      
      // Stocker la fonction de désabonnement
      instanceRef.current.unsubscribe = unsubscribe;
    } catch (err) {
      if (!instanceRef.current.isMounted) return;
      
      debugLog(`Erreur lors de la création de l'abonnement: ${err}`, 'error', 'useFirestoreSubscription');
      
      setLoading(false);
      setError(err);
      
      if (onError && instanceRef.current.isMounted) {
        onError(err);
      }
    }
  };
  
  // Effet pour gérer le cycle de vie et les changements de props
  useEffect(() => {
    refresh();
    
    // Nettoyage lors du démontage
    return () => {
      instanceRef.current.isMounted = false;
      
      if (instanceRef.current.unsubscribe) {
        instanceRef.current.unsubscribe();
        instanceRef.current.unsubscribe = null;
      }
    };
  }, [collectionName, id, onData, onError, transform, JSON.stringify(selectedFields)]);
  
  return { loading, error, lastUpdateTime, refresh };
};

export default useFirestoreSubscription;