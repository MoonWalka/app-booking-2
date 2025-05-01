import React from 'react';
import styles from './LieuInfoSection.module.css';

/**
 * Additional information section for a venue
 */
const LieuInfoSection = ({ lieu }) => {
  // Fonction pour formater une date Firestore
  const formatDate = (firestoreDate) => {
    if (!firestoreDate) return 'Non disponible';
    
    // Si c'est un timestamp Firestore (avec seconds)
    if (firestoreDate.seconds) {
      return new Date(firestoreDate.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    // Si c'est une date JavaScript ou une chaîne ISO
    try {
      return new Date(firestoreDate).toLocaleDateString('fr-FR');
    } catch (e) {
      return 'Format de date invalide';
    }
  };

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-info-circle"></i>
        <h3>Informations supplémentaires</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>
            <i className="bi bi-calendar-check text-primary"></i>
            Créé le
          </div>
          <div className={styles.infoValue}>
            {formatDate(lieu.createdAt)}
          </div>
        </div>
        
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>
            <i className="bi bi-calendar-plus text-primary"></i>
            Dernière modification
          </div>
          <div className={styles.infoValue}>
            {formatDate(lieu.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LieuInfoSection;