import React from 'react';
import styles from './DatesStatsCards.module.css';

/**
 * Component to display statistics about dates in card format
 * Harmonisé avec la maquette TourCraft
 */
const DatesStatsCards = ({ stats }) => {
  return (
    <div className={styles.statsContainer}>
      <div className={`${styles.statCard} ${styles.total}`}>
        <div className={styles.statIcon}>
          <i className="bi bi-music-note-beamed"></i>
        </div>
        <div className={styles.statContent}>
          <div className={styles.statLabel}>Total des dates</div>
          <div className={styles.statValue}>{stats.total || 0}</div>
        </div>
      </div>
      
      <div className={`${styles.statCard} ${styles.aVenir}`}>
        <div className={styles.statIcon}>
          <i className="bi bi-calendar-event"></i>
        </div>
        <div className={styles.statContent}>
          <div className={styles.statLabel}>À venir</div>
          <div className={styles.statValue}>{stats.aVenir || 0}</div>
        </div>
      </div>
      
      <div className={`${styles.statCard} ${styles.passes}`}>
        <div className={styles.statIcon}>
          <i className="bi bi-calendar-check"></i>
        </div>
        <div className={styles.statContent}>
          <div className={styles.statLabel}>Passés</div>
          <div className={styles.statValue}>{stats.passes || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default DatesStatsCards; 