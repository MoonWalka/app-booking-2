// src/components/programmateurs/ProgrammateursList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useDeleteProgrammateur } from '@/hooks/programmateurs';

/**
 * Liste unifiée des programmateurs utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 */
function ProgrammateursList() {
  const navigate = useNavigate();
  const { handleDelete } = useDeleteProgrammateur();

  // Configuration des colonnes pour les programmateurs
  const columns = [
    {
      id: 'nom',
      label: 'Nom',
      field: 'nom',
      sortable: true,
      width: '20%',
    },
    {
      id: 'prenom',
      label: 'Prénom',
      field: 'prenom',
      sortable: true,
      width: '20%',
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      width: '25%',
    },
    {
      id: 'telephone',
      label: 'Téléphone',
      field: 'telephone',
      sortable: false,
      width: '15%',
    },
    {
      id: 'organisation',
      label: 'Organisation',
      field: 'organisation',
      sortable: true,
      width: '20%',
      render: (programmateur) => programmateur.organisation || '-',
    },
  ];

  // Configuration des filtres
  const filterOptions = [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'nom',
      type: 'text',
      placeholder: 'Nom ou organisation...',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      type: 'select',
      placeholder: 'Tous les types',
      options: [
        { value: 'festival', label: 'Festival' },
        { value: 'salle', label: 'Salle' },
        { value: 'producteur', label: 'Producteur' },
        { value: 'autre', label: 'Autre' },
      ],
    },
  ];

  // Actions sur les lignes
  const renderActions = (programmateur) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => navigate(`/programmateurs/${programmateur.id}`)}
        title="Voir les détails"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => navigate(`/programmateurs/${programmateur.id}/edit`)}
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => handleDelete(programmateur.id)}
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
      onClick={() => navigate('/programmateurs/nouveau')}
    >
      <i className="bi bi-plus"></i> Nouveau programmateur
    </button>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (programmateur) => {
    navigate(`/programmateurs/${programmateur.id}`);
  };

  return (
    <ListWithFilters
      entityType="programmateurs"
      title="Gestion des Programmateurs"
      columns={columns}
      filterOptions={filterOptions}
      sort={{ field: 'nom', direction: 'asc' }}
      actions={headerActions}
      onRowClick={handleRowClick}
      renderActions={renderActions}
      pageSize={20}
      showRefresh={true}
    />
  );
}

export default ProgrammateursList;
