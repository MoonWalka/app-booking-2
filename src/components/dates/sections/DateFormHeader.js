import React from 'react';
import FormHeader from '@/components/ui/FormHeader';
import DateFormActions from './DateFormActions';

/**
 * DateFormHeader - Composant pour l'en-tête du formulaire de date
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.id - L'identifiant du date
 * @param {Object} props.formData - Les données du formulaire
 * @param {Function} props.navigate - Fonction de navigation de react-router
 * @param {boolean} props.isSubmitting - Indique si le formulaire est en cours de soumission
 * @param {Function} props.onDelete - Fonction de rappel pour la suppression
 * @param {Function} props.onCancel - Fonction de rappel pour l'annulation
 * @param {boolean} props.roundedTop - Indique si le header doit avoir des bordures arrondies en haut
 */
const DateFormHeader = ({ id, formData, navigate, isSubmitting, onDelete, onCancel, roundedTop = false }) => {
  return (
    <FormHeader
      title={id === 'nouveau' ? 'Ajouter un date' : 'Modifier le date'}
      icon={<i className="bi bi-music-note-beamed"></i>}
      isLoading={isSubmitting}
      roundedTop={roundedTop}
      actions={[
        <DateFormActions
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

export default DateFormHeader;
