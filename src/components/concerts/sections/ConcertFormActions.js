import React from 'react';
import styles from './ConcertFormActions.module.css';

/**
 * ConcertFormActions - Composant pour les boutons d'action du formulaire de concert
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.id - L'identifiant du concert (nouveau ou existant)
 * @param {boolean} props.isSubmitting - Indique si le formulaire est en cours de soumission
 * @param {Function} props.onDelete - Fonction de rappel pour la suppression
 * @param {Function} props.onSubmit - Fonction de rappel pour la soumission du formulaire
 * @param {Function} props.onCancel - Fonction de rappel pour l'annulation (ajoutée)
 * @param {Function} props.navigate - Fonction de navigation de react-router
 * @param {string} props.position - Position des boutons (top ou bottom)
 */
const ConcertFormActions = ({ id, isSubmitting, onDelete, onSubmit, onCancel, navigate, position }) => {
  const isNewConcert = id === 'nouveau';
  
  // Déterminer si nous devons afficher tous les boutons ou juste certains en fonction de la position
  const showSaveButton = position === 'bottom';
  const showDeleteButton = !isNewConcert;
  
  // Utiliser la fonction onCancel si elle est fournie, sinon utiliser une navigation par défaut
  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    } else {
      navigate('/concerts');
    }
  };
  
  return (
    <div className={position === 'top' ? styles.topActionsContainer : styles.bottomActionsContainer}>
      <div className={styles.leftButtons}>
        <button
          type="button"
          className={`btn btn-outline-secondary ${styles.actionButton}`}
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </button>
        
        {showDeleteButton && (
          <button
            type="button"
            className={`btn btn-outline-danger ${styles.actionButton}`}
            onClick={onDelete}
            disabled={isSubmitting}
          >
            <i className="bi bi-trash me-1"></i>
            Supprimer
          </button>
        )}
      </div>
      
      {showSaveButton && (
        <div className={styles.rightButtons}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-1"></i>
                Enregistrer
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConcertFormActions;
