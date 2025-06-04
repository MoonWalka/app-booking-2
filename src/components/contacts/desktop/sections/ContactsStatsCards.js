import React from 'react';
import styles from './ContactsStatsCards.module.css';

/**
 * Component to display statistics about contacts in card format
 * Harmonisé avec la maquette TourCraft
 */
const ContactsStatsCards = ({ stats }) => {
  if (!stats) return null;
  
  return (
    <div className={styles.statsContainer}>
      <div className={`${styles.statCard} ${styles.total}`}>
        <div className={styles.statIcon}>
          <i className="bi bi-people"></i>
        </div>
        <div className={styles.statContent}>
          <div className={styles.statLabel}>Contacts</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
      </div>
      
      {typeof stats.actifs === 'number' && (
        <div className={`${styles.statCard} ${styles.actifs}`}>
          <div className={styles.statIcon}>
            <i className="bi bi-person-check"></i>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Actifs</div>
            <div className={styles.statValue}>{stats.actifs}</div>
          </div>
        </div>
      )}
      
      {typeof stats.inactifs === 'number' && (
        <div className={`${styles.statCard} ${styles.inactifs}`}>
          <div className={styles.statIcon}>
            <i className="bi bi-person-x"></i>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Inactifs</div>
            <div className={styles.statValue}>{stats.inactifs}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsStatsCards; 