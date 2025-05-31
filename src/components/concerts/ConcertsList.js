// src/components/concerts/ConcertsList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useConcertDelete } from '@/hooks/concerts';

/**
 * Liste unifiée des concerts utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 */
function ConcertsList() {
  const navigate = useNavigate();
  const { handleDelete } = useConcertDelete();

  // Configuration des colonnes pour les concerts
  const columns = [
    {
      id: 'titre',
      label: 'Titre',
      field: 'titre',
      sortable: true,
      width: '25%',
    },
    {
      id: 'date',
      label: 'Date',
      field: 'dateEvenement',
      sortable: true,
      width: '15%',
      render: (concert) => {
        if (!concert.dateEvenement) return '-';
        const date = new Date(concert.dateEvenement);
        return date.toLocaleDateString('fr-FR');
      },
    },
    {
      id: 'lieu',
      label: 'Lieu',
      field: 'lieuNom',
      sortable: true,
      width: '20%',
      render: (concert) => concert.lieuNom || '-',
    },
    {
      id: 'artiste',
      label: 'Artiste',
      field: 'artisteNom',
      sortable: true,
      width: '20%',
      render: (concert) => concert.artisteNom || '-',
    },
    {
      id: 'statut',
      label: 'Statut',
      field: 'statut',
      sortable: true,
      width: '15%',
      render: (concert) => {
        const statut = concert.statut || 'brouillon';
        const badges = {
          brouillon: { label: 'Brouillon', class: 'secondary' },
          confirme: { label: 'Confirmé', class: 'success' },
          annule: { label: 'Annulé', class: 'danger' },
          reporte: { label: 'Reporté', class: 'warning' },
        };
        const badge = badges[statut] || badges.brouillon;
        return (
          <span className={`badge bg-${badge.class}`}>
            {badge.label}
          </span>
        );
      },
    },
  ];

  // Configuration des filtres
  const filterOptions = [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'titre',
      type: 'text',
      placeholder: 'Titre du concert...',
    },
    {
      id: 'statut',
      label: 'Statut',
      field: 'statut',
      type: 'select',
      placeholder: 'Tous les statuts',
      options: [
        { value: 'brouillon', label: 'Brouillon' },
        { value: 'confirme', label: 'Confirmé' },
        { value: 'annule', label: 'Annulé' },
        { value: 'reporte', label: 'Reporté' },
      ],
    },
    {
      id: 'dateDebut',
      label: 'Date à partir de',
      field: 'dateEvenement',
      type: 'date',
    },
  ];

  // Actions sur les lignes
  const renderActions = (concert) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => navigate(`/concerts/${concert.id}`)}
        title="Voir les détails"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => navigate(`/concerts/${concert.id}/edit`)}
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => handleDelete(concert.id)}
        title="Supprimer"
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  );

  // Actions de l'en-tête
  const headerActions = (
    <button
      className="btn btn-primary"
      onClick={() => navigate('/concerts/nouveau')}
    >
      <i className="bi bi-plus"></i> Nouveau concert
    </button>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (concert) => {
    navigate(`/concerts/${concert.id}`);
  };

  return (
    <ListWithFilters
      entityType="concerts"
      title="Gestion des Concerts"
      columns={columns}
      filterOptions={filterOptions}
      sort={{ field: 'dateEvenement', direction: 'desc' }}
      actions={headerActions}
      onRowClick={handleRowClick}
      renderActions={renderActions}
      pageSize={20}
      showRefresh={true}
    />
  );
}

export default ConcertsList;
