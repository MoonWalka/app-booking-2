import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { debugLog } from '@/utils/logUtils';
import InstanceTracker from '@/services/InstanceTracker';

/**
 * Hook pour gérer les abonnements Firestore de manière sécurisée
 * 
 * Gère automatiquement le cycle de vie des abonnements, les états de chargement et les erreurs.
 * 
 * @param {Object} options - Options de configuration
 * @param {string} options.collectionName - Nom de la collection Firestore
 * @param {string} options.id - ID du document
 * @param {Function} options.onData - Callback appelé quand les données sont reçues
 * @param {Function} options.onError - Callback appelé en cas d'erreur
 * @param {boolean} options.enabled - Activer/désactiver l'abonnement
 * @param {Function} options.transform - Transformer les données avant de les passer au callback
 * @returns {Object} - États et méthodes pour gérer l'abonnement
 */
const useFirestoreSubscription = ({
  collectionName,
  id,
  onData,
  onError,
  enabled = true,
  transform,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  
  // Référence pour l'instance
  const instanceRef = useRef({
    ...InstanceTracker.register('FirestoreSubscription', { collectionName, id }),
    unsubscribe: null,
    isMounted: true,
    enabled,
    id,
    collectionName
  });
  
  // Mettre à jour les valeurs de référence si elles changent
  useEffect(() => {
    instanceRef.current.enabled = enabled;
    instanceRef.current.id = id;
    instanceRef.current.collectionName = collectionName;
    
    // Mettre à jour les métadonnées dans le tracker
    InstanceTracker.updateMetadata(instanceRef.current.instanceId, {
      collectionName,
      id,
      enabled
    });
  }, [enabled, id, collectionName]);
  
  // Fonction pour démarrer l'abonnement
  const subscribe = () => {
    // Ne pas s'abonner si désactivé ou si pas d'ID/collection
    if (!instanceRef.current.enabled || !instanceRef.current.id || !instanceRef.current.collectionName) {
      setLoading(false);
      return;
    }
    
    // Nettoyer l'abonnement précédent
    if (instanceRef.current.unsubscribe) {
      instanceRef.current.unsubscribe();
      instanceRef.current.unsubscribe = null;
    }
    
    // Démarrer le chargement
    setLoading(true);
    setError(null);
    
    try {
      debugLog(`Démarrage d'un abonnement Firestore pour ${instanceRef.current.collectionName}/${instanceRef.current.id}`, 'info', 'useFirestoreSubscription');
      
      // Créer l'abonnement
      const unsubscribe = onSnapshot(
        doc(db, instanceRef.current.collectionName, instanceRef.current.id),
        (snapshot) => {
          // Ne pas traiter si le composant est démonté
          if (!instanceRef.current.isMounted) return;
          
          setLoading(false);
          setLastUpdateTime(Date.now());
          
          if (snapshot.exists()) {
            const data = { id: snapshot.id, ...snapshot.data() };
            
            // Transformer les données si une fonction de transformation est fournie
            const processedData = transform ? transform(data) : data;
            
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
  
  // S'abonner/désabonner au montage/démontage ou changement des dépendances
  useEffect(() => {
    // Ne s'abonne que si activé et si l'ID est défini
    if (enabled && id && collectionName) {
      subscribe();
    } else {
      // Si désactivé mais qu'un abonnement existe, le nettoyer
      if (instanceRef.current.unsubscribe) {
        instanceRef.current.unsubscribe();
        instanceRef.current.unsubscribe = null;
        setLoading(false);
      }
    }
    
    // Nettoyage à la désactivation ou démontage
    return () => {
      if (instanceRef.current.unsubscribe) {
        debugLog(`Nettoyage de l'abonnement Firestore pour ${collectionName}/${id}`, 'info', 'useFirestoreSubscription');
        instanceRef.current.unsubscribe();
        instanceRef.current.unsubscribe = null;
      }
    };
  }, [enabled, id, collectionName]);
  
  // Marquer comme démonté lors de la destruction du composant
  useEffect(() => {
    return () => {
      instanceRef.current.isMounted = false;
      // Désenregistrer l'instance du tracker
      InstanceTracker.unregister(instanceRef.current.instanceId);
    };
  }, []);
  
  // Fonction pour forcer le rafraîchissement de l'abonnement
  const refresh = () => {
    if (instanceRef.current.unsubscribe) {
      instanceRef.current.unsubscribe();
      instanceRef.current.unsubscribe = null;
    }
    
    if (instanceRef.current.enabled && instanceRef.current.id && instanceRef.current.collectionName) {
      subscribe();
    }
  };
  
  return {
    loading,
    error,
    refresh,
    lastUpdateTime,
    instanceId: instanceRef.current.instanceId,
    unsubscribe: () => {
      if (instanceRef.current.unsubscribe) {
        instanceRef.current.unsubscribe();
        instanceRef.current.unsubscribe = null;
        setLoading(false);
      }
    }
  };
};

export default useFirestoreSubscription;