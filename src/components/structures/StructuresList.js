// src/components/structures/StructuresList.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { ActionButtons } from '@/components/ui/ActionButtons';
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

  // Fonction de calcul des statistiques pour les structures
  const calculateStats = (items) => {
    const total = items.length;
    
    // Répartition par type
    const typeCount = items.reduce((acc, structure) => {
      const type = structure.type || 'non_defini';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const typePopulaire = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
    
    // Structures avec SIRET
    const avecSiret = items.filter(structure => structure.siret && structure.siret.trim()).length;
    
    // Structures avec contact email
    const avecEmail = items.filter(structure => structure.email && structure.email.trim()).length;
    
    return [
      {
        id: 'total',
        label: 'Total Structures',
        value: total,
        icon: 'bi bi-building',
        variant: 'primary'
      },
      {
        id: 'type_principal',
        label: 'Type principal',
        value: typePopulaire ? typePopulaire[0] : 'N/A',
        icon: 'bi bi-diagram-3',
        variant: 'info',
        subtext: typePopulaire ? `${typePopulaire[1]} structures` : ''
      },
      {
        id: 'avec_siret',
        label: 'Avec SIRET',
        value: avecSiret,
        icon: 'bi bi-card-checklist',
        variant: 'success',
        subtext: `${Math.round((avecSiret / total) * 100) || 0}%`
      },
      {
        id: 'avec_email',
        label: 'Avec email',
        value: avecEmail,
        icon: 'bi bi-envelope',
        variant: 'warning',
        subtext: `${Math.round((avecEmail / total) * 100) || 0}%`
      }
    ];
  };

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
    <ActionButtons
      onView={() => navigate(`/structures/${structure.id}`)}
      onEdit={() => navigate(`/structures/${structure.id}/edit`)}
      onDelete={() => handleDelete(structure.id)}
    />
  );

  // Actions de l'en-tête
  const headerActions = (
    <AddButton
      onClick={() => navigate('/structures/nouveau')}
    >
      Nouvelle structure
    </AddButton>
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
      showStats={true}
      calculateStats={calculateStats}
    />
  );
}

export default StructuresList;