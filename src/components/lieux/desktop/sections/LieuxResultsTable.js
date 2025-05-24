import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@ui/Button';
import Table from '@/components/ui/Table';
import styles from './LieuxResultsTable.module.css';

/**
 * Component for displaying the table of lieux (utilise le composant Table commun)
 */
const LieuxResultsTable = ({ lieux, onDeleteLieu }) => {
  const navigate = useNavigate();

  // Colonnes pour le composant Table commun
  const columns = [
    {
      label: 'Nom',
      key: 'nom',
      sortable: true,
      render: (lieu) => (
        <div className="d-flex align-items-center fw-medium">
          <i className="bi bi-geo-alt me-2 text-primary"></i>
          {lieu.nom}
        </div>
      )
    },
    {
      label: 'Type',
      key: 'type',
      sortable: true,
      render: (lieu) => lieu.type ? lieu.type : <span className="text-muted">Non spécifié</span>
    },
    {
      label: 'Ville / Code postal',
      key: 'ville',
      sortable: true,
      render: (lieu) => (
        <span className={styles.villeBadge}>
          {lieu.ville} {lieu.codePostal && `(${lieu.codePostal})`}
        </span>
      )
    },
    {
      label: 'Jauge',
      key: 'capacite',
      sortable: true,
      render: (lieu) => lieu.capacite ? `${lieu.capacite} pers.` : <span className="text-muted">Non spécifiée</span>
    },
    {
      label: 'Concerts',
      key: 'concertsCount',
      sortable: false,
      render: (lieu) => (
        <span className={styles.concertCount}>
          <i className="bi bi-music-note-beamed me-1"></i>
          {lieu.concertsCount || 0} concerts
        </span>
      )
    }
  ];

  // Actions par ligne
  const renderActions = (lieu) => (
    <div className={`text-end ${styles.actionButtons}`} onClick={e => e.stopPropagation()}>
      <Button 
        variant="secondary" 
        className={styles.actionButton} 
        onClick={() => navigate(`/lieux/${lieu.id}`)} 
        title="Voir"
      >
        <i className="bi bi-eye"></i>
      </Button>
      <Button 
        variant="outline-primary" 
        className={styles.actionButton} 
        onClick={() => navigate(`/lieux/edit/${lieu.id}`)} 
        title="Éditer"
      >
        <i className="bi bi-pencil"></i>
      </Button>
      <Button 
        variant="danger" 
        className={styles.actionButton} 
        onClick={() => onDeleteLieu(lieu.id)} 
        title="Supprimer"
      >
        <i className="bi bi-trash"></i>
      </Button>
    </div>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (lieuId) => {
    navigate(`/lieux/${lieuId}`);
  };

  return (
    <div className={styles.tableContainer}>
      <Table
        columns={columns}
        data={lieux}
        renderActions={renderActions}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default LieuxResultsTable;