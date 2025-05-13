// src/components/artistes/sections/ArtistesStatsCards.js
import React from 'react';
import styles from './ArtistesStatsCards.module.css';
import Card from '@/components/ui/Card';

/**
 * Component to display artist statistics cards
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics object with total, avecConcerts, and sansConcerts counts
 */
const ArtistesStatsCards = ({ stats }) => {
  // Création d'une carte statistique réutilisable
  const StatCard = ({ value, label, icon, color }) => {
    return (
      <Card
        className={`${styles.statsCard} h-100 border-0 shadow-sm`}
        variant={color}
        isHoverable={false}
      >
        <div className="d-flex align-items-center">
          <div className={`${styles.statsIcon} text-${color} me-3`}>
            <i className={`bi bi-${icon} fs-2`}></i>
          </div>
          <div>
            <h3 className={`stats-value fw-bold mb-1 text-${color}`}>{value}</h3>
            <div className="stats-label text-muted">{label}</div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="row mb-4">
      <div className="col-lg-4 mb-3 mb-lg-0">
        <StatCard
          value={stats.total}
          label="Total artistes"
          icon="people-fill"
          color="primary"
        />
      </div>
      <div className="col-lg-4 mb-3 mb-lg-0">
        <StatCard
          value={stats.avecConcerts}
          label="Avec concerts"
          icon="calendar-check"
          color="success"
        />
      </div>
      <div className="col-lg-4">
        <StatCard
          value={stats.sansConcerts}
          label="Sans concerts"
          icon="calendar-x"
          color="warning"
        />
      </div>
    </div>
  );
};

export default ArtistesStatsCards;