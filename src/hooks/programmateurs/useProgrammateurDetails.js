/**
 * @deprecated Ce hook est déprécié et sera supprimé dans une future version.
 * Veuillez utiliser le hook optimisé à la place:
 * import { useProgrammateurDetailsOptimized } from '@/hooks/programmateurs';
 * 
 * Hook pour gérer les détails d'un programmateur
 * @param {string} id - ID du programmateur
 * @returns {Object} - Données et fonctions pour la gestion du programmateur
 */
import useProgrammateurDetailsMigrated from './useProgrammateurDetailsMigrated';
import { useEffect } from 'react';
import { debugLog } from '@/utils/logUtils';

const useProgrammateurDetails = (id) => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    debugLog(
      'Le hook useProgrammateurDetails est déprécié et sera supprimé en novembre 2025. ' +
      'Veuillez utiliser useProgrammateurDetailsOptimized à la place.',
      'warn',
      'useProgrammateurDetails'
    );
  }, []);
  
  // Utiliser la version migrée
  return useProgrammateurDetailsMigrated(id);
};

export default useProgrammateurDetails;

