// src/components/lieux/LieuxList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useLieuDelete } from '@/hooks/lieux';

/**
 * Liste unifiée des lieux utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 * Note: La version mobile précédente (390 lignes) était fonctionnelle mais complexe
 * Cette version unifiée simplifie l'architecture tout en conservant les fonctionnalités
 */
function LieuxList() {
  const navigate = useNavigate();
  const { handleDelete } = useLieuDelete();

  // Configuration des colonnes pour les lieux
  const columns = [
    {
      id: 'nom',
      label: 'Nom',
      field: 'nom',
      sortable: true,
      width: '30%',
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'ville',
      sortable: true,
      width: '20%',
    },
    {
      id: 'adresse',
      label: 'Adresse',
      field: 'adresse',
      sortable: false,
      width: '25%',
      render: (lieu) => {
        if (!lieu.adresse) return '-';
        return lieu.adresse.length > 50 ? 
          `${lieu.adresse.substring(0, 50)}...` : 
          lieu.adresse;
      },
    },
    {
      id: 'capacite',
      label: 'Capacité',
      field: 'capacite',
      sortable: true,
      width: '15%',
      render: (lieu) => lieu.capacite ? `${lieu.capacite} pers.` : '-',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      sortable: true,
      width: '10%',
      render: (lieu) => {
        const types = {
          salle: 'Salle',
          festival: 'Festival',
          club: 'Club',
          plein_air: 'Plein air',
          autre: 'Autre',
        };
        return types[lieu.type] || lieu.type || '-';
      },
    },
  ];

  // Configuration des filtres
  const filterOptions = [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'nom',
      type: 'text',
      placeholder: 'Nom ou ville...',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      type: 'select',
      placeholder: 'Tous les types',
      options: [
        { value: 'salle', label: 'Salle' },
        { value: 'festival', label: 'Festival' },
        { value: 'club', label: 'Club' },
        { value: 'plein_air', label: 'Plein air' },
        { value: 'autre', label: 'Autre' },
      ],
    },
  ];

  // Actions sur les lignes
  const renderActions = (lieu) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => navigate(`/lieux/${lieu.id}`)}
        title="Voir les détails"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => navigate(`/lieux/${lieu.id}/edit`)}
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => handleDelete(lieu.id)}
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
      onClick={() => navigate('/lieux/nouveau')}
    >
      <i className="bi bi-plus"></i> Nouveau lieu
    </button>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (lieu) => {
    navigate(`/lieux/${lieu.id}`);
  };

  return (
    <ListWithFilters
      entityType="lieux"
      title="Gestion des Lieux"
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

export default LieuxList;
