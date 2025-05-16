/**
 * @deprecated Ce hook est déprécié et sera supprimé dans une future version.
 * Veuillez utiliser le hook migré vers les hooks génériques à la place:
 * import { useLieuDetailsV2 } from '@/hooks/lieux';
 * 
 * Hook pour gérer les détails d'un lieu
 * @param {string} id - ID du lieu
 * @returns {Object} - Données et fonctions pour la gestion du lieu
 */
import useLieuDetailsMigrated from './useLieuDetailsMigrated';
import { useEffect } from 'react';

const useLieuDetails = (id) => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    console.warn(
      'Avertissement: useLieuDetails est déprécié. ' +
      'Veuillez utiliser useLieuDetailsV2 depuis @/hooks/lieux à la place.'
    );
  }, []);
  
  // Utiliser la version migrée qui est basée sur useGenericEntityDetails
  const migratedHook = useLieuDetailsMigrated(id);
  
  // Adapter l'API pour être compatible avec les composants existants
  return {
    // Propriétés de la version originale
    lieu: migratedHook.entity,
    loading: migratedHook.isLoading,
    error: migratedHook.error,
    isEditing: migratedHook.isEditing,
    formData: migratedHook.formData,
    isSubmitting: migratedHook.isSubmitting,
    
    // Fonctions de la version originale
    toggleEditMode: migratedHook.toggleEditMode,
    setFormData: migratedHook.updateFormData,
    handleChange: (e) => {
      const { name, value } = e.target;
      
      if (name.includes('.')) {
        const [section, field] = name.split('.');
        migratedHook.updateFormData(prevState => ({
          ...prevState,
          [section]: {
            ...prevState[section],
            [field]: value
          }
        }));
      } else {
        migratedHook.updateFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      }
    },
    handleSubmit: migratedHook.saveEntity,
    handleDelete: migratedHook.deleteEntity,
    formatValue: migratedHook.formatValue
  };
};

export default useLieuDetails;
