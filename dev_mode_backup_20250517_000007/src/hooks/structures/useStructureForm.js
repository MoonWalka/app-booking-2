import useStructureFormMigrated from './useStructureFormMigrated';
import { debugLog } from '@/utils/logUtils';

/**
 * @deprecated Utilisez useStructureFormMigrated à la place.
 * Ce hook est maintenu pour des raisons de compatibilité mais sera supprimé 
 * dans une version future.
 * 
 * @param {string} structureId - ID de la structure ou undefined pour une nouvelle structure
 * @returns {Object} États et fonctions pour gérer le formulaire de structure
 */
const useStructureForm = (structureId) => {
  // Log de dépréciation pour identifier les usages à mettre à jour
  debugLog(
    'Le hook useStructureForm est déprécié. Veuillez utiliser useStructureFormMigrated à la place.',
    'warn',
    'useStructureForm'
  );

  // Utiliser le hook migré
  const structureForm = useStructureFormMigrated(structureId);
  
  // Adapter l'API pour maintenir la compatibilité avec l'ancien hook
  return {
    ...structureForm,
    
    // Propriétés renommées pour compatibilité
    id: structureId,
    isEditMode: !!structureId,
    submitting: structureForm.isSubmitting,
    
    // Fonctions renommées pour compatibilité
    validateForm: structureForm.validateHtmlForm,
    
    // Fonction vide pour compatibilité API
    setValidated: () => {}
  };
};

export default useStructureForm;