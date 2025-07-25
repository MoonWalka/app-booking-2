import { useEffect } from 'react';
import { useLieuSearch as useLieuSearchOptimized } from '@/hooks/lieux/useLieuSearch';
import { debugLog } from '@/utils/logUtils';

/**
 * @deprecated Ce hook est déprécié et sera supprimé en novembre 2025.
 * Veuillez utiliser useLieuSearch depuis @/hooks/lieux à la place.
 * 
 * @param {string} initialTerm - Terme de recherche initial
 * @returns {Object} API de recherche de lieux
 */
const useLieuSearch = (initialTerm = '') => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    debugLog(
      'Le hook useLieuSearch du dossier hooks/search est déprécié et sera supprimé en novembre 2025. ' +
      'Veuillez utiliser useLieuSearch depuis @/hooks/lieux à la place.',
      'warn',
      'useLieuSearch'
    );
  }, []);
  
  // Utiliser directement la version optimisée
  return useLieuSearchOptimized({ initialSearchTerm: initialTerm });
};

export default useLieuSearch;