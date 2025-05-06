/**
 * @deprecated Ce hook est déprécié et sera supprimé dans une future version.
 * Veuillez utiliser le hook migré vers les hooks génériques à la place:
 * import { useConcertDetailsV2 } from '@/hooks/concerts';
 * 
 * Hook pour gérer les détails d'un concert
 * @param {string} id - ID du concert
 * @returns {Object} - Données et fonctions pour la gestion du concert
 */
import useConcertDetailsMigrated from './useConcertDetailsMigrated';
import { useEffect } from 'react';

const useConcertDetails = (id) => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    console.warn(
      'Avertissement: useConcertDetails est déprécié. ' +
      'Veuillez utiliser useConcertDetailsV2 depuis @/hooks/concerts à la place.'
    );
  }, []);
  
  // Utiliser la version migrée qui est basée sur useGenericEntityDetails
  const migratedHook = useConcertDetailsMigrated(id);
  
  // Adapter l'API pour être compatible avec les composants existants
  return {
    // Propriétés de la version originale
    concert: migratedHook.entity,
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

export default useConcertDetails;
