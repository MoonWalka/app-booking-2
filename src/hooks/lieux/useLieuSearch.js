// src/hooks/lieux/useLieuSearch.js
import { useNavigate } from 'react-router-dom';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';

/**
 * Hook personnalisé pour la recherche de lieux
 * Utilise le hook générique useEntitySearch avec les paramètres spécifiques aux lieux
 * 
 * @param {Function} onSelect - Callback appelé quand un lieu est sélectionné (optionnel)
 * @returns {Object} - État et fonctions pour gérer la recherche et la sélection de lieux
 */
const useLieuSearch = (onSelect = null) => {
  const navigate = useNavigate();
  
  // Utiliser le hook générique avec les paramètres spécifiques aux lieux
  const searchHook = useEntitySearch({
    entityType: 'lieux',
    searchField: 'nom',
    additionalSearchFields: ['ville', 'codePostal', 'adresse'],
    maxResults: 10,
    onSelect
  });
  
  /**
   * Fonction pour créer un nouveau lieu et naviguer vers la page de création
   */
  const handleCreateLieu = () => {
    navigate('/lieux/nouveau');
  };
  
  return {
    ...searchHook,
    handleCreateLieu
  };
};

export default useLieuSearch;