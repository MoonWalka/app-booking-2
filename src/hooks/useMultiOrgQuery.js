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
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Hook pour les requêtes Firestore avec contexte organisationnel
 * @param {string} collectionName - Nom de la collection (sans le préfixe org)
 * @param {Object} options - Options de requête
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useMultiOrgQuery = (collectionName, options = {}) => {
  const { currentOrg } = useOrganization();
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
    if (!currentOrg) {
      console.log('⚠️ Pas d\'organisation sélectionnée, utilisation des données globales');
      
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

      // 1. Tentative avec collection organisationnelle
      const orgCollectionName = `${collectionName}_org_${currentOrg.id}`;
      console.log(`📁 Tentative hook multi-org: ${orgCollectionName}`);

      const orgCollection = collection(db, orgCollectionName);
      let orgQuery = query(orgCollection);

      // Appliquer les filtres
      filters.forEach(filter => {
        if (filter.field && filter.operator && filter.value !== undefined) {
          orgQuery = query(orgQuery, where(filter.field, filter.operator, filter.value));
        }
      });

      // Appliquer le tri
      if (orderByField) {
        orgQuery = query(orgQuery, orderBy(orderByField, orderDirection));
      }

      // Appliquer la limite
      if (limitCount) {
        orgQuery = query(orgQuery, limit(limitCount));
      }

      // Tester d'abord si la collection organisationnelle existe et a des données
      const testSnapshot = await new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(orgQuery, 
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
        console.log(`✅ Collection organisationnelle trouvée: ${testSnapshot.docs.length} éléments`);
        
        // Utiliser la collection organisationnelle
        onSnapshot(orgQuery, 
          (snapshot) => {
            const results = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              _source: 'organizational'
            }));
            setData(results);
            setLoading(false);
          },
          (err) => {
            console.error('❌ Erreur écoute organisationnelle:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } else {
        throw new Error('Collection organisationnelle vide');
      }

    } catch (orgError) {
      console.log(`🔄 Fallback vers collection standard: ${collectionName}`);
      
      try {
        // 2. Fallback vers collection standard avec filtre organizationId
        const standardCollection = collection(db, collectionName);
        let fallbackQuery = query(standardCollection);

        // Ajouter le filtre organizationId
        fallbackQuery = query(fallbackQuery, where('organizationId', '==', currentOrg.id));

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

        // Tester avec filtre organizationId
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
          console.log(`✅ Collection standard avec filtre org: ${testFilteredSnapshot.docs.length} éléments`);
          
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

        // Appliquer seulement les filtres utilisateur (pas organizationId)
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
  }, [currentOrg, collectionName, filters, orderByField, orderDirection, limitCount]);

  // Écouter les changements en temps réel si demandé
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fonction utilitaire pour construire les contraintes de requête
  const buildConstraints = useCallback(() => {
    const constraints = [];
    
    // Ajouter le filtre organisation si disponible
    if (currentOrg) {
      constraints.push(where('organizationId', '==', currentOrg.id));
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
  }, [currentOrg, filters, orderByField, orderDirection, limitCount]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    buildConstraints
  };
};

/**
 * Hook pour obtenir un document unique avec contexte organisationnel
 */
export const useMultiOrgDocument = (collectionName, documentId) => {
  const { currentOrg } = useOrganization();
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
 * Hook pour les mutations avec contexte organisationnel
 */
export const useMultiOrgMutation = (collectionName) => {
  const { currentOrg } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (data) => {
    if (!currentOrg) {
      throw new Error('Aucune organisation sélectionnée');
    }

    setLoading(true);
    setError(null);

    try {
      const orgCollection = collection(db, collectionName);
      const docRef = await addDoc(orgCollection, {
        ...data,
        organizationId: currentOrg.id,
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
    if (!currentOrg) {
      throw new Error('Aucune organisation sélectionnée');
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
        organizationId: currentOrg.id
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
    if (!currentOrg) {
      throw new Error('Aucune organisation sélectionnée');
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