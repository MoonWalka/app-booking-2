// src/hooks/programmateurs/useProgrammateurSearch.js
import { useNavigate } from 'react-router-dom';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';

/**
 * Hook personnalisé pour la recherche de programmateurs
 * Utilise le hook générique useEntitySearch avec les paramètres spécifiques aux programmateurs
 * 
 * @param {Function} onSelect - Callback appelé quand un programmateur est sélectionné (optionnel)
 * @returns {Object} - État et fonctions pour gérer la recherche et la sélection de programmateurs
 */
const useProgrammateurSearch = (onSelect = null) => {
  const navigate = useNavigate();
  
  // Utiliser le hook générique avec les paramètres spécifiques aux programmateurs
  const searchHook = useEntitySearch({
    entityType: 'programmateurs',
    searchField: 'nom',
    additionalSearchFields: ['structure', 'email'],
    maxResults: 10,
    onSelect
  });
  
  /**
   * Fonction pour créer un nouveau programmateur et naviguer vers la page de création
   */
  const handleCreateProgrammateur = () => {
    navigate('/programmateurs/nouveau');
  };
  
  return {
    ...searchHook,
    handleCreateProgrammateur
  };
};

export default useProgrammateurSearch;