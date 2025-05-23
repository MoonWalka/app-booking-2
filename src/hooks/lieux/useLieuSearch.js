// src/hooks/lieux/useLieuSearch.js
import { useNavigate } from 'react-router-dom';
import { useEntitySearch } from '@/hooks/common';
import { useEffect } from 'react';
import { useLieuSearchOptimized } from './useLieuSearchOptimized';
import { debugLog } from '@/utils/logUtils';

/**
 * @deprecated Ce hook est déprécié et sera supprimé en novembre 2025.
 * Veuillez utiliser useLieuSearchOptimized à la place.
 * 
 * @param {Function} onSelect - Callback appelé quand un lieu est sélectionné (optionnel)
 * @returns {Object} - État et fonctions pour gérer la recherche et la sélection de lieux
 */
const useLieuSearch = (onSelect = null) => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    debugLog(
      'Le hook useLieuSearch est déprécié et sera supprimé en novembre 2025. ' +
      'Veuillez utiliser useLieuSearchOptimized à la place.',
      'warn',
      'useLieuSearch'
    );
  }, []);
  
  // Utiliser directement la version optimisée
  return useLieuSearchOptimized({ onSelect });
};

export default useLieuSearch;