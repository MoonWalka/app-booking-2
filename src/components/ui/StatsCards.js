import React from 'react';
import PropTypes from 'prop-types';
import styles from './StatsCards.module.css';

/**
 * Composant générique pour afficher des cartes de statistiques
 * Compatible avec tous les types d'entités (artistes, contacts, concerts, etc.)
 */
const StatsCards = ({ stats }) => {
  if (!stats || stats.length === 0) return null;

  return (
    <div className={styles.statsContainer}>
      {stats.map((stat, index) => (
        <div 
          key={stat.id || index} 
          className={`${styles.statCard} ${styles[stat.variant] || ''}`}
        >
          <div className={styles.statIcon}>
            <i className={stat.icon || 'bi bi-info-circle'}></i>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statValue}>
              {typeof stat.value === 'function' ? stat.value() : stat.value}
            </div>
            {stat.subtext && (
              <div className={styles.statSubtext}>{stat.subtext}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

StatsCards.propTypes = {
  stats: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.func
    ]).isRequired,
    icon: PropTypes.string,
    variant: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info']),
    subtext: PropTypes.string
  }))
};

export default StatsCards;