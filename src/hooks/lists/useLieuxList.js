import { useState, useEffect, useCallback } from 'react';
import { lieuService } from '../../services/firebaseService';

export function useLieuxList() {
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  // Chargement initial des lieux
  const fetchLieux = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      // Si reset est true, on recommence depuis le début
      const startAfter = reset ? null : lastVisible;
      
      // Récupérer les lieux avec pagination
      const result = await lieuService.getAll(
        pageSize, 
        startAfter, 
        'nom', 
        'asc'
      );
      
      // Mettre à jour la liste des lieux
      if (reset) {
        setLieux(result.items);
      } else {
        setLieux(prev => [...prev, ...result.items]);
      }
      
      // Mettre à jour le dernier élément visible pour la pagination
      setLastVisible(result.lastVisible);
      
      // Vérifier s'il y a plus de résultats
      setHasMore(result.items.length === pageSize);
      
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error);
      setError('Impossible de charger les lieux. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  }, [lastVisible, pageSize]);

  // Chargement initial
  useEffect(() => {
    fetchLieux(true);
  }, []);

  // Définir les champs de recherche
  const searchFields = [
    { 
      accessor: (item) => item.nom,
      label: 'Nom'
    },
    { 
      accessor: (item) => item.ville,
      label: 'Ville'
    },
    { 
      accessor: (item) => item.codePostal,
      label: 'Code postal'
    },
    { 
      accessor: (item) => item.adresse,
      label: 'Adresse'
    }
  ];

  // Définir les options de filtre
  const filterOptions = [
    {
      value: 'salle',
      label: 'Salles',
      icon: '🏢',
      filterFn: (item) => item.type === 'salle'
    },
    {
      value: 'festival',
      label: 'Festivals',
      icon: '🎪',
      filterFn: (item) => item.type === 'festival'
    },
    {
      value: 'autre',
      label: 'Autres',
      icon: '📍',
      filterFn: (item) => item.type !== 'salle' && item.type !== 'festival'
    }
  ];

  return {
    lieux,
    loading,
    error,
    hasMore,
    fetchLieux,
    searchFields,
    filterOptions
  };
}
