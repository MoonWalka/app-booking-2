// src/hooks/artistes/useArtisteSearch.js
import { useNavigate } from 'react-router-dom';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';

/**
 * Hook personnalisé pour la recherche d'artistes
 * Utilise le hook générique useEntitySearch avec les paramètres spécifiques aux artistes
 * 
 * @param {Function} onSelect - Callback appelé quand un artiste est sélectionné (optionnel)
 * @returns {Object} - État et fonctions pour gérer la recherche et la sélection d'artistes
 */
const useArtisteSearch = (onSelect = null) => {
  const navigate = useNavigate();
  
  // Utiliser le hook générique avec les paramètres spécifiques aux artistes
  const searchHook = useEntitySearch({
    entityType: 'artistes',
    searchField: 'nom',
    additionalSearchFields: ['genre', 'description'],
    maxResults: 10,
    onSelect
  });
  
  /**
   * Fonction pour créer un nouvel artiste et naviguer vers la page de création
   */
  const handleCreateArtiste = () => {
    navigate('/artistes/nouveau');
  };
  
  return {
    ...searchHook,
    handleCreateArtiste
  };
};

export default useArtisteSearch;