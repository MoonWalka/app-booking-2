import React from 'react';
import ConcertFormActions from './ConcertFormActions';
import styles from './ConcertFormHeader.module.css';

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
 */
const ConcertFormHeader = ({ id, formData, navigate, isSubmitting, onDelete, onCancel }) => {
  return (
    <div className={styles.detailsHeaderContainer}>
      <div className={styles.titleContainer}>
        <h2 className={styles.pageTitle}>
          {id === 'nouveau' ? 'Ajouter un concert' : 'Modifier le concert'}
        </h2>
      </div>
      
      <ConcertFormActions
        id={id}
        isSubmitting={isSubmitting}
        onDelete={onDelete}
        onCancel={onCancel}
        navigate={navigate}
        position="top"
      />
    </div>
  );
};

export default ConcertFormHeader;
