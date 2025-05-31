// src/components/structures/StructuresList.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import Button from '@/components/ui/Button';
import AddButton from '@/components/ui/AddButton';
import { useDeleteStructure } from '@/hooks/structures';

/**
 * Liste unifiée des structures utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 */
function StructuresList() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Callback appelé après suppression réussie pour actualiser la liste
  const onDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1); // Force le re-render de ListWithFilters
  };
  
  const { handleDelete } = useDeleteStructure(onDeleteSuccess);

  // Configuration des colonnes pour les structures
  const columns = [
    {
      id: 'nom',
      label: 'Nom',
      field: 'nom',
      sortable: true,
      width: '25%',
    },
    {
      id: 'raisonSociale',
      label: 'Raison Sociale',
      field: 'raisonSociale',
      sortable: true,
      width: '25%',
      render: (structure) => structure.raisonSociale || '-',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      sortable: true,
      width: '15%',
      render: (structure) => {
        const types = {
          association: 'Association',
          sas: 'SAS',
          sarl: 'SARL',
          eurl: 'EURL',
          autre: 'Autre',
        };
        return types[structure.type] || structure.type || '-';
      },
    },
    {
      id: 'siret',
      label: 'SIRET',
      field: 'siret',
      sortable: false,
      width: '20%',
      render: (structure) => structure.siret || '-',
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      width: '15%',
      render: (structure) => structure.email || '-',
    },
  ];

  // Configuration des filtres
  const filterOptions = [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'nom',
      type: 'text',
      placeholder: 'Nom ou raison sociale...',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      type: 'select',
      placeholder: 'Tous les types',
      options: [
        { value: 'association', label: 'Association' },
        { value: 'sas', label: 'SAS' },
        { value: 'sarl', label: 'SARL' },
        { value: 'eurl', label: 'EURL' },
        { value: 'autre', label: 'Autre' },
      ],
    },
  ];

  // Actions sur les lignes
  const renderActions = (structure) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/structures/${structure.id}`)}
        title="Voir les détails"
      >
        <i className="bi bi-eye"></i>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/structures/${structure.id}/edit`)}
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => handleDelete(structure.id)}
        title="Supprimer"
      >
        <i className="bi bi-trash"></i>
      </Button>
    </div>
  );

  // Actions de l'en-tête
  const headerActions = (
    <AddButton
      onClick={() => navigate('/structures/nouveau')}
      buttonText="Nouvelle structure"
    />
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (structure) => {
    navigate(`/structures/${structure.id}`);
  };

  return (
    <ListWithFilters
      key={refreshKey}
      entityType="structures"
      title="Gestion des Structures"
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

export default StructuresList;