// src/hooks/artistes/useArtistesList.js
/**
 * @deprecated Ce hook est déprécié et sera supprimé en novembre 2025.
 * Veuillez utiliser useArtistesListOptimized à la place.
 * 
 * @param {number} pageSize - Nombre d'artistes à charger par page
 * @param {string} sortByField - Champ à utiliser pour le tri
 * @param {string} sortDirection - Direction du tri ('asc' ou 'desc')
 * @returns {Object} - API pour gérer la liste d'artistes
 */
import { useEffect } from 'react';
import { useArtistesListOptimized } from './useArtistesListOptimized';
import { debugLog } from '@/utils/logUtils';

export const useArtistesList = (pageSize = 20, sortByField = 'nom', sortDirection = 'asc') => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    debugLog(
      'Le hook useArtistesList est déprécié et sera supprimé en novembre 2025. ' +
      'Veuillez utiliser useArtistesListOptimized à la place.',
      'warn',
      'useArtistesList'
    );
  }, []);
  
  // Utiliser directement le hook optimisé
  return useArtistesListOptimized({
    pageSize,
    sortField: sortByField,
    sortDirection
  });
};

export default useArtistesList;