/**
 * Hook optimisé pour la recherche de programmateurs
 * basé sur useGenericEntitySearch
 * 
 * Cette implémentation suit l'approche RECOMMANDÉE pour les nouveaux développements
 * en utilisant directement les hooks génériques.
 */
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntitySearch } from '@/hooks/common';

/**
 * Hook optimisé pour la recherche et la sélection de programmateurs
 * 
 * @param {Object} options - Options de configuration
 * @param {Function} [options.onSelect=null] - Callback appelé quand un programmateur est sélectionné
 * @param {string} [options.initialSearchTerm=''] - Terme de recherche initial
 * @param {number} [options.maxResults=10] - Nombre maximum de résultats à afficher
 * @returns {Object} API pour la recherche et la sélection de programmateurs
 */
export const useProgrammateurSearchOptimized = ({
  onSelect = null,
  initialSearchTerm = '',
  maxResults = 10,
} = {}) => {
  const navigate = useNavigate();
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);
  
  // Utilisation du hook générique avec configuration pour les programmateurs
  const searchHook = useGenericEntitySearch({
    collectionName: 'programmateurs',
    // Champs sur lesquels effectuer la recherche
    searchFields: {
      nom: { prefix: true, weight: 5 },
      prenom: { prefix: true, weight: 4 },
      email: { exact: true, weight: 3 },
      structure: { prefix: true, weight: 2 },
      telephone: { exact: true, weight: 1 }
    },
    initialSearchTerm,
    maxResults,
    // Transformation des résultats pour l'affichage
    transformResult: (programmateur) => ({
      ...programmateur,
      // Format d'affichage standardisé pour les programmateurs
      displayName: programmateur.nom ? 
        `${programmateur.prenom || ''} ${programmateur.nom}${programmateur.structure ? ` (${programmateur.structure})` : ''}` : 
        'Programmateur sans nom',
      // Nom complet pour faciliter l'utilisation
      fullName: `${programmateur.prenom || ''} ${programmateur.nom || ''}`
    })
  });
  
  // Gestion de la sélection d'un programmateur avec callback
  const handleProgrammateurSelect = useCallback((programmateur) => {
    setSelectedProgrammateur(programmateur);
    searchHook.setSelectedEntity(programmateur);
    
    // Appeler le callback de sélection si fourni
    if (onSelect && typeof onSelect === 'function') {
      onSelect(programmateur);
    }
  }, [onSelect, searchHook]);
  
  // Navigation vers la page de création de programmateur
  const handleCreateProgrammateur = useCallback(() => {
    navigate('/programmateurs/nouveau');
  }, [navigate]);
  
  // Navigation vers la page de détail d'un programmateur
  const navigateToProgrammateurDetails = useCallback((programmateurId) => {
    if (programmateurId) {
      navigate(`/programmateurs/${programmateurId}`);
    }
  }, [navigate]);
  
  // Effacer la sélection
  const clearSelection = useCallback(() => {
    setSelectedProgrammateur(null);
    searchHook.clearSelection();
  }, [searchHook]);
  
  return {
    // Propriétés et méthodes du hook générique
    ...searchHook,
    
    // Propriétés spécifiques aux programmateurs pour une meilleure DX
    programmateur: searchHook.selectedEntity || selectedProgrammateur,
    setProgrammateur: handleProgrammateurSelect,
    clearProgrammateur: clearSelection,
    programmateurs: searchHook.searchResults,
    
    // Actions spécifiques aux programmateurs
    handleCreateProgrammateur,
    navigateToProgrammateurDetails,
    
    // Aliases pour compatibilité avec le code existant
    searchProgrammateurs: searchHook.refreshSearch,
    resetSearch: searchHook.clearSearch,
    
    // États supplémentaires
    isSearching: searchHook.loading,
    searchError: searchHook.error
  };
};

export default useProgrammateurSearchOptimized;