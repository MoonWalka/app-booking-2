// src/components/programmateurs/ProgrammateursList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { ActionButtons, AddButton } from '@/components/ui/ActionButtons';
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
  
  // Configuration des filtres avancés
  const advancedFilterOptions = [
    {
      id: 'actif',
      label: 'Statut d\'activité',
      field: 'actif',
      type: 'select',
      options: [
        { value: 'true', label: 'Actifs' },
        { value: 'false', label: 'Inactifs' }
      ]
    },
    {
      id: 'hasEmail',
      label: 'Contact email',
      field: 'email',
      type: 'boolean',
      options: [
        { value: 'true', label: 'Avec email' },
        { value: 'false', label: 'Sans email' }
      ]
    },
    {
      id: 'hasTelephone',
      label: 'Contact téléphone',
      field: 'telephone',
      type: 'boolean',
      options: [
        { value: 'true', label: 'Avec téléphone' },
        { value: 'false', label: 'Sans téléphone' }
      ]
    },
    {
      id: 'fonction',
      label: 'Fonction',
      field: 'fonction',
      type: 'text',
      placeholder: 'Ex: Directeur, Manager...'
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'contact.ville',
      type: 'text',
      placeholder: 'Ville de résidence'
    }
  ];
  
  // Fonction de calcul des statistiques
  const calculateStats = (items) => {
    const total = items.length;
    const actifs = items.filter(p => p.actif !== false).length;
    const inactifs = items.filter(p => p.actif === false).length;
    const avecEmail = items.filter(p => p.email).length;
    const avecTelephone = items.filter(p => p.telephone).length;
    
    return [
      {
        id: 'total',
        label: 'Programmateurs',
        value: total,
        icon: 'bi bi-people',
        variant: 'primary'
      },
      {
        id: 'actifs',
        label: 'Actifs',
        value: actifs,
        icon: 'bi bi-person-check',
        variant: 'success',
        subtext: `${Math.round((actifs / total) * 100) || 0}%`
      },
      {
        id: 'inactifs',
        label: 'Inactifs',
        value: inactifs,
        icon: 'bi bi-person-x',
        variant: 'warning',
        subtext: `${Math.round((inactifs / total) * 100) || 0}%`
      },
      {
        id: 'contact',
        label: 'Avec contact',
        value: `${avecEmail} / ${avecTelephone}`,
        icon: 'bi bi-envelope-at',
        variant: 'info',
        subtext: 'Email / Tél.'
      }
    ];
  };

  // Actions sur les lignes
  const renderActions = (programmateur) => (
    <ActionButtons
      onView={() => navigate(`/programmateurs/${programmateur.id}`)}
      onEdit={() => navigate(`/programmateurs/${programmateur.id}/edit`)}
      onDelete={() => handleDelete(programmateur.id)}
    />
  );

  // Actions de l'en-tête
  const headerActions = (
    <AddButton
      onClick={() => navigate('/programmateurs/nouveau')}
      label="Nouveau programmateur"
    />
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
      showStats={true}
      calculateStats={calculateStats}
      showAdvancedFilters={true}
      advancedFilterOptions={advancedFilterOptions}
    />
  );
}

export default ProgrammateursList;
