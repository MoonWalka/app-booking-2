/**
 * @deprecated Ce hook est déprécié et sera supprimé dans une future version (novembre 2025).
 * Veuillez utiliser le hook optimisé basé sur les hooks génériques à la place:
 * import { useLieuFormOptimized } from '@/hooks/lieux';
 * 
 * Hook pour gérer les formulaires de lieux
 * @param {string} lieuId - ID du lieu ou 'nouveau' pour un nouveau lieu
 * @returns {Object} - États et fonctions pour gérer le formulaire de lieu
 */
import useLieuFormOptimized from './useLieuFormOptimized';
import { useEffect } from 'react';

const useLieuForm = (lieuId) => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    console.warn(
      'Avertissement: useLieuForm est déprécié et sera supprimé en novembre 2025. ' +
      'Veuillez utiliser useLieuFormOptimized depuis @/hooks/lieux à la place.'
    );
  }, []);
  
  // Utiliser directement la version optimisée basée sur useGenericEntityForm
  return useLieuFormOptimized(lieuId);
};

export default useLieuForm;
