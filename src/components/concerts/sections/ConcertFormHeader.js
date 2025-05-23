import React from 'react';
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
  const isNewConcert = id === 'nouveau';
  
  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    } else {
      navigate('/concerts');
    }
  };
  
  return (
    <div className={styles.detailsHeaderContainer}>
      <div className={styles.titleContainer}>
        <h2 className={styles.pageTitle}>
          {isNewConcert ? 'Ajouter un concert' : 'Modifier le concert'}
        </h2>
      </div>
      
      <div className={styles.actionButtons}>
        <button
          type="button"
          className={`btn btn-outline-secondary ${styles.actionBtn}`}
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </button>
        
        {!isNewConcert && (
          <button
            type="button"
            className={`btn btn-outline-danger ${styles.actionBtn}`}
            onClick={onDelete}
            disabled={isSubmitting}
          >
            <i className="bi bi-trash me-2"></i>
            Supprimer
          </button>
        )}
        
        <button
          type="submit"
          form="concertForm"
          className={`btn btn-primary ${styles.actionBtn}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Enregistrement...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Enregistrer
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConcertFormHeader;
