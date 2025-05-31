// src/components/artistes/ArtistesList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useDeleteArtiste } from '@/hooks/artistes';

/**
 * Liste unifiée des artistes utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 */
function ArtistesList() {
  const navigate = useNavigate();
  const { handleDelete } = useDeleteArtiste();

  // Configuration des colonnes pour les artistes
  const columns = [
    {
      id: 'nom',
      label: 'Nom',
      field: 'nom',
      sortable: true,
      width: '25%',
    },
    {
      id: 'prenom',
      label: 'Prénom',
      field: 'prenom',
      sortable: true,
      width: '25%',
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      width: '30%',
    },
    {
      id: 'telephone',
      label: 'Téléphone',
      field: 'telephone',
      sortable: false,
      width: '20%',
    },
  ];

  // Configuration des filtres
  const filterOptions = [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'nom',
      type: 'text',
      placeholder: 'Nom ou prénom...',
    },
    {
      id: 'status',
      label: 'Statut',
      field: 'status',
      type: 'select',
      placeholder: 'Tous les statuts',
      options: [
        { value: 'active', label: 'Actif' },
        { value: 'inactive', label: 'Inactif' },
      ],
    },
  ];

  // Actions sur les lignes
  const renderActions = (artiste) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => navigate(`/artistes/${artiste.id}`)}
        title="Voir les détails"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => navigate(`/artistes/${artiste.id}/edit`)}
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => handleDelete(artiste.id)}
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
      onClick={() => navigate('/artistes/nouveau')}
    >
      <i className="bi bi-plus"></i> Nouvel artiste
    </button>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (artiste) => {
    navigate(`/artistes/${artiste.id}`);
  };

  return (
    <ListWithFilters
      entityType="artistes"
      title="Gestion des Artistes"
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

export default ArtistesList;