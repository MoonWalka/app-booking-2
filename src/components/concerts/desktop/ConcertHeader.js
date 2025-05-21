import React from 'react';
import styles from './ConcertHeader.module.css';
import Button from '@/components/ui/Button';

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
          <Button variant="light" size="sm" className="tc-btn-light btn-sm" onClick={navigateToList}>
            Concerts
          </Button>
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
            <Button
              type="button"
              variant="primary"
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
                  <i className="bi bi-check-circle me-2"></i>
                  <span className="btn-text">Enregistrer</span>
                </>
              )}
            </Button>
            
            <Button 
              onClick={onCancel} 
              variant="outline-secondary"
              className={`tc-btn-outline-secondary ${styles.actionBtn}`}
            >
              <i className="bi bi-x-circle me-2"></i>
              <span className="btn-text">Annuler</span>
            </Button>
            
            <Button 
              onClick={onDelete} 
              variant="outline-danger"
              className={`tc-btn-outline-danger ${styles.actionBtn}`}
            >
              <i className="bi bi-trash me-2"></i>
              <span className="btn-text">Supprimer</span>
            </Button>
          </>
        ) : (
          <>
            {/* Boutons en mode affichage */}
            <Button 
              onClick={navigateToList} 
              variant="outline-secondary"
              className={`tc-btn-outline-secondary ${styles.actionBtn}`}
            >
              <i className="bi bi-arrow-left me-2"></i>
              <span className="btn-text">Retour</span>
            </Button>
            
            <Button
              onClick={onEdit}
              variant="outline-primary"
              className={`tc-btn-outline-primary ${styles.actionBtn}`}
            >
              <i className="bi bi-pencil me-2"></i>
              <span className="btn-text">Modifier</span>
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default ConcertHeader;