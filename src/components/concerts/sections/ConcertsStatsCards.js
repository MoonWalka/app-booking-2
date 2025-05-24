import React from 'react';
import styles from './ConcertsStatsCards.module.css';

const cards = [
  { key: 'total', label: 'Total des concerts', icon: <i className="bi bi-music-note-beamed"></i>, colorType: 'primary' },
  { key: 'aVenir', label: 'À venir', icon: <i className="bi bi-calendar-event"></i>, colorType: 'success' },
  { key: 'passes', label: 'Passés', icon: <i className="bi bi-calendar-check"></i>, colorType: 'muted' },
];

const ConcertsStatsCards = ({ stats }) => (
  <div className={styles.statsCards}>
    {cards.map(card => (
      <div 
        className={styles.statCard} 
        key={card.key} 
        data-color={card.colorType}
      >
        <span 
          className={styles.statIcon}
          data-color={card.colorType}
        >
          {card.icon}
        </span>
        <div className={styles.statText}>
          <span className={styles.statValue}>{stats[card.key] || 0}</span>
          <span className={styles.statLabel}>{card.label}</span>
        </div>
      </div>
    ))}
  </div>
);

export default ConcertsStatsCards; 