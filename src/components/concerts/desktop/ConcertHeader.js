import React from 'react';
import styles from './ConcertHeader.module.css';

/**
 * Composant d'en-tête pour la page de détails d'un concert
 * Affiche le titre, le fil d'Ariane et les boutons d'action
 */
const ConcertHeader = ({ 
  concert, 
  onEdit, 
  onDelete, 
  isEditMode, 
  onSave, 
  onCancel, 
  isSubmitting, 
  canSave, 
  formatDate,
  navigateToList
}) => {
  return (
    <>
      <div className={styles.formHeaderContainer}>
        <h2 className={styles.modernTitle}>
          {concert.titre || `Concert du ${formatDate(concert.date)}`}
        </h2>
        <div className={styles.breadcrumbContainer}>
          <button className="tc-btn-light btn-sm" onClick={navigateToList}>
            Concerts
          </button>
          <i className="bi bi-chevron-right"></i>
          <span className={`${styles.breadcrumbItem} ${styles.active}`}>
            {concert.titre || formatDate(concert.date)}
          </span>
        </div>
      </div>

      <div className={styles.actionButtons}>
        {isEditMode ? (
          <>
            {/* Boutons en mode édition */}
            <button
              type="button"
              className={`tc-btn-primary ${styles.actionBtn}`}
              onClick={onSave}
              disabled={isSubmitting || !canSave}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span className="btn-text">Enregistrement...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  <span className="btn-text">Enregistrer</span>
                </>
              )}
            </button>
            
            <button 
              onClick={onCancel} 
              className={`tc-btn-outline-secondary ${styles.actionBtn}`}
            >
              <i className="bi bi-x-circle"></i>
              <span className="btn-text">Annuler</span>
            </button>
            
            <button 
              onClick={onDelete} 
              className={`tc-btn-outline-danger ${styles.actionBtn}`}
            >
              <i className="bi bi-trash"></i>
              <span className="btn-text">Supprimer</span>
            </button>
          </>
        ) : (
          <>
            {/* Boutons en mode affichage */}
            <button 
              onClick={navigateToList} 
              className={`tc-btn-outline-secondary ${styles.actionBtn}`}
            >
              <i className="bi bi-arrow-left"></i>
              <span className="btn-text">Retour</span>
            </button>
            
            <button
              onClick={onEdit}
              className={`tc-btn-outline-primary ${styles.actionBtn}`}
            >
              <i className="bi bi-pencil"></i>
              <span className="btn-text">Modifier</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default ConcertHeader;