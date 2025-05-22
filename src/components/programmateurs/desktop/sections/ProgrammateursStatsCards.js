import React from 'react';
import styles from '../ProgrammateursList.module.css';

const ProgrammateursStatsCards = ({ stats }) => {
  if (!stats) return null;
  return (
    <div className={styles.statsCards}>
      <div className={styles.statCard}>
        <i className="bi bi-people fs-3 me-3 text-primary"></i>
        <div className={styles.statText}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Programmateurs</div>
        </div>
      </div>
      {typeof stats.actifs === 'number' && (
        <div className={styles.statCard}>
          <i className="bi bi-person-check fs-3 me-3 text-success"></i>
          <div className={styles.statText}>
            <div className={styles.statValue}>{stats.actifs}</div>
            <div className={styles.statLabel}>Actifs</div>
          </div>
        </div>
      )}
      {typeof stats.inactifs === 'number' && (
        <div className={styles.statCard}>
          <i className="bi bi-person-x fs-3 me-3 text-danger"></i>
          <div className={styles.statText}>
            <div className={styles.statValue}>{stats.inactifs}</div>
            <div className={styles.statLabel}>Inactifs</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammateursStatsCards; 