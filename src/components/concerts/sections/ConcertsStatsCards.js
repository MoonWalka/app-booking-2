import React from 'react';
import styles from './ConcertsStatsCards.module.css';

const cards = [
  { key: 'total', label: 'Total des concerts', icon: <i className="bi bi-music-note-beamed"></i>, color: 'var(--tc-primary-color)' },
  { key: 'aVenir', label: 'À venir', icon: <i className="bi bi-calendar-event"></i>, color: 'var(--tc-success-color)' },
  { key: 'passes', label: 'Passés', icon: <i className="bi bi-calendar-check"></i>, color: 'var(--tc-gray-500)' },
];

const ConcertsStatsCards = ({ stats }) => (
  <div className={styles.statsCards}>
    {cards.map(card => (
      <div className={styles.statCard} key={card.key} style={{ borderColor: card.color }}>
        <span style={{ color: card.color, fontSize: '2.2rem' }}>{card.icon}</span>
        <div className={styles.statText}>
          <span className={styles.statValue}>{stats[card.key] || 0}</span>
          <span className={styles.statLabel}>{card.label}</span>
        </div>
      </div>
    ))}
  </div>
);

export default ConcertsStatsCards; 