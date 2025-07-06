import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './DateHeaderMobile.module.css';

/**
 * En-tête de la page de détails du date pour mobile
 * Affiche le titre du date, la date et le bouton de retour
 */
const DateHeaderMobile = ({ date, formatDate, isEditMode, navigateToList }) => {
  // Déterminer le titre à afficher
  const headerTitle = 
    date.titre && date.titre.trim() !== '' 
      ? date.titre 
      : date.artisteName
        ? `Date de ${date.artisteName}` 
        : "Date";

  return (
    <div className={styles.headerContainer}>
      <Button 
        variant="link" 
        className={styles.backButton} 
        onClick={navigateToList}
        aria-label="Retour à la liste des dates"
      >
        <i className="bi bi-chevron-left"></i>
      </Button>
      
      <div className={styles.headerInfo}>
        <h1 className={styles.headerTitle}>
          {isEditMode ? 'Modifier le date' : headerTitle}
        </h1>
        
        {date.date && !isEditMode && (
          <div className={styles.dateDate}>
            <i className="bi bi-calendar-event me-1"></i> {formatDate(date.date)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateHeaderMobile;