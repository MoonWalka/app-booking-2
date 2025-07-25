// src/components/artistes/sections/ArtistesTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '@/components/ui/Table';
import usePermissions from '@/hooks/usePermissions';
import styles from './ArtistesTable.module.css';

/**
 * Table component to display artists list
 * Harmonisé avec la maquette TourCraft
 */
const ArtistesTable = ({ artistes, onDelete }) => {
  const navigate = useNavigate();
  const { canEdit, canDelete } = usePermissions();

  // Colonnes pour le composant Table commun
  const columns = [
    {
      label: 'Artiste',
      key: 'nom',
      sortable: true,
      render: (artiste) => (
        <div className={styles.artistInfo}>
          <div className={styles.artistName}>
            <i className="bi bi-person-fill me-2 text-primary"></i>
            {artiste.artisteNom}
          </div>
          {artiste.genre && (
            <div className={styles.artistGenre}>{artiste.genre}</div>
          )}
        </div>
      )
    },
    {
      label: 'Lieu',
      key: 'lieu',
      sortable: true,
      render: (artiste) => artiste.lieu || <span className="text-muted">Non spécifié</span>
    },
    {
      label: 'Cachet',
      key: 'cachet',
      sortable: true,
      render: (artiste) => artiste.cachet ? `${artiste.cachet}€` : <span className="text-muted">Non spécifié</span>
    },
    {
      label: 'Dates',
      key: 'datesCount',
      sortable: false,
      render: (artiste) => (
        <span className={styles.dateCount}>
          <i className="bi bi-music-note-beamed me-1"></i>
          {artiste.datesCount || 0} dates
        </span>
      )
    }
  ];

  // Actions par ligne
  const renderActions = (artiste) => (
    <div className={styles.actionButtons} onClick={e => e.stopPropagation()}>
      <button 
        className={styles.actionButton}
        onClick={() => navigate(`/artistes/${artiste.id}`)} 
        title="Voir"
      >
        <i className="bi bi-eye"></i>
      </button>
      {canEdit('artistes') && (
        <button 
          className={styles.actionButton}
          onClick={() => navigate(`/artistes/edit/${artiste.id}`)} 
          title="Éditer"
        >
          <i className="bi bi-pencil"></i>
        </button>
      )}
      {canDelete('artistes') && (
        <button 
          className={styles.actionButton}
          onClick={() => onDelete(artiste.id)} 
          title="Supprimer"
        >
          <i className="bi bi-trash"></i>
        </button>
      )}
    </div>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (artisteId) => {
    navigate(`/artistes/${artisteId}`);
  };

  return (
    <div className={styles.tableContainer}>
      <Table
        columns={columns}
        data={artistes}
        renderActions={renderActions}
        onRowDoubleClick={handleRowClick}
      />
    </div>
  );
};

export default ArtistesTable;