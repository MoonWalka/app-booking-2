/**
 * @deprecated Ce hook est déprécié et sera supprimé en novembre 2025.
 * Veuillez utiliser useProgrammateurSearchOptimized à la place.
 * 
 * @param {Object|string} options - Options de configuration ou ID de lieu (ancienne API)
 * @returns {Object} - API pour la recherche et la sélection de programmateurs
 */
import { useEffect } from 'react';
import { useProgrammateurSearchOptimized } from './useProgrammateurSearchOptimized';
import { debugLog } from '@/utils/logUtils';

const useProgrammateurSearch = (options = {}) => {
  // Gérer la compatibilité avec l'ancienne API qui acceptait un string (lieuId)
  const { 
    onSelect = null, 
    lieuId = null
  } = typeof options === 'string' ? { lieuId: options } : options;

  // Afficher un avertissement de dépréciation
  useEffect(() => {
    debugLog(
      'Le hook useProgrammateurSearch est déprécié et sera supprimé en novembre 2025. ' +
      'Veuillez utiliser useProgrammateurSearchOptimized à la place.',
      'warn',
      'useProgrammateurSearch'
    );
  }, []);
  
  // Utiliser directement la version optimisée
  return useProgrammateurSearchOptimized({ 
    onSelect,
    lieuId  // Transmettre l'ID du lieu si présent
  });
};

export default useProgrammateurSearch;