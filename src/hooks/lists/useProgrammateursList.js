import { useState, useEffect, useCallback } from 'react';
import { programmateurService } from '../../services/firebaseService';

export function useProgrammateursList() {
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  // Chargement initial des programmateurs
  const fetchProgrammateurs = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      // Si reset est true, on recommence depuis le début
      const startAfter = reset ? null : lastVisible;
      
      // Récupérer les programmateurs avec pagination
      const result = await programmateurService.getAll(
        pageSize, 
        startAfter, 
        'nom', 
        'asc'
      );
      
      // Mettre à jour la liste des programmateurs
      if (reset) {
        setProgrammateurs(result.items);
      } else {
        setProgrammateurs(prev => [...prev, ...result.items]);
      }
      
      // Mettre à jour le dernier élément visible pour la pagination
      setLastVisible(result.lastVisible);
      
      // Vérifier s'il y a plus de résultats
      setHasMore(result.items.length === pageSize);
      
    } catch (error) {
      console.error('Erreur lors du chargement des programmateurs:', error);
      setError('Impossible de charger les programmateurs. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  }, [lastVisible, pageSize]);

  // Chargement initial
  useEffect(() => {
    fetchProgrammateurs(true);
  }, []);

  // Définir les champs de recherche
  const searchFields = [
    { 
      accessor: (item) => item.nom,
      label: 'Nom'
    },
    { 
      accessor: (item) => item.structure,
      label: 'Structure'
    },
    { 
      accessor: (item) => item.email,
      label: 'Email'
    },
    { 
      accessor: (item) => item.telephone,
      label: 'Téléphone'
    }
  ];

  // Définir les options de filtre
  const filterOptions = [
    {
      value: 'actif',
      label: 'Actifs',
      icon: '✅',
      filterFn: (item) => item.statut === 'actif' || !item.statut
    },
    {
      value: 'inactif',
      label: 'Inactifs',
      icon: '❌',
      filterFn: (item) => item.statut === 'inactif'
    },
    {
      value: 'prospect',
      label: 'Prospects',
      icon: '🔍',
      filterFn: (item) => item.statut === 'prospect'
    }
  ];

  return {
    programmateurs,
    loading,
    error,
    hasMore,
    fetchProgrammateurs,
    searchFields,
    filterOptions
  };
}
