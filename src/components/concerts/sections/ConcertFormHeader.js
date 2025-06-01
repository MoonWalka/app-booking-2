import React from 'react';
import FormHeader from '@/components/ui/FormHeader';
import ConcertFormActions from './ConcertFormActions';

/**
 * ConcertFormHeader - Composant pour l'en-tête du formulaire de concert
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.id - L'identifiant du concert
 * @param {Object} props.formData - Les données du formulaire
 * @param {Function} props.navigate - Fonction de navigation de react-router
 * @param {boolean} props.isSubmitting - Indique si le formulaire est en cours de soumission
 * @param {Function} props.onDelete - Fonction de rappel pour la suppression
 * @param {Function} props.onCancel - Fonction de rappel pour l'annulation
 * @param {boolean} props.roundedTop - Indique si le header doit avoir des bordures arrondies en haut
 */
const ConcertFormHeader = ({ id, formData, navigate, isSubmitting, onDelete, onCancel, roundedTop = false }) => {
  return (
    <FormHeader
      title={id === 'nouveau' ? 'Ajouter un concert' : 'Modifier le concert'}
      icon={<i className="bi bi-music-note-beamed"></i>}
      isLoading={isSubmitting}
      roundedTop={roundedTop}
      actions={[
        <ConcertFormActions
          key="actions"
          id={id}
          isSubmitting={isSubmitting}
          onDelete={onDelete}
          onCancel={onCancel}
          navigate={navigate}
          position="top"
        />
      ]}
    />
  );
};

export default ConcertFormHeader;
