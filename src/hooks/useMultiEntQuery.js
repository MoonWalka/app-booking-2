import { useState, useEffect, useCallback } from 'react';
import { 
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';

/**
 * Hook pour les requêtes Firestore avec contexte entreprise
 * @param {string} collectionName - Nom de la collection (sans le préfixe ent)
 * @param {Object} options - Options de requête
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useMultiEntQuery = (collectionName, options = {}) => {
  const { currentEntreprise } = useEntreprise();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    filters = [],
    orderByField = null,
    orderDirection = 'asc',
    limitCount = null,
    realtime = false
  } = options;

  const fetchData = useCallback(async () => {
    if (!currentEntreprise) {
      console.log('⚠️ Pas d\'entreprise sélectionnée, utilisation des données globales');
      
      try {
        setLoading(true);
        setError(null);

        const globalCollection = collection(db, collectionName);
        let q = query(globalCollection);

        // Appliquer les filtres
        filters.forEach(filter => {
          if (filter.field && filter.operator && filter.value !== undefined) {
            q = query(q, where(filter.field, filter.operator, filter.value));
          }
        });

        // Appliquer le tri
        if (orderByField) {
          q = query(q, orderBy(orderByField, orderDirection));
        }

        // Appliquer la limite
        if (limitCount) {
          q = query(q, limit(limitCount));
        }

        onSnapshot(q, 
          (snapshot) => {
            const results = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              _source: 'global'
            }));
            setData(results);
            setLoading(false);
          },
          (err) => {
            console.error('❌ Erreur écoute temps réel global:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('❌ Erreur lors du chargement des données globales:', err);
        setError(err.message);
        setData([]);
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Tentative avec collection entreprise
      const entCollectionName = `${collectionName}_ent_${currentEntreprise.id}`;
      console.log(`📁 Tentative hook multi-ent: ${entCollectionName}`);

      const entCollection = collection(db, entCollectionName);
      let entQuery = query(entCollection);

      // Appliquer les filtres
      filters.forEach(filter => {
        if (filter.field && filter.operator && filter.value !== undefined) {
          entQuery = query(entQuery, where(filter.field, filter.operator, filter.value));
        }
      });

      // Appliquer le tri
      if (orderByField) {
        entQuery = query(entQuery, orderBy(orderByField, orderDirection));
      }

      // Appliquer la limite
      if (limitCount) {
        entQuery = query(entQuery, limit(limitCount));
      }

      // Tester d'abord si la collection entreprise existe et a des données
      const testSnapshot = await new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(entQuery, 
          (snapshot) => {
            unsubscribe(); // Arrêter l'écoute test
            resolve(snapshot);
          },
          (err) => {
            unsubscribe();
            reject(err);
          }
        );
      });

      if (testSnapshot.docs.length > 0) {
        console.log(`✅ Collection entreprise trouvée: ${testSnapshot.docs.length} éléments`);
        
        // Utiliser la collection entreprise
        onSnapshot(entQuery, 
          (snapshot) => {
            const results = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              _source: 'entreprise'
            }));
            setData(results);
            setLoading(false);
          },
          (err) => {
            console.error('❌ Erreur écoute entreprise:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } else {
        throw new Error('Collection entreprise vide');
      }

    } catch (entError) {
      console.log(`🔄 Fallback vers collection standard: ${collectionName}`);
      
      try {
        // 2. Fallback vers collection standard avec filtre entrepriseId
        const standardCollection = collection(db, collectionName);
        let fallbackQuery = query(standardCollection);

        // Ajouter le filtre entrepriseId
        fallbackQuery = query(fallbackQuery, where('entrepriseId', '==', currentEntreprise.id));

        // Appliquer les autres filtres
        filters.forEach(filter => {
          if (filter.field && filter.operator && filter.value !== undefined) {
            fallbackQuery = query(fallbackQuery, where(filter.field, filter.operator, filter.value));
          }
        });

        // Appliquer le tri
        if (orderByField) {
          fallbackQuery = query(fallbackQuery, orderBy(orderByField, orderDirection));
        }

        // Appliquer la limite
        if (limitCount) {
          fallbackQuery = query(fallbackQuery, limit(limitCount));
        }

        // Tester avec filtre entrepriseId
        const testFilteredSnapshot = await new Promise((resolve, reject) => {
          const unsubscribe = onSnapshot(fallbackQuery, 
            (snapshot) => {
              unsubscribe();
              resolve(snapshot);
            },
            (err) => {
              unsubscribe();
              reject(err);
            }
          );
        });

        if (testFilteredSnapshot.docs.length > 0) {
          console.log(`✅ Collection standard avec filtre ent: ${testFilteredSnapshot.docs.length} éléments`);
          
          onSnapshot(fallbackQuery, 
            (snapshot) => {
              const results = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                _source: 'standard-filtered'
              }));
              setData(results);
              setLoading(false);
            },
            (err) => {
              console.error('❌ Erreur écoute standard filtrée:', err);
              setError(err.message);
              setLoading(false);
            }
          );
        } else {
          throw new Error('Collection standard filtrée vide');
        }

      } catch (filteredError) {
        console.log(`🔄 Fallback final vers toutes les données standard`);
        
        // 3. Fallback final vers toutes les données (compatibilité legacy)
        const legacyCollection = collection(db, collectionName);
        let legacyQuery = query(legacyCollection);

        // Appliquer seulement les filtres utilisateur (pas entrepriseId)
        filters.forEach(filter => {
          if (filter.field && filter.operator && filter.value !== undefined) {
            legacyQuery = query(legacyQuery, where(filter.field, filter.operator, filter.value));
          }
        });

        // Appliquer le tri
        if (orderByField) {
          legacyQuery = query(legacyQuery, orderBy(orderByField, orderDirection));
        }

        // Appliquer la limite
        if (limitCount) {
          legacyQuery = query(legacyQuery, limit(limitCount));
        }

        onSnapshot(legacyQuery, 
          (snapshot) => {
            const results = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              _source: 'legacy'
            }));
            console.log(`📊 Données legacy chargées: ${results.length} éléments`);
            setData(results);
            setLoading(false);
          },
          (err) => {
            console.error('❌ Erreur écoute legacy:', err);
            setError(err.message);
            setData([]);
            setLoading(false);
          }
        );
      }
    }
  }, [currentEntreprise, collectionName, filters, orderByField, orderDirection, limitCount]);

  // Écouter les changements en temps réel si demandé
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fonction utilitaire pour construire les contraintes de requête
  const buildConstraints = useCallback(() => {
    const constraints = [];
    
    // Ajouter le filtre entreprise si disponible
    if (currentEntreprise) {
      constraints.push(where('entrepriseId', '==', currentEntreprise.id));
    }
    
    // Ajouter les filtres personnalisés
    filters.forEach(filter => {
      if (filter.field && filter.operator && filter.value !== undefined) {
        constraints.push(where(filter.field, filter.operator, filter.value));
      }
    });
    
    // Ajouter le tri
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }
    
    // Ajouter la limite
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    return constraints;
  }, [currentEntreprise, filters, orderByField, orderDirection, limitCount]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    buildConstraints
  };
};

/**
 * Hook pour obtenir un document unique avec contexte entreprise
 */
export const useMultiEntDocument = (collectionName, documentId) => {
  const { currentEntreprise } = useEntreprise();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentOrg || !documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setData(null);
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement du document:', err);
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [currentOrg, collectionName, documentId]);

  return { data, loading, error };
};

/**
 * Hook pour les mutations avec contexte entreprise
 */
export const useMultiEntMutation = (collectionName) => {
  const { currentEntreprise } = useEntreprise();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (data) => {
    if (!currentEntreprise) {
      throw new Error('Aucune entreprise sélectionnée');
    }

    setLoading(true);
    setError(null);

    try {
      const entCollection = collection(db, collectionName);
      const docRef = await addDoc(entCollection, {
        ...data,
        entrepriseId: currentEntreprise.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return docRef.id;
    } catch (err) {
      console.error('❌ Erreur lors de la création:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrg, collectionName]);

  const update = useCallback(async (documentId, data) => {
    if (!currentEntreprise) {
      throw new Error('Aucune entreprise sélectionnée');
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
        entrepriseId: currentEntreprise.id
      });
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrg, collectionName]);

  const remove = useCallback(async (documentId) => {
    if (!currentEntreprise) {
      throw new Error('Aucune entreprise sélectionnée');
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrg, collectionName]);

  return {
    create,
    update,
    remove,
    loading,
    error
  };
}; 