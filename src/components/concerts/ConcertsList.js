// src/components/concerts/ConcertsList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { ActionButtons, AddButton } from '@/components/ui/ActionButtons';
import StatusBadge from '@/components/ui/StatusBadge';
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
        const labels = {
          brouillon: 'Brouillon',
          confirme: 'Confirmé',
          annule: 'Annulé',
          reporte: 'Reporté'
        };
        return (
          <StatusBadge status={statut}>
            {labels[statut] || 'Brouillon'}
          </StatusBadge>
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
  
  // Configuration des filtres avancés
  const advancedFilterOptions = [
    {
      id: 'lieu',
      label: 'Lieu',
      field: 'lieuId',
      type: 'text',
      placeholder: 'Nom du lieu'
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'lieuVille',
      type: 'text',
      placeholder: 'Ville du concert'
    },
    {
      id: 'artiste',
      label: 'Artiste',
      field: 'artisteId',
      type: 'text',
      placeholder: 'Nom de l\'artiste'
    },
    {
      id: 'programmateur',
      label: 'Programmateur',
      field: 'programmateurId',
      type: 'text',
      placeholder: 'Nom du programmateur'
    },
    {
      id: 'contrat',
      label: 'Contrat',
      field: 'hasContrat',
      type: 'boolean',
      options: [
        { value: 'true', label: 'Avec contrat' },
        { value: 'false', label: 'Sans contrat' }
      ]
    },
    {
      id: 'periode',
      label: 'Période',
      field: 'periode',
      type: 'select',
      options: [
        { value: 'past', label: 'Passés' },
        { value: 'today', label: 'Aujourd\'hui' },
        { value: 'thisweek', label: 'Cette semaine' },
        { value: 'thismonth', label: 'Ce mois-ci' },
        { value: 'future', label: 'À venir' }
      ]
    }
  ];
  
  // Fonction de calcul des statistiques
  const calculateStats = (items) => {
    const total = items.length;
    const now = new Date();
    
    // Stats par statut
    const statutCount = {
      brouillon: 0,
      confirme: 0,
      annule: 0,
      reporte: 0
    };
    
    // Stats temporelles
    let passes = 0;
    let aVenir = 0;
    let ceMois = 0;
    
    items.forEach(concert => {
      // Statuts
      const statut = concert.statut || 'brouillon';
      if (statutCount[statut] !== undefined) {
        statutCount[statut]++;
      }
      
      // Dates
      if (concert.dateEvenement) {
        const date = new Date(concert.dateEvenement);
        if (date < now) {
          passes++;
        } else {
          aVenir++;
          if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            ceMois++;
          }
        }
      }
    });
    
    return [
      {
        id: 'total',
        label: 'Total Concerts',
        value: total,
        icon: 'bi bi-calendar-event',
        variant: 'primary'
      },
      {
        id: 'confirmes',
        label: 'Confirmés',
        value: statutCount.confirme,
        icon: 'bi bi-check-circle',
        variant: 'success',
        subtext: `${Math.round((statutCount.confirme / total) * 100) || 0}%`
      },
      {
        id: 'avenir',
        label: 'À venir',
        value: aVenir,
        icon: 'bi bi-calendar-plus',
        variant: 'info',
        subtext: `${ceMois} ce mois`
      },
      {
        id: 'annules',
        label: 'Annulés/Reportés',
        value: statutCount.annule + statutCount.reporte,
        icon: 'bi bi-x-circle',
        variant: 'warning',
        subtext: `${statutCount.annule}/${statutCount.reporte}`
      }
    ];
  };

  // Actions sur les lignes
  const renderActions = (concert) => (
    <ActionButtons
      onView={() => navigate(`/concerts/${concert.id}`)}
      onEdit={() => navigate(`/concerts/${concert.id}/edit`)}
      onDelete={() => handleDelete(concert.id)}
    />
  );

  // Actions de l'en-tête
  const headerActions = (
    <AddButton
      onClick={() => navigate('/concerts/nouveau')}
      label="Nouveau concert"
    />
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
      showStats={true}
      calculateStats={calculateStats}
      showAdvancedFilters={true}
      advancedFilterOptions={advancedFilterOptions}
    />
  );
}

export default ConcertsList;
