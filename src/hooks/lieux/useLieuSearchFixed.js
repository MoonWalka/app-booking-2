/**
 * Hook CORRIGÉ pour la recherche de lieux - Élimine les boucles infinies
 * 
 * PROBLÈME RÉSOLU: searchFields était un objet recréé à chaque render
 * SOLUTION: Utiliser un array simple et mémoriser la configuration
 */
import { useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntitySearch } from '@/hooks/common';

/**
 * Hook optimisé et stabilisé pour la recherche et la sélection de lieux
 * 
 * @param {Object} options - Options de configuration
 * @param {Function} [options.onSelect=null] - Callback appelé quand un lieu est sélectionné
 * @param {string} [options.initialSearchTerm=''] - Terme de recherche initial
 * @param {number} [options.maxResults=10] - Nombre maximum de résultats à afficher
 * @returns {Object} API pour la recherche et la sélection de lieux
 */
export const useLieuSearchFixed = ({
  onSelect = null,
  initialSearchTerm = '',
  maxResults = 10,
} = {}) => {
  const navigate = useNavigate();
  const [selectedLieu, setSelectedLieu] = useState(null);
  
  // 🔧 FIX: Mémoriser searchFields comme un array simple
  const searchFields = useMemo(() => ['nom', 'ville', 'codePostal', 'adresse'], []);
  
  // 🔧 FIX: Mémoriser la fonction de transformation
  const transformResult = useCallback((lieu) => ({
    ...lieu,
    displayName: lieu.nom ? 
      `${lieu.nom}${lieu.ville ? ` (${lieu.ville}${lieu.codePostal ? `, ${lieu.codePostal}` : ''})` : ''}` : 
      'Lieu sans nom',
    fullAddress: lieu.adresse ? 
      `${lieu.adresse}, ${lieu.codePostal || ''} ${lieu.ville || ''}, ${lieu.pays || 'France'}` : 
      undefined
  }), []);
  
  // 🔧 FIX: Configuration stable mémorisée
  const searchConfig = useMemo(() => ({
    collectionName: 'lieux',
    searchFields,
    initialSearchTerm,
    limit: maxResults,
    transformResult
  }), [searchFields, initialSearchTerm, maxResults, transformResult]);
  
  // Utilisation du hook générique avec configuration stable
  const searchHook = useGenericEntitySearch(searchConfig);
  
  // 🔧 FIX: handleLieuSelect sans dépendance sur searchHook
  const handleLieuSelect = useCallback((lieu) => {
    setSelectedLieu(lieu);
    // On n'a pas besoin de searchHook.setSelectedEntity
    // car selectedEntity est déjà géré par le hook
    
    // Appeler le callback de sélection si fourni
    if (onSelect && typeof onSelect === 'function') {
      onSelect(lieu);
    }
  }, [onSelect]); // Seulement onSelect comme dépendance
  
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
  
  // 🔧 FIX: Effacer la sélection sans dépendance
  const clearSelection = useCallback(() => {
    setSelectedLieu(null);
    // Le hook générique gère son propre état
  }, []);
  
  // 🔧 FIX: Retourner un objet stable
  return useMemo(() => ({
    // Propriétés et méthodes du hook générique
    ...searchHook,
    
    // Propriétés spécifiques aux lieux
    lieu: searchHook.selectedEntity || selectedLieu,
    setLieu: handleLieuSelect,
    clearLieu: clearSelection,
    lieux: searchHook.searchResults,
    
    // Actions spécifiques aux lieux
    handleCreateLieu,
    navigateToLieuDetails,
    
    // ✅ CORRECTION: Exposer les méthodes attendues par le composant
    search: searchHook.refreshSearch, // search() -> refreshSearch
    showResults: searchHook.showDropdown, // showResults -> showDropdown
    searchResults: searchHook.results, // Assurer que searchResults est bien exposé
    
    // Aliases pour compatibilité
    searchLieux: searchHook.refreshSearch,
    resetSearch: searchHook.clearSearch,
    
    // États supplémentaires
    isSearching: searchHook.isSearching,
    searchError: searchHook.error
  }), [
    searchHook,
    selectedLieu,
    handleLieuSelect,
    clearSelection,
    handleCreateLieu,
    navigateToLieuDetails
  ]);
};

export default useLieuSearchFixed; 