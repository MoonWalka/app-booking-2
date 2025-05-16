import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './ConcertHeaderMobile.module.css';

/**
 * En-tête de la page de détails du concert pour mobile
 * Affiche le titre du concert, la date et le bouton de retour
 */
const ConcertHeaderMobile = ({ concert, formatDate, isEditMode, navigateToList }) => {
  // Déterminer le titre à afficher
  const headerTitle = 
    concert.titre && concert.titre.trim() !== '' 
      ? concert.titre 
      : concert.artisteName
        ? `Concert de ${concert.artisteName}` 
        : "Concert";

  return (
    <div className={styles.headerContainer}>
      <Button 
        variant="link" 
        className={styles.backButton} 
        onClick={navigateToList}
        aria-label="Retour à la liste des concerts"
      >
        <i className="bi bi-chevron-left"></i>
      </Button>
      
      <div className={styles.headerInfo}>
        <h1 className={styles.headerTitle}>
          {isEditMode ? 'Modifier le concert' : headerTitle}
        </h1>
        
        {concert.date && !isEditMode && (
          <div className={styles.concertDate}>
            <i className="bi bi-calendar-event me-1"></i> {formatDate(concert.date)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConcertHeaderMobile;