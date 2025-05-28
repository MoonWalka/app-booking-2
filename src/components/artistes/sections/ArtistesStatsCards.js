// src/components/artistes/sections/ArtistesStatsCards.js
import React from 'react';
import styles from './ArtistesStatsCards.module.css';

/**
 * Component to display statistics about artistes in card format
 * Harmonisé avec la maquette TourCraft
 */
const ArtistesStatsCards = ({ stats }) => {
  return (
    <div className={styles.statsContainer}>
      <div className={`${styles.statCard} ${styles.total}`}>
        <div className={styles.statIcon}>
          <i className="bi bi-people-fill"></i>
        </div>
        <div className={styles.statContent}>
          <div className={styles.statLabel}>Total artistes</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
      </div>
      
      <div className={`${styles.statCard} ${styles.avecConcerts}`}>
        <div className={styles.statIcon}>
          <i className="bi bi-calendar-check"></i>
        </div>
        <div className={styles.statContent}>
          <div className={styles.statLabel}>Avec concerts</div>
          <div className={styles.statValue}>{stats.avecConcerts}</div>
        </div>
      </div>
      
      <div className={`${styles.statCard} ${styles.sansConcerts}`}>
        <div className={styles.statIcon}>
          <i className="bi bi-calendar-x"></i>
        </div>
        <div className={styles.statContent}>
          <div className={styles.statLabel}>Sans concerts</div>
          <div className={styles.statValue}>{stats.sansConcerts}</div>
        </div>
      </div>
    </div>
  );
};

export default ArtistesStatsCards;