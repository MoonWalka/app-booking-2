/**
 * @deprecated Ce hook est déprécié et sera supprimé en novembre 2025.
 * Veuillez utiliser useProgrammateurSearchOptimized à la place.
 * 
 * Note temporaire: Suite à des problèmes avec la version optimisée, ce hook utilise
 * temporairement la version migrée comme solution de contournement.
 * 
 * @param {Object|string} options - Options de configuration ou ID de lieu (ancienne API)
 * @returns {Object} - API pour la recherche et la sélection de programmateurs
 */
import { useEffect } from 'react';
import { debugLog } from '@/utils/logUtils';
// Remplacer l'import de la version optimisée par la version migrée
import useProgrammateurSearchMigrated from './useProgrammateurSearchMigrated';

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
      'Actuellement, ce hook utilise la version migrée comme solution de contournement temporaire.',
      'warn',
      'useProgrammateurSearch'
    );
  }, []);
  
  // Utiliser la version migrée au lieu de la version optimisée
  return useProgrammateurSearchMigrated({ 
    onSelect,
    lieuId  // Transmettre l'ID du lieu si présent
  });
};

export default useProgrammateurSearch;