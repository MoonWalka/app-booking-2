/**
 * @deprecated Ce hook est déprécié et sera supprimé dans une future version.
 * Veuillez utiliser le hook migré vers les hooks génériques à la place:
 * import { useLieuxFiltersV2 } from '@/hooks/lieux';
 * 
 * Hook pour gérer les filtres et la recherche de lieux
 * @param {Array} lieux - Liste des lieux à filtrer
 * @returns {Object} - API de filtrage et recherche de lieux
 */
import useLieuxFiltersMigrated from './useLieuxFiltersMigrated';
import { useEffect } from 'react';

const useLieuxFilters = (lieux = []) => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    console.warn(
      'Avertissement: useLieuxFilters est déprécié. ' +
      'Veuillez utiliser useLieuxFiltersV2 depuis @/hooks/lieux à la place.'
    );
  }, []);
  
  // Utiliser la version migrée qui est basée sur useGenericEntityList
  const migratedHook = useLieuxFiltersMigrated(lieux);
  
  // Adapter l'API pour être compatible avec les composants existants
  return {
    // Propriétés principales (s'assurer que filteredLieux est toujours défini)
    lieux: migratedHook.lieux || [],
    filteredLieux: migratedHook.filteredLieux || [],
    
    // Recherche et filtrage
    searchTerm: migratedHook.searchTerm || '',
    setSearchTerm: migratedHook.setSearchTerm,
    filterType: migratedHook.filterType || 'tous',
    setFilterType: migratedHook.setFilterType,
    filterRegion: migratedHook.filterRegion || 'toutes',
    setFilterRegion: migratedHook.setFilterRegion,
    filterVille: migratedHook.filterVille || 'toutes',
    setFilterVille: migratedHook.setFilterVille,
    
    // Options et actions
    resetFilters: migratedHook.resetFilters,
    refresh: migratedHook.refresh,
    types: migratedHook.types || ['tous'],
    regions: migratedHook.regions || ['toutes'],
    villes: migratedHook.villes || ['toutes'],
    
    // État de chargement et erreurs
    loading: migratedHook.loading || false,
    error: migratedHook.error,
    
    // Options de tri (si utilisées)
    sortOption: migratedHook.sortOption || 'nom_asc',
    setSortOption: migratedHook.setSortOption || (() => {}),
  };
};

export default useLieuxFilters;
