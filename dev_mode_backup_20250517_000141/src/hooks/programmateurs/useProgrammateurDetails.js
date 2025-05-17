/**
 * @deprecated Ce hook est déprécié et sera supprimé dans une future version.
 * Veuillez utiliser le hook optimisé à la place:
 * import { useProgrammateurDetailsOptimized } from '@/hooks/programmateurs';
 * 
 * Hook pour gérer les détails d'un programmateur
 * @param {string} id - ID du programmateur
 * @returns {Object} - Données et fonctions pour la gestion du programmateur
 */
import useProgrammateurDetailsOptimized from './useProgrammateurDetailsOptimized';
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
  
  // Utiliser la version optimisée plutôt que la version migrée
  const result = useProgrammateurDetailsOptimized(id);
  
  // LOGS DE DIAGNOSTIC: Vérifier si les lieux sont correctement chargés
  useEffect(() => {
    if (result.lieux) {
      console.log(`[DIAGNOSTIC] useProgrammateurDetails - ID: ${id} - Lieux chargés: ${result.lieux.length}`, {
        lieuxIds: result.lieux?.map(lieu => lieu.id),
        loadingLieux: result.loadingLieux,
        errorLieux: result.errorLieux
      });
    }
    
    if (result.concerts || result.concertsAssocies) {
      const concerts = result.concerts || result.concertsAssocies;
      console.log(`[DIAGNOSTIC] useProgrammateurDetails - ID: ${id} - Concerts chargés: ${concerts.length}`, {
        concertIds: concerts?.map(concert => concert.id),
        loadingConcerts: result.loadingConcerts,
        errorConcerts: result.errorConcerts
      });
    }
  }, [id, result.lieux, result.loadingLieux, result.concerts, result.concertsAssocies, result.loadingConcerts]);
  
  return result;
};

export default useProgrammateurDetails;

