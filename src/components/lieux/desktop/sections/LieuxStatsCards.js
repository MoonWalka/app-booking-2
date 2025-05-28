import React from 'react';
import styles from './LieuxStatsCards.module.css';

/**
 * Component to display statistics about venues in card format
 * Harmonisé avec la maquette TourCraft
 */
const LieuxStatsCards = ({ stats }) => {
  return (
    <div className={styles.statsContainer}>
      <div className={`${styles.statCard} ${styles.total}`}>
        <div className={styles.statIcon}>
          <i className="bi bi-geo-alt"></i>
        </div>
        <div className={styles.statContent}>
          <div className={styles.statLabel}>Total des lieux</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
      </div>
      
      <div className={`${styles.statCard} ${styles.avecConcerts}`}>
        <div className={styles.statIcon}>
          <i className="bi bi-music-note-beamed"></i>
        </div>
        <div className={styles.statContent}>
          <div className={styles.statLabel}>Avec concerts</div>
          <div className={styles.statValue}>{stats.avecConcerts}</div>
        </div>
      </div>
      
      <div className={`${styles.statCard} ${styles.sansConcerts}`}>
        <div className={styles.statIcon}>
          <i className="bi bi-x-circle"></i>
        </div>
        <div className={styles.statContent}>
          <div className={styles.statLabel}>Sans concerts</div>
          <div className={styles.statValue}>{stats.sansConcerts}</div>
        </div>
      </div>
      
      {stats.festivals > 0 && (
        <div className={`${styles.statCard} ${styles.festivals}`}>
          <div className={styles.statIcon}>
            <i className="bi bi-ticket-perforated"></i>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Festivals</div>
            <div className={styles.statValue}>{stats.festivals}</div>
          </div>
        </div>
      )}
      
      {stats.salles > 0 && (
        <div className={`${styles.statCard} ${styles.salles}`}>
          <div className={styles.statIcon}>
            <i className="bi bi-building"></i>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Salles</div>
            <div className={styles.statValue}>{stats.salles}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LieuxStatsCards;