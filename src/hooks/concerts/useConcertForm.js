import useConcertFormOptimized from './useConcertFormOptimized';
import { debugLog } from '@/utils/logUtils';

/**
 * @deprecated Ce hook est déprécié et sera supprimé en novembre 2025.
 * Veuillez utiliser useConcertFormOptimized à la place.
 * 
 * @param {string} id - ID du concert à éditer (optionnel, si null c'est un nouveau concert)
 * @returns {Object} API pour gérer le formulaire d'un concert
 */
const useConcertForm = (id) => {
  // Log de dépréciation pour identifier les usages à mettre à jour
  debugLog(
    'Le hook useConcertForm est déprécié et sera supprimé en novembre 2025. Veuillez utiliser useConcertFormOptimized à la place.',
    'warn',
    'useConcertForm'
  );

  // Utiliser directement le hook optimisé
  const concertForm = useConcertFormOptimized(id);

  // Adapter l'API pour maintenir la compatibilité avec l'ancien hook
  return {
    ...concertForm,
    
    // Propriétés renommées pour compatibilité
    selectedLieu: concertForm.lieu,
    selectedProgrammateur: concertForm.programmateur,
    selectedArtiste: concertForm.artiste,
    
    // Fonctions renommées pour compatibilité
    setSelectedLieu: concertForm.handleLieuChange,
    setSelectedArtiste: concertForm.handleArtisteChange,
    
    // Compatibilité des anciennes propriétés
    initialProgrammateurId: concertForm.relatedData?.programmateur?.id,
    initialArtisteId: concertForm.relatedData?.artiste?.id
  };
};

export default useConcertForm;
