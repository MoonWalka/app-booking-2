/**
 * Hook optimisé pour la recherche de lieux basé sur useGenericEntitySearch
 * 
 * Cette implémentation suit l'approche RECOMMANDÉE pour les nouveaux développements
 * en utilisant directement les hooks génériques.
 */
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntitySearch } from '@/hooks/common';

/**
 * Hook optimisé pour la recherche et la sélection de lieux
 * 
 * @param {Object} options - Options de configuration
 * @param {Function} [options.onSelect=null] - Callback appelé quand un lieu est sélectionné
 * @param {string} [options.initialSearchTerm=''] - Terme de recherche initial
 * @param {number} [options.maxResults=10] - Nombre maximum de résultats à afficher
 * @returns {Object} API pour la recherche et la sélection de lieux
 */
export const useLieuSearch = ({
  onSelect = null,
  initialSearchTerm = '',
  maxResults = 10,
} = {}) => {
  const navigate = useNavigate();
  const [selectedLieu, setSelectedLieu] = useState(null);
  
  // Utilisation du hook générique avec configuration pour les lieux
  const searchHook = useGenericEntitySearch({
    collectionName: 'lieux',
    // Champs sur lesquels effectuer la recherche
    searchFields: {
      nom: { prefix: true, weight: 5 },
      ville: { prefix: true, weight: 3 },
      codePostal: { exact: true, weight: 2 },
      adresse: { contains: true, weight: 1 }
    },
    initialSearchTerm,
    maxResults,
    // Transformation des résultats pour l'affichage
    transformResult: (lieu) => ({
      ...lieu,
      // Format d'affichage standardisé pour les lieux
      displayName: lieu.nom ? 
        `${lieu.nom}${lieu.ville ? ` (${lieu.ville}${lieu.codePostal ? `, ${lieu.codePostal}` : ''})` : ''}` : 
        'Lieu sans nom',
      // Ajout d'un champ pour l'adresse complète si nécessaire
      fullAddress: lieu.adresse ? 
        `${lieu.adresse}, ${lieu.codePostal || ''} ${lieu.ville || ''}, ${lieu.pays || 'France'}` : 
        undefined
    })
  });
  
  // Gestion de la sélection d'un lieu avec callback
  const handleLieuSelect = useCallback((lieu) => {
    setSelectedLieu(lieu);
    searchHook.setSelectedEntity(lieu);
    
    // Appeler le callback de sélection si fourni
    if (onSelect && typeof onSelect === 'function') {
      onSelect(lieu);
    }
  }, [onSelect, searchHook]);
  
  // Navigation vers la page de création de lieu
  const handleCreateLieu = useCallback(() => {
    navigate('/lieux/nouveau');
  }, [navigate]);
  
  // Navigation vers la page de détail d'un lieu
  const navigateToLieuDetails = useCallback((lieuId) => {
    if (lieuId) {
      navigate(`/lieux/${lieuId}`);
    }
  }, [navigate]);
  
  // Effacer la sélection
  const clearSelection = useCallback(() => {
    setSelectedLieu(null);
    searchHook.clearSelection();
  }, [searchHook]);
  
  return {
    // Propriétés et méthodes du hook générique
    ...searchHook,
    
    // Propriétés spécifiques aux lieux pour une meilleure DX
    lieu: searchHook.selectedEntity || selectedLieu,
    setLieu: handleLieuSelect,
    clearLieu: clearSelection,
    lieux: searchHook.searchResults,
    
    // Actions spécifiques aux lieux
    handleCreateLieu,
    navigateToLieuDetails,
    
    // Aliases pour compatibilité avec le code existant
    searchLieux: searchHook.refreshSearch,
    resetSearch: searchHook.clearSearch,
    
    // États supplémentaires
    isSearching: searchHook.loading,
    searchError: searchHook.error
  };
};

export default useLieuSearch;