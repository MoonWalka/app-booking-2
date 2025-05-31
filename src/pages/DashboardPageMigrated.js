import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiOrgQuery } from '@/hooks/useMultiOrgQuery';
import Card from '@/components/ui/Card';
import styles from './DashboardMigrated.module.css';

/**
 * Dashboard migré vers le nouveau système de design unifié
 * Plus aucune dépendance à Bootstrap
 */
const DashboardPageMigrated = () => {
  const navigate = useNavigate();
  
  // Utilisation des hooks pour récupérer les données réelles
  const { data: concerts = [] } = useMultiOrgQuery('concerts', { limitCount: 5 });
  const { data: programmateurs = [] } = useMultiOrgQuery('programmateurs');
  const { data: lieux = [] } = useMultiOrgQuery('lieux');
  const { data: contrats = [] } = useMultiOrgQuery('contrats');
  
  // Stats calculées à partir des données réelles
  const stats = {
    concerts: concerts.length,
    programmateurs: programmateurs.length,
    lieux: lieux.length,
    contrats: contrats.length
  };
  
  // Concerts à venir (date future)
  const upcomingConcerts = concerts
    .filter(concert => new Date(concert.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);
  
  // Activité récente (simulation)
  const recentActivity = [
    { id: 1, type: 'lieu', action: 'Création du lieu "La Cigale"', date: new Date() },
    { id: 2, type: 'programmateur', action: 'Création du programmateur "Jean Dupont"', date: new Date() }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div 
          className={`${styles.statCard} ${styles.statCardPrimary}`}
          onClick={() => navigate('/concerts')}
        >
          <div className={styles.statIcon}>
            <i className="bi bi-music-note-beamed"></i>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stats.concerts}</h3>
            <p className={styles.statLabel}>Concerts</p>
            <p className={styles.statSubLabel}>à venir</p>
          </div>
        </div>
        
        <div 
          className={`${styles.statCard} ${styles.statCardSuccess}`}
          onClick={() => navigate('/programmateurs')}
        >
          <div className={styles.statIcon}>
            <i className="bi bi-people"></i>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stats.programmateurs}</h3>
            <p className={styles.statLabel}>Programmateurs</p>
            <p className={styles.statSubLabel}>actifs</p>
          </div>
        </div>
        
        <div 
          className={`${styles.statCard} ${styles.statCardInfo}`}
          onClick={() => navigate('/lieux')}
        >
          <div className={styles.statIcon}>
            <i className="bi bi-geo-alt"></i>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stats.lieux}</h3>
            <p className={styles.statLabel}>Lieux</p>
            <p className={styles.statSubLabel}>disponibles</p>
          </div>
        </div>
        
        <div 
          className={`${styles.statCard} ${styles.statCardWarning}`}
          onClick={() => navigate('/contrats')}
        >
          <div className={styles.statIcon}>
            <i className="bi bi-file-text"></i>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stats.contrats}</h3>
            <p className={styles.statLabel}>Contrats</p>
            <p className={styles.statSubLabel}>en cours</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Concerts à venir */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Concerts à venir</h2>
            <button 
              className={styles.linkButton}
              onClick={() => navigate('/concerts')}
            >
              Voir tout
            </button>
          </div>
          <div className={styles.cardBody}>
            {upcomingConcerts.length > 0 ? (
              <ul className={styles.concertsList}>
                {upcomingConcerts.map(concert => (
                  <li 
                    key={concert.id} 
                    className={styles.concertItem}
                    onClick={() => navigate(`/concerts/${concert.id}`)}
                  >
                    <div className={styles.concertInfo}>
                      <h4 className={styles.concertTitle}>{concert.titre}</h4>
                      <p className={styles.concertDetails}>
                        {concert.artiste?.nom} • {concert.lieu?.nom}
                      </p>
                    </div>
                    <div className={styles.concertDate}>
                      {new Date(concert.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyMessage}>Aucun concert à venir</p>
            )}
          </div>
        </div>

        {/* Activité récente */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Activité récente</h2>
            <button className={styles.linkButton}>
              Voir tout
            </button>
          </div>
          <div className={styles.cardBody}>
            <ul className={styles.activityList}>
              {recentActivity.map(activity => (
                <li key={activity.id} className={styles.activityItem}>
                  <div className={`${styles.activityIcon} ${styles[`activityIcon${activity.type}`]}`}>
                    <i className={`bi bi-${activity.type === 'lieu' ? 'geo-alt' : 'person'}`}></i>
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>{activity.action}</p>
                    <span className={styles.activityTime}>Il y a 2 heures</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Actions rapides</h2>
        <div className={styles.actionButtons}>
          <button 
            className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
            onClick={() => navigate('/concerts/nouveau')}
          >
            <i className="bi bi-plus-circle"></i>
            Nouveau concert
          </button>
          <button 
            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
            onClick={() => navigate('/programmateurs/nouveau')}
          >
            <i className="bi bi-person-plus"></i>
            Nouveau programmateur
          </button>
          <button 
            className={`${styles.actionButton} ${styles.actionButtonInfo}`}
            onClick={() => navigate('/lieux/nouveau')}
          >
            <i className="bi bi-geo-alt-fill"></i>
            Nouveau lieu
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageMigrated;