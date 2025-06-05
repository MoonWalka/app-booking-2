import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import useRelances from '@/hooks/relances/useRelances';
import styles from './RelancesNotification.module.css';

/**
 * Composant de notification pour les relances
 * Affiche le nombre de relances en retard et à venir
 */
const RelancesNotification = () => {
  const navigate = useNavigate();
  const { relances } = useRelances();
  const [showDropdown, setShowDropdown] = useState(false);

  // Calculer les relances importantes
  const { overdueRelances, todayRelances, upcomingRelances } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const inThreeDays = new Date(now);
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const active = relances.filter(r => r.status === 'pending');
    
    return {
      overdueRelances: active.filter(r => new Date(r.dateEcheance) < now),
      todayRelances: active.filter(r => {
        const dueDate = new Date(r.dateEcheance);
        return dueDate >= now && dueDate < tomorrow;
      }),
      upcomingRelances: active.filter(r => {
        const dueDate = new Date(r.dateEcheance);
        return dueDate >= tomorrow && dueDate < inThreeDays;
      })
    };
  }, [relances]);

  const totalImportant = overdueRelances.length + todayRelances.length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} jours de retard`;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    return `Dans ${diffDays} jours`;
  };

  const handleNavigateToDashboard = () => {
    navigate('/');
    setShowDropdown(false);
  };

  return (
    <div className={styles.notificationContainer}>
      <Button
        variant="secondary"
        size="sm"
        iconOnly
        icon={<span>🔔</span>}
        onClick={() => setShowDropdown(!showDropdown)}
        className={styles.notificationButton}
      >
        {totalImportant > 0 && (
          <span className={styles.badge}>
            {totalImportant}
          </span>
        )}
      </Button>

      {showDropdown && (
        <>
          <div 
            className={styles.overlay} 
            onClick={() => setShowDropdown(false)}
          />
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <h4>Relances</h4>
              <Button
                variant="link"
                size="sm"
                onClick={handleNavigateToDashboard}
              >
                Voir tout
              </Button>
            </div>

            <div className={styles.dropdownContent}>
              {/* Relances en retard */}
              {overdueRelances.length > 0 && (
                <div className={styles.section}>
                  <h5 className={styles.sectionTitle}>
                    <span className={styles.overdueIcon}>⚠️</span> En retard ({overdueRelances.length})
                  </h5>
                  <div className={styles.relancesList}>
                    {overdueRelances.slice(0, 3).map(relance => (
                      <div key={relance.id} className={`${styles.relanceItem} ${styles.overdue}`}>
                        <div className={styles.relanceTitle}>{relance.titre}</div>
                        <div className={styles.relanceMeta}>
                          <span className={styles.entityName}>
                            {relance.entityName || 'Général'}
                          </span>
                          <span className={styles.dueInfo}>
                            {formatDate(relance.dateEcheance)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {overdueRelances.length > 3 && (
                      <div className={styles.moreItems}>
                        +{overdueRelances.length - 3} autres en retard
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Relances d'aujourd'hui */}
              {todayRelances.length > 0 && (
                <div className={styles.section}>
                  <h5 className={styles.sectionTitle}>
                    <span>📅</span> Aujourd'hui ({todayRelances.length})
                  </h5>
                  <div className={styles.relancesList}>
                    {todayRelances.slice(0, 3).map(relance => (
                      <div key={relance.id} className={styles.relanceItem}>
                        <div className={styles.relanceTitle}>{relance.titre}</div>
                        <div className={styles.relanceMeta}>
                          <span className={styles.entityName}>
                            {relance.entityName || 'Général'}
                          </span>
                          <Badge variant={
                            relance.priorite === 'high' ? 'danger' : 
                            relance.priorite === 'medium' ? 'warning' : 'info'
                          }>
                            {relance.priorite === 'high' ? 'Haute' : 
                             relance.priorite === 'medium' ? 'Moyenne' : 'Basse'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relances à venir */}
              {upcomingRelances.length > 0 && (
                <div className={styles.section}>
                  <h5 className={styles.sectionTitle}>
                    <span>📆</span> Prochainement ({upcomingRelances.length})
                  </h5>
                  <div className={styles.relancesList}>
                    {upcomingRelances.slice(0, 2).map(relance => (
                      <div key={relance.id} className={styles.relanceItem}>
                        <div className={styles.relanceTitle}>{relance.titre}</div>
                        <div className={styles.relanceMeta}>
                          <span className={styles.entityName}>
                            {relance.entityName || 'Général'}
                          </span>
                          <span className={styles.dueInfo}>
                            {formatDate(relance.dateEcheance)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message si aucune relance */}
              {totalImportant === 0 && upcomingRelances.length === 0 && (
                <div className={styles.emptyState}>
                  <p>Aucune relance en attente</p>
                </div>
              )}
            </div>

            <div className={styles.dropdownFooter}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNavigateToDashboard}
                className={styles.fullWidthButton}
              >
                Gérer toutes les relances
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RelancesNotification;