// src/components/artistes/sections/ArtistesStatsCards.js
import React from 'react';
import styles from './ArtistesStatsCards.module.css';

/**
 * Component to display artist statistics cards
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics object with total, avecConcerts, and sansConcerts counts
 */
const ArtistesStatsCards = ({ stats }) => {
  return (
    <div className="row mb-4">
      <div className="col-lg-4 mb-3 mb-lg-0">
        <div className={`card ${styles.statsCard} h-100 border-0 shadow-sm`}>
          <div className="card-body d-flex align-items-center p-4">
            <div className={`${styles.statsIcon} text-primary me-3`}>
              <i className="bi bi-people-fill fs-2"></i>
            </div>
            <div>
              <h3 className="stats-value fw-bold mb-1 text-primary">{stats.total}</h3>
              <div className="stats-label text-muted">Total artistes</div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4 mb-3 mb-lg-0">
        <div className={`card ${styles.statsCard} h-100 border-0 shadow-sm`}>
          <div className="card-body d-flex align-items-center p-4">
            <div className={`${styles.statsIcon} text-success me-3`}>
              <i className="bi bi-calendar-check fs-2"></i>
            </div>
            <div>
              <h3 className="stats-value fw-bold mb-1 text-success">{stats.avecConcerts}</h3>
              <div className="stats-label text-muted">Avec concerts</div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className={`card ${styles.statsCard} h-100 border-0 shadow-sm`}>
          <div className="card-body d-flex align-items-center p-4">
            <div className={`${styles.statsIcon} text-warning me-3`}>
              <i className="bi bi-calendar-x fs-2"></i>
            </div>
            <div>
              <h3 className="stats-value fw-bold mb-1 text-warning">{stats.sansConcerts}</h3>
              <div className="stats-label text-muted">Sans concerts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistesStatsCards;