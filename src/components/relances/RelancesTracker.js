import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/common/Modal';
import Alert from '@/components/ui/Alert';
import EntitySelector from '@/components/ui/EntitySelector';
import StatsCards from '@/components/ui/StatsCards';
import Table from '@/components/ui/Table';
import useRelances from '@/hooks/relances/useRelances';
import useRelanceForm from '@/hooks/relances/useRelanceForm';
import styles from './RelancesTracker.module.css';

/**
 * Composant de suivi des relances
 * Permet de gérer et suivre les relances pour différentes entités (concerts, contrats, etc.)
 */
const RelancesTracker = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRelance, setSelectedRelance] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, overdue, completed
  
  const { 
    relances, 
    loading, 
    error,
    updateRelanceStatus,
    deleteRelance
  } = useRelances();

  const {
    formData,
    setFormData,
    saveRelance,
    resetForm
  } = useRelanceForm();

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

  // Filtrer les relances selon le statut sélectionné
  const filteredRelances = relances.filter(relance => {
    if (filter === 'all') return true;
    
    // Gérer les relances manuelles et automatiques
    const isPending = relance.status === 'pending' || (!relance.status && !relance.terminee);
    const isCompleted = relance.status === 'completed' || relance.terminee === true;
    
    if (filter === 'pending') return isPending;
    if (filter === 'overdue') {
      const now = new Date();
      const dueDate = parseFirebaseDate(relance.dateEcheance);
      return isPending && dueDate && dueDate < now;
    }
    if (filter === 'completed') return isCompleted;
    return true;
  });

  // Gérer l'ajout/modification d'une relance
  const handleSaveRelance = async () => {
    try {
      await saveRelance(selectedRelance?.id);
      setShowAddModal(false);
      setSelectedRelance(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la relance:', error);
    }
  };

  // Marquer une relance comme complétée
  const handleCompleteRelance = async (relanceId) => {
    try {
      await updateRelanceStatus(relanceId, 'completed');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la relance:', error);
    }
  };

  // Ouvrir le modal d'édition
  const handleEditRelance = (relance) => {
    setSelectedRelance(relance);
    setFormData({
      titre: relance.titre,
      description: relance.description,
      dateEcheance: relance.dateEcheance,
      priorite: relance.priorite,
      entityType: relance.entityType,
      entityId: relance.entityId,
      entityName: relance.entityName
    });
    setShowAddModal(true);
  };

  // Calculer les statistiques
  const stats = {
    total: relances.length,
    pending: relances.filter(r => {
      return r.status === 'pending' || (!r.status && !r.terminee);
    }).length,
    overdue: relances.filter(r => {
      const now = new Date();
      const dueDate = parseFirebaseDate(r.dateEcheance);
      const isPending = r.status === 'pending' || (!r.status && !r.terminee);
      return isPending && dueDate && dueDate < now;
    }).length,
    completed: relances.filter(r => {
      return r.status === 'completed' || r.terminee === true;
    }).length
  };

  // Préparer les données pour StatsCards
  const statsCardsData = [
    {
      id: 'total',
      label: 'Total',
      value: stats.total,
      icon: 'bi bi-list-check',
      variant: 'primary'
    },
    {
      id: 'pending',
      label: 'En attente',
      value: stats.pending,
      icon: 'bi bi-clock',
      variant: 'info'
    },
    {
      id: 'overdue',
      label: 'En retard',
      value: stats.overdue,
      icon: 'bi bi-exclamation-triangle',
      variant: 'danger'
    },
    {
      id: 'completed',
      label: 'Complétées',
      value: stats.completed,
      icon: 'bi bi-check-circle',
      variant: 'success'
    }
  ];

  if (loading) {
    return <div className={styles.loadingContainer}>Chargement des relances...</div>;
  }

  if (error) {
    return <Alert variant="danger">Erreur lors du chargement des relances: {error.message}</Alert>;
  }

  // Configuration des colonnes pour le tableau
  const columns = [
    {
      key: 'titre',
      label: 'Titre',
      sortable: true,
      render: (relance) => {
        const isCompleted = relance.status === 'completed';
        return (
          <div className={isCompleted ? styles.completedText : ''}>
            <strong>
              {relance.titre || relance.nom}
              {relance.automatique && (
                <Badge variant="info" size="sm" className={styles.autoBadge}>
                  Auto
                </Badge>
              )}
            </strong>
            {relance.description && (
              <div className={styles.descriptionText}>{relance.description}</div>
            )}
          </div>
        );
      }
    },
    {
      key: 'priorite',
      label: 'Priorité',
      render: (relance) => {
        const getPriorityColor = (priority) => {
          switch (priority) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'secondary';
          }
        };
        return (
          <Badge variant={getPriorityColor(relance.priorite)} size="sm">
            {relance.priorite === 'high' ? 'Haute' : 
             relance.priorite === 'medium' ? 'Moyenne' : 'Basse'}
          </Badge>
        );
      }
    },
    {
      key: 'entityInfo',
      label: 'Entité',
      render: (relance) => (
        <span className={styles.entityInfo}>
          <i className={`bi ${
            relance.entityType === 'concerts' ? 'bi-music-note' : 
            relance.entityType === 'contrats' ? 'bi-file-text' : 
            relance.entityType === 'contacts' ? 'bi-person' : 
            relance.entityType === 'lieux' ? 'bi-geo-alt' :
            relance.entityType === 'structures' ? 'bi-building' : 'bi-tag'
          }`}></i>
          {relance.entityName || 'Sans entité'}
        </span>
      )
    },
    {
      key: 'dateEcheance',
      label: 'Échéance',
      sortable: true,
      render: (relance) => {
        const now = new Date();
        const dueDate = parseFirebaseDate(relance.dateEcheance);
        const isPending = relance.status === 'pending' || (!relance.status && !relance.terminee);
        const isCompleted = relance.status === 'completed' || relance.terminee === true;
        const isOverdue = isPending && dueDate && dueDate < now;
        
        const formatDate = (date) => {
          if (!date) return 'Date non définie';
          return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        };
        
        const getDaysRemaining = () => {
          if (isCompleted || !dueDate) return null;
          const diffTime = dueDate - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) return `${Math.abs(diffDays)} jours de retard`;
          if (diffDays === 0) return "Aujourd'hui";
          if (diffDays === 1) return "Demain";
          return `Dans ${diffDays} jours`;
        };
        
        return (
          <span className={isOverdue ? styles.overdueDue : ''}>
            <i className="bi bi-calendar"></i> {formatDate(dueDate)}
            {!isCompleted && <div className={styles.daysRemaining}>{getDaysRemaining()}</div>}
          </span>
        );
      }
    }
  ];

  // Fonction pour rendre les actions
  const renderActions = (relance) => {
    const isCompleted = relance.status === 'completed' || relance.terminee === true;
    
    return (
      <div className={styles.actionButtons}>
        {!isCompleted && (
          <button
            className={`${styles.actionButton} ${styles.success}`}
            onClick={(e) => {
              e.stopPropagation();
              handleCompleteRelance(relance.id);
            }}
            title="Marquer comme terminée"
          >
            <i className="bi bi-check-lg"></i>
          </button>
        )}
        {!relance.automatique && (
          <button
            className={`${styles.actionButton} ${styles.secondary}`}
            onClick={(e) => {
              e.stopPropagation();
              handleEditRelance(relance);
            }}
            title="Modifier"
          >
            <i className="bi bi-pencil"></i>
          </button>
        )}
        {!relance.automatique && (
          <button
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Êtes-vous sûr de vouloir supprimer cette relance ?')) {
                deleteRelance(relance.id);
              }
            }}
            title="Supprimer"
          >
            <i className="bi bi-trash"></i>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.relancesContainer}>
      {/* En-tête avec statistiques */}
      <div className={styles.header}>
        <h2>
          <i className="bi bi-bell"></i>
          Suivi des relances
        </h2>
        <Button 
          variant="primary"
          onClick={() => {
            resetForm();
            setSelectedRelance(null);
            setShowAddModal(true);
          }}
          icon={<i className="bi bi-plus"></i>}
        >
          Nouvelle relance
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <StatsCards stats={statsCardsData} />

      {/* Filtres */}
      <div className={styles.filters}>
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Toutes ({stats.total})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          En attente ({stats.pending})
        </Button>
        <Button
          variant={filter === 'overdue' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('overdue')}
        >
          En retard ({stats.overdue})
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Complétées ({stats.completed})
        </Button>
      </div>

      {/* Liste des relances */}
      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          data={filteredRelances}
          renderActions={renderActions}
          sortField="dateEcheance"
          sortDirection="asc"
          onRowClick={(relance) => {
            // Ouvrir la modale appropriée selon le type de relance
            if (relance.automatique) {
              // Pour les relances automatiques, ouvrir en lecture seule
              setSelectedRelance(relance);
              setShowDetailModal(true);
            } else {
              // Pour les relances manuelles, ouvrir en édition
              handleEditRelance(relance);
            }
          }}
          rowClassName={(relance) => relance.automatique ? styles.automaticRelance : ''}
        />
      </div>

      {/* Modal d'ajout/édition */}
      {showAddModal && (
        <RelanceFormModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedRelance(null);
            resetForm();
          }}
          onSave={handleSaveRelance}
          formData={formData}
          setFormData={setFormData}
          isEditing={!!selectedRelance}
        />
      )}

      {/* Modal de détails pour les relances automatiques */}
      {showDetailModal && selectedRelance && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRelance(null);
          }}
          title={`Détails de la relance automatique`}
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
                  <Badge variant={
                    selectedRelance.priorite === 'high' ? 'danger' :
                    selectedRelance.priorite === 'medium' ? 'warning' : 'info'
                  }>
                    {selectedRelance.priorite === 'high' ? 'Haute' :
                     selectedRelance.priorite === 'medium' ? 'Moyenne' : 'Basse'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className={styles.detailGroup}>
              <label className={styles.detailLabel}>Liée à</label>
              <div className={styles.detailValue}>
                {selectedRelance.entityName} ({selectedRelance.entityType})
              </div>
            </div>

            <div className={styles.detailGroup}>
              <label className={styles.detailLabel}>Type de relance</label>
              <div className={styles.detailValue}>
                <Badge variant="info">Automatique - {selectedRelance.type}</Badge>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => {
                setShowDetailModal(false);
                setSelectedRelance(null);
              }}>
                Fermer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


/**
 * Modal de formulaire pour ajouter/éditer une relance
 */
const RelanceFormModal = ({ isOpen, onClose, onSave, formData, setFormData, isEditing }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  // Mémoriser l'objet filters vide pour éviter les re-renders
  const emptyFilters = React.useMemo(() => ({}), []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier la relance' : 'Nouvelle relance'}
    >
      <form onSubmit={handleSubmit} className={styles.relanceForm}>
        <div className={styles.formGroup}>
          <label htmlFor="titre">Titre *</label>
          <input
            type="text"
            id="titre"
            value={formData.titre}
            onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
            required
            className={styles.formControl}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className={styles.formControl}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="dateEcheance">Date d'échéance *</label>
            <input
              type="date"
              id="dateEcheance"
              value={formData.dateEcheance}
              onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
              required
              className={styles.formControl}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="priorite">Priorité *</label>
            <select
              id="priorite"
              value={formData.priorite}
              onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
              required
              className={styles.formControl}
            >
              <option value="">Sélectionner</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="entityType">Type d'entité</label>
          <select
            id="entityType"
            value={formData.entityType}
            onChange={(e) => setFormData({ 
              ...formData, 
              entityType: e.target.value,
              entityId: null,
              entityName: ''
            })}
            className={styles.formControl}
          >
            <option value="">Aucune</option>
            <option value="concerts">Concert</option>
            <option value="contrats">Contrat</option>
            <option value="contacts">Contact</option>
            <option value="lieux">Lieu</option>
            <option value="structures">Structure</option>
          </select>
        </div>

        {formData.entityType && (
          <div className={styles.formGroup}>
            <EntitySelector
              entityType={formData.entityType}
              label="Sélectionner l'entité"
              selectedEntity={formData.entityId ? { 
                id: formData.entityId, 
                nom: formData.entityName,
                titre: formData.entityName,
                raisonSociale: formData.entityName,
                reference: formData.entityName
              } : null}
              onSelect={(entity) => {
                if (entity) {
                  const displayName = entity.nom || entity.titre || entity.raisonSociale || entity.reference || 'Sans nom';
                  setFormData({ 
                    ...formData, 
                    entityId: entity.id,
                    entityName: displayName
                  });
                } else {
                  setFormData({ 
                    ...formData, 
                    entityId: null,
                    entityName: ''
                  });
                }
              }}
              filters={emptyFilters} // Passer un objet vide stable
              placeholder="Rechercher une entité..."
              allowClear={true}
            />
          </div>
        )}

        <div className={styles.formActions}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" type="submit">
            {isEditing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RelancesTracker;