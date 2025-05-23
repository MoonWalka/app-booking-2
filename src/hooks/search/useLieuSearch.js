import { useState, useCallback, useEffect } from 'react';
import useGenericEntitySearch from '../common/useGenericEntitySearch';
import { useLieuSearch } from '@/hooks/lieux/useLieuSearch';
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
  return useLieuSearch({ initialSearchTerm: initialTerm });
};

export default useLieuSearch;