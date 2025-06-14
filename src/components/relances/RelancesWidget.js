import React, { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/common/Modal';
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
  const [selectedRelance, setSelectedRelance] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filtrer les relances pour cette entité spécifique
  const entityRelances = useMemo(() => {
    if (!entityType || !entityId) {
      return [];
    }
    
    return relances
      .filter(r => r.entityType === entityType && r.entityId === entityId)
      .sort((a, b) => new Date(a.dateEcheance) - new Date(b.dateEcheance));
  }, [relances, entityType, entityId]);

  // Fonction utilitaire pour convertir les dates Firebase
  const parseFirebaseDate = (dateValue) => {
    if (!dateValue) return null;
    
    // Si c'est déjà une Date valide
    if (dateValue instanceof Date && !isNaN(dateValue)) {
      return dateValue;
    }
    
    // Si c'est un Timestamp Firebase
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
      return new Date(dateValue.seconds * 1000);
    }
    
    // Si c'est une chaîne ISO
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed) ? null : parsed;
    }
    
    return null;
  };

  // Calculer les relances actives et en retard
  const stats = useMemo(() => {
    const now = new Date();
    const pending = entityRelances.filter(r => {
      return r.status === 'pending' || (!r.status && !r.terminee);
    });
    const overdue = pending.filter(r => {
      const dueDate = parseFirebaseDate(r.dateEcheance);
      return dueDate && dueDate < now;
    });
    
    return {
      total: entityRelances.length,
      pending: pending.length,
      overdue: overdue.length,
      completed: entityRelances.filter(r => {
        return r.status === 'completed' || r.terminee === true;
      }).length
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleRelanceClick = (relance) => {
    setSelectedRelance(relance);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRelance(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <Card className={`${styles.widget} ${className}`}>
        <div className={styles.loading}>Chargement des relances...</div>
      </Card>
    );
  }

  return (
    <>
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
            .filter(r => r.status === 'pending' || (!r.status && !r.terminee))
            .slice(0, 5) // Limiter à 5 relances pour le widget
            .map(relance => {
              const dueDate = parseFirebaseDate(relance.dateEcheance);
              const isOverdue = dueDate && dueDate < new Date();
              
              return (
                <div 
                  key={relance.id} 
                  className={`${styles.relanceItem} ${isOverdue ? styles.overdueItem : ''} ${styles.clickable}`}
                  onClick={() => handleRelanceClick(relance)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleRelanceClick(relance);
                    }
                  }}
                >
                  <div className={styles.relanceInfo}>
                    <h5 className={styles.relanceTitle}>
                      {relance.nom || relance.titre}
                      {relance.automatique && (
                        <Badge variant="info" size="sm" className={styles.autoBadge}>
                          Auto
                        </Badge>
                      )}
                    </h5>
                    <div className={styles.relanceMeta}>
                      <span className={styles.dueDate}>
                        📅 {dueDate ? dueDate.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'Date non définie'}
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
        {entityRelances.filter(r => r.status === 'pending' || (!r.status && !r.terminee)).length > 5 && (
          <div className={styles.moreLink}>
            <Button variant="link" size="sm">
              Voir toutes les relances ({entityRelances.filter(r => r.status === 'pending' || (!r.status && !r.terminee)).length})
            </Button>
          </div>
        )}
      </div>
    </Card>

    {/* Modale de détails de la relance */}
    {showModal && selectedRelance && (
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={`Détails de la relance${selectedRelance.automatique ? ' automatique' : ''}`}
      >
        <div className={styles.relanceDetails}>
          <div className={styles.detailGroup}>
            <label className={styles.detailLabel}>Titre</label>
            <div className={styles.detailValue}>
              {selectedRelance.nom || selectedRelance.titre}
            </div>
          </div>

          <div className={styles.detailGroup}>
            <label className={styles.detailLabel}>Description</label>
            <div className={styles.detailValue}>
              {selectedRelance.description || 'Aucune description'}
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailGroup}>
              <label className={styles.detailLabel}>Date d'échéance</label>
              <div className={styles.detailValue}>
                {(() => {
                  const date = parseFirebaseDate(selectedRelance.dateEcheance);
                  return date ? date.toLocaleDateString('fr-FR') : 'Date non définie';
                })()}
              </div>
            </div>

            <div className={styles.detailGroup}>
              <label className={styles.detailLabel}>Priorité</label>
              <div className={styles.detailValue}>
                <Badge variant={getPriorityVariant(selectedRelance.priorite)}>
                  {getPriorityLabel(selectedRelance.priorite)}
                </Badge>
              </div>
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailGroup}>
              <label className={styles.detailLabel}>Statut</label>
              <div className={styles.detailValue}>
                {(() => {
                  const isCompleted = selectedRelance.status === 'completed' || selectedRelance.terminee === true;
                  const dueDate = parseFirebaseDate(selectedRelance.dateEcheance);
                  const isOverdue = dueDate && dueDate < new Date();
                  
                  if (isCompleted) {
                    return <Badge variant="success">Terminée</Badge>;
                  } else if (isOverdue) {
                    return <Badge variant="danger">En retard</Badge>;
                  } else {
                    return <Badge variant="warning">En cours</Badge>;
                  }
                })()}
              </div>
            </div>

            <div className={styles.detailGroup}>
              <label className={styles.detailLabel}>Type</label>
              <div className={styles.detailValue}>
                {selectedRelance.automatique ? (
                  <Badge variant="info">Automatique</Badge>
                ) : (
                  <Badge variant="secondary">Manuelle</Badge>
                )}
              </div>
            </div>
          </div>

          {selectedRelance.entityName && (
            <div className={styles.detailGroup}>
              <label className={styles.detailLabel}>Liée à</label>
              <div className={styles.detailValue}>
                {selectedRelance.entityName} ({selectedRelance.entityType})
              </div>
            </div>
          )}

          <div className={styles.detailGroup}>
            <label className={styles.detailLabel}>Date de création</label>
            <div className={styles.detailValue}>
              {formatDateTime(selectedRelance.dateCreation?.seconds 
                ? new Date(selectedRelance.dateCreation.seconds * 1000).toISOString()
                : selectedRelance.dateCreation
              )}
            </div>
          </div>

          {selectedRelance.terminee && selectedRelance.dateTerminee && (
            <>
              <div className={styles.detailGroup}>
                <label className={styles.detailLabel}>Date de fin</label>
                <div className={styles.detailValue}>
                  {formatDateTime(selectedRelance.dateTerminee?.seconds 
                    ? new Date(selectedRelance.dateTerminee.seconds * 1000).toISOString()
                    : selectedRelance.dateTerminee
                  )}
                </div>
              </div>

              {selectedRelance.commentaireFin && (
                <div className={styles.detailGroup}>
                  <label className={styles.detailLabel}>Commentaire de fin</label>
                  <div className={styles.detailValue}>
                    {selectedRelance.commentaireFin}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Métadonnées pour les relances automatiques */}
          {selectedRelance.automatique && selectedRelance.metadata && (
            <div className={styles.detailGroup}>
              <label className={styles.detailLabel}>Informations complémentaires</label>
              <div className={styles.detailValue}>
                {selectedRelance.metadata.artisteNom && (
                  <div>Artiste : {selectedRelance.metadata.artisteNom}</div>
                )}
                {selectedRelance.metadata.lieuNom && (
                  <div>Lieu : {selectedRelance.metadata.lieuNom}</div>
                )}
                {selectedRelance.metadata.concertDate && (
                  <div>Date du concert : {formatDate(selectedRelance.metadata.concertDate)}</div>
                )}
              </div>
            </div>
          )}

          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={handleCloseModal}>
              Fermer
            </Button>
          </div>
        </div>
      </Modal>
    )}
    </>
  );
};

export default RelancesWidget;