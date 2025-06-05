import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, getDocs, where } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Hook robuste pour charger les concerts avec gestion d'erreurs
 */
export const useConcerts = (options = {}) => {
  const {
    sortField = 'dateEvenement',
    sortDirection = 'desc'
    // filters = {} // Pas utilisé pour l'instant
  } = options;

  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentOrganization } = useOrganization();

  const loadConcerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎵 Chargement des concerts...');
      
      // Vérifier qu'on a une organisation
      if (!currentOrganization?.id) {
        console.warn('⚠️ Pas d\'organisation sélectionnée');
        setConcerts([]);
        return;
      }
      
      const concertsRef = collection(db, 'concerts');
      
      // Construire la requête avec filtre organisation
      const queryConstraints = [
        where('organizationId', '==', currentOrganization.id)
      ];
      
      // Tentative avec tri demandé
      try {
        queryConstraints.push(orderBy(sortField, sortDirection));
        console.log(`✅ Tri appliqué: ${sortField} ${sortDirection}`);
      } catch (sortError) {
        console.warn(`⚠️ Tri par ${sortField} impossible, essai createdAt...`);
        try {
          queryConstraints.push(orderBy('createdAt', 'desc'));
          console.log('✅ Tri fallback: createdAt desc');
        } catch (fallbackError) {
          console.warn('⚠️ Aucun tri possible, chargement sans ordre');
        }
      }
      
      const q = query(concertsRef, ...queryConstraints);
      
      const snapshot = await getDocs(q);
      const concertsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ ${concertsList.length} concerts chargés`);
      setConcerts(concertsList);
      
    } catch (err) {
      console.error('❌ Erreur chargement concerts:', err);
      setError(err.message);
      setConcerts([]);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection, currentOrganization]);

  useEffect(() => {
    loadConcerts();
  }, [loadConcerts]);

  return {
    concerts,
    loading,
    error,
    refetch: loadConcerts
  };
};

export default useConcerts;
