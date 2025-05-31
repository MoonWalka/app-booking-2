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
      console.log('⚠️ Pas d\'organisation sélectionnée, pas de chargement des données');
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orgCollection = collection(db, collectionName);
      let q = query(orgCollection);

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
            ...doc.data()
          }));
          setData(results);
          setLoading(false);
        },
        (err) => {
          console.error('❌ Erreur écoute temps réel:', err);
          setError(err.message);
          setLoading(false);
        }
      );

    } catch (err) {
      console.error('❌ Erreur lors du chargement des données:', err);
      setError(err.message);
      setData([]);
    }
  }, [currentOrg, collectionName, filters, orderByField, orderDirection, limitCount]);

  // Écouter les changements en temps réel si demandé
  useEffect(() => {
    if (!currentOrg || !realtime) {
      fetchData();
      return;
    }

    const orgCollection = collection(db, collectionName);
    let q = query(orgCollection);

    // Appliquer les filtres pour l'écoute en temps réel
    filters.forEach(filter => {
      if (filter.field && filter.operator && filter.value !== undefined) {
        q = query(q, where(filter.field, filter.operator, filter.value));
      }
    });

    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(results);
        setLoading(false);
      },
      (err) => {
        console.error('❌ Erreur écoute temps réel:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentOrg, collectionName, filters, orderByField, orderDirection, limitCount, realtime, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
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