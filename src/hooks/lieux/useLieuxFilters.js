/**
 * @deprecated Ce hook est déprécié et sera supprimé en novembre 2025.
 * Veuillez utiliser useLieuxFiltersOptimized à la place.
 * 
 * Hook pour gérer les filtres et la recherche de lieux
 * @param {Array} lieux - Liste des lieux à filtrer (paramètre ignoré dans la version optimisée)
 * @returns {Object} - API de filtrage et recherche de lieux
 */
import { useEffect } from 'react';
import { useLieuxFiltersOptimized } from './useLieuxFiltersOptimized';
import { debugLog } from '@/utils/logUtils';

const useLieuxFilters = (lieux = []) => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    debugLog(
      'Le hook useLieuxFilters est déprécié et sera supprimé en novembre 2025. ' +
      'Veuillez utiliser useLieuxFiltersOptimized à la place.',
      'warn',
      'useLieuxFilters'
    );
  }, []);
  
  // Utiliser directement la version optimisée
  // Note: le paramètre lieux est ignoré car la version optimisée charge les données depuis Firestore
  return useLieuxFiltersOptimized();
};

export default useLieuxFilters;
