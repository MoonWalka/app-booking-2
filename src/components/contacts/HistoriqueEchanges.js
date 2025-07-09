// components/contacts/HistoriqueEchanges.js
import React, { useState } from 'react';
import { useHistoriqueEchanges } from '@/hooks/contacts/useHistoriqueEchanges';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Modal from '@/components/common/Modal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EchangeForm from './EchangeForm';
import EchangeItem from './EchangeItem';
import styles from './HistoriqueEchanges.module.css';

/**
 * Composant pour afficher et gérer l'historique des échanges avec un contact
 */
function HistoriqueEchanges({ contactId, dates = [] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEchange, setEditingEchange] = useState(null);
  const [filterType, setFilterType] = useState('tous');
  const [showOnlyRappels, setShowOnlyRappels] = useState(false);

  const {
    echanges,
    loading,
    error,
    isAddingEchange,
    addEchange,
    updateEchange,
    deleteEchange,
    markAsCompleted,
    setRappel,
    getStatistiques,
    TYPES_ECHANGES
  } = useHistoriqueEchanges(contactId);

  // Filtrer les échanges selon les critères
  const filteredEchanges = echanges.filter(echange => {
    if (filterType !== 'tous' && echange.type !== filterType) {
      return false;
    }
    if (showOnlyRappels && !echange.rappel) {
      return false;
    }
    return true;
  });

  // Statistiques
  const stats = getStatistiques();

  // Handlers
  const handleAddEchange = async (data) => {
    console.log('[HistoriqueEchanges] Ajout échange avec données:', data);
    const result = await addEchange(data);
    console.log('[HistoriqueEchanges] Résultat ajout:', result);
    if (result.success) {
      setShowAddModal(false);
    }
  };

  const handleEditEchange = async (data) => {
    if (!editingEchange) return;
    
    const result = await updateEchange(editingEchange.id, data);
    if (result.success) {
      setEditingEchange(null);
    }
  };

  const handleDeleteEchange = async (echangeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet échange ?')) {
      await deleteEchange(echangeId);
    }
  };

  if (loading && echanges.length === 0) {
    return <LoadingSpinner message="Chargement de l'historique..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <>
      <Card
        className={styles.historiqueCard}
        hasDropdown={true}
      >
      {/* Header avec statistiques et actions */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.stats}>
            <Badge variant="secondary" size="sm">
              <i className="bi bi-clock-history me-1"></i>
              {stats.total} échange{stats.total > 1 ? 's' : ''}
            </Badge>
            {stats.avecRappel > 0 && (
              <Badge variant="danger" size="sm">
                <i className="bi bi-bell me-1"></i>
                {stats.avecRappel} rappel{stats.avecRappel > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          disabled={isAddingEchange}
          icon={<i className="bi bi-plus-circle"></i>}
        >
          Nouvel échange
        </Button>
      </div>

      {/* Filtres */}
      <div className={styles.filters}>
        <select
          className={styles.typeFilter}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="tous">Tous les types</option>
          {Object.entries(TYPES_ECHANGES).map(([key, value]) => (
            <option key={key} value={value}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </option>
          ))}
        </select>

        <label className={styles.rappelFilter}>
          <input
            type="checkbox"
            checked={showOnlyRappels}
            onChange={(e) => setShowOnlyRappels(e.target.checked)}
          />
          <span>Avec rappel uniquement</span>
        </label>
      </div>

      {/* Liste des échanges */}
      <div className={styles.echangesList}>
        {filteredEchanges.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="bi bi-chat-left-dots"></i>
            </div>
            <h4>Aucun échange enregistré</h4>
            <p>
              {filterType !== 'tous' 
                ? `Aucun échange de type "${filterType}"` 
                : 'Commencez par ajouter un nouvel échange avec ce contact'}
            </p>
            {filterType === 'tous' && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowAddModal(true)}
                icon={<i className="bi bi-plus"></i>}
              >
                Ajouter le premier échange
              </Button>
            )}
          </div>
        ) : (
          <div className={styles.echangesList}>
            {filteredEchanges.map((echange) => (
              <EchangeItem
                key={echange.id}
                echange={echange}
                onEdit={() => setEditingEchange(echange)}
                onDelete={() => handleDeleteEchange(echange.id)}
                onMarkCompleted={() => markAsCompleted(echange.id)}
                onSetRappel={(date) => setRappel(echange.id, date)}
              />
            ))}
          </div>
        )}
      </div>
    </Card>

    {/* Modals rendues en dehors du Card pour éviter les problèmes de z-index */}
    <Modal
      isOpen={showAddModal}
      title="Nouvel échange"
      onClose={() => setShowAddModal(false)}
      size="medium"
    >
      <EchangeForm
        onSubmit={handleAddEchange}
        onCancel={() => setShowAddModal(false)}
        concerts={concerts}
        isSubmitting={isAddingEchange}
      />
    </Modal>

    <Modal
      isOpen={!!editingEchange}
      title="Modifier l'échange"
      onClose={() => setEditingEchange(null)}
      size="medium"
    >
      {editingEchange && (
        <EchangeForm
          echange={editingEchange}
          onSubmit={handleEditEchange}
          onCancel={() => setEditingEchange(null)}
          concerts={concerts}
        />
      )}
    </Modal>
    </>
  );
}

export default HistoriqueEchanges;