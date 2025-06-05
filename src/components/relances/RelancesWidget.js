import React, { useMemo } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import useRelances from '@/hooks/relances/useRelances';
import styles from './RelancesWidget.module.css';

/**
 * Widget compact pour afficher les relances liées à une entité spécifique
 * 
 * @param {string} entityType - Type d'entité (concert, contrat, contact, etc.)
 * @param {string} entityId - ID de l'entité
 * @param {string} entityName - Nom de l'entité pour l'affichage
 * @param {boolean} showAddButton - Afficher le bouton d'ajout
 * @param {Function} onAddRelance - Callback pour ajouter une relance
 */
const RelancesWidget = ({ 
  entityType, 
  entityId, 
  entityName,
  showAddButton = true,
  onAddRelance,
  className = ''
}) => {
  const { relances, loading } = useRelances();

  // Filtrer les relances pour cette entité spécifique
  const entityRelances = useMemo(() => {
    if (!entityType || !entityId) {
      return [];
    }
    
    return relances
      .filter(r => r.entityType === entityType && r.entityId === entityId)
      .sort((a, b) => new Date(a.dateEcheance) - new Date(b.dateEcheance));
  }, [relances, entityType, entityId]);

  // Calculer les relances actives et en retard
  const stats = useMemo(() => {
    const now = new Date();
    const pending = entityRelances.filter(r => r.status === 'pending');
    const overdue = pending.filter(r => new Date(r.dateEcheance) < now);
    
    return {
      total: entityRelances.length,
      pending: pending.length,
      overdue: overdue.length,
      completed: entityRelances.filter(r => r.status === 'completed').length
    };
  }, [entityRelances]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card className={`${styles.widget} ${className}`}>
        <div className={styles.loading}>Chargement des relances...</div>
      </Card>
    );
  }

  return (
    <Card 
      title="Relances"
      className={`${styles.widget} ${className}`}
      headerActions={
        showAddButton && onAddRelance && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAddRelance}
            icon={<span>➕</span>}
          >
            Ajouter
          </Button>
        )
      }
    >
      {/* Résumé des relances */}
      {stats.total > 0 && (
        <div className={styles.summary}>
          <span className={styles.stat}>
            <strong>{stats.pending}</strong> en attente
          </span>
          {stats.overdue > 0 && (
            <span className={`${styles.stat} ${styles.overdue}`}>
              <strong>{stats.overdue}</strong> en retard
            </span>
          )}
          <span className={styles.stat}>
            <strong>{stats.completed}</strong> complétée{stats.completed > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Liste des relances actives */}
      <div className={styles.relancesList}>
        {entityRelances.length === 0 ? (
          <p className={styles.emptyMessage}>Aucune relance pour {entityName}</p>
        ) : (
          entityRelances
            .filter(r => r.status === 'pending')
            .slice(0, 5) // Limiter à 5 relances pour le widget
            .map(relance => {
              const isOverdue = new Date(relance.dateEcheance) < new Date();
              
              return (
                <div 
                  key={relance.id} 
                  className={`${styles.relanceItem} ${isOverdue ? styles.overdueItem : ''}`}
                >
                  <div className={styles.relanceInfo}>
                    <h5 className={styles.relanceTitle}>{relance.titre}</h5>
                    <div className={styles.relanceMeta}>
                      <span className={styles.dueDate}>
                        📅 {formatDate(relance.dateEcheance)}
                      </span>
                      <Badge variant={getPriorityVariant(relance.priorite)}>
                        {getPriorityLabel(relance.priorite)}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
        )}
        
        {/* Afficher un lien vers toutes les relances si plus de 5 */}
        {entityRelances.filter(r => r.status === 'pending').length > 5 && (
          <div className={styles.moreLink}>
            <Button variant="link" size="sm">
              Voir toutes les relances ({entityRelances.filter(r => r.status === 'pending').length})
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RelancesWidget;