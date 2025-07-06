// src/components/dates/configs/publicationConfig.js

/**
 * Configuration pour la vue "Publication"
 * Objectif : Valider et diffuser les dates annoncées au public
 * Utilisateurs : Communication / Presse / Web
 * Actions : Basculer visibilité publique, exporter, pousser vers site & réseaux
 */
export const publicationConfig = {
  title: "Publications",
  entityType: "publications",
  allowRowClick: true,
  showStats: true,
  showRefresh: true,
  showAdvancedFilters: true,
  pageSize: 20,

  // Colonnes pour diffusion externe (AUCUN champ financier)
  columns: [
    {
      id: 'public',
      label: 'Public',
      field: 'isPublic',
      sortable: true,
      width: '6%',
      render: (item) => (
        <span style={{ 
          fontSize: '16px', 
          color: item.isPublic ? '#28a745' : '#6c757d' 
        }}>
          {item.isPublic ? '✓' : '✗'}
        </span>
      ),
    },
    {
      id: 'comm',
      label: 'Comm',
      field: 'communicationStatus',
      sortable: true,
      width: '6%',
      render: (item) => {
        const status = item.communicationStatus || 'pending';
        const colors = {
          'approved': '#28a745',
          'pending': '#ffc107', 
          'rejected': '#dc3545'
        };
        return (
          <span style={{ 
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: colors[status] || '#6c757d',
            display: 'inline-block'
          }} title={status} />
        );
      },
    },
    {
      id: 'coll',
      label: 'Coll.',
      field: 'coll',
      sortable: true,
      width: '5%',
      render: (item) => item.coll || '-',
    },
    {
      id: 'niv',
      label: 'Niv.',
      field: 'niv',
      sortable: true,
      width: '5%',
      render: (item) => item.niv || '-',
    },
    {
      id: 'artiste',
      label: 'Artiste',
      field: 'artiste',
      sortable: true,
      width: '15%',
      render: (item) => item.artiste?.nom || item.artisteNom || '-',
    },
    {
      id: 'projet',
      label: 'Projet',
      field: 'projet',
      sortable: true,
      width: '12%',
      render: (item) => item.projet || '-',
    },
    {
      id: 'dateDebut',
      label: 'Début',
      field: 'dateDebut',
      sortable: true,
      width: '8%',
      render: (item) => {
        if (!item.dateDebut) return '-';
        const date = new Date(item.dateDebut);
        return date.toLocaleDateString('fr-FR');
      },
    },
    {
      id: 'libelle',
      label: 'Libellé',
      field: 'libelle',
      sortable: true,
      width: '15%',
      render: (item) => item.libelle || '-',
    },
    {
      id: 'salle',
      label: 'Salle',
      field: 'salle',
      sortable: true,
      width: '10%',
      render: (item) => item.salle || '-',
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'ville',
      sortable: true,
      width: '8%',
      render: (item) => item.ville || '-',
    },
    {
      id: 'codePostal',
      label: 'CP',
      field: 'codePostal',
      sortable: true,
      width: '5%',
      render: (item) => item.codePostal || '-',
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      sortable: true,
      width: '8%',
      render: (item) => item.type || '-',
    },
    {
      id: 'nbRepresentations',
      label: 'Nb. représentations',
      field: 'nbRepresentations',
      sortable: true,
      width: '7%',
      render: (item) => item.nbRepresentations || '1',
    }
  ],

  // Actions de publication
  actions: [
    {
      id: 'togglePublic',
      label: 'Public',
      icon: 'bi-eye',
      color: '#28a745',
      tooltip: 'Basculer la visibilité publique',
      roles: ['admin', 'communication'], // Seuls admin et comm peuvent publier
      condition: (item) => true // Toujours disponible
    },
    {
      id: 'export',
      label: 'Export',
      icon: 'bi-download',
      color: '#17a2b8',
      tooltip: 'Exporter pour diffusion',
      roles: ['admin', 'communication', 'press'],
      condition: (item) => item.isPublic // Seulement si public
    },
    {
      id: 'pushToSocial',
      label: 'Réseaux',
      icon: 'bi-share',
      color: '#e83e8c',
      tooltip: 'Pousser vers réseaux sociaux',
      roles: ['admin', 'communication'],
      condition: (item) => item.isPublic && item.communicationStatus === 'approved'
    }
  ],

  // Statistiques pour le pilotage
  stats: [
    {
      id: 'total',
      label: 'Total dates',
      icon: 'bi bi-calendar-event',
      variant: 'primary',
      calculate: (items) => ({ value: items.length })
    },
    {
      id: 'public',
      label: 'Publiques',
      icon: 'bi bi-eye',
      variant: 'success',
      calculate: (items) => {
        const publicCount = items.filter(item => item.isPublic).length;
        const percentage = Math.round((publicCount / items.length) * 100) || 0;
        return { 
          value: publicCount, 
          subtext: `${percentage}%` 
        };
      }
    },
    {
      id: 'approved',
      label: 'Validées comm',
      icon: 'bi bi-check-circle',
      variant: 'info',
      calculate: (items) => {
        const approvedCount = items.filter(item => item.communicationStatus === 'approved').length;
        const percentage = Math.round((approvedCount / items.length) * 100) || 0;
        return { 
          value: approvedCount, 
          subtext: `${percentage}%` 
        };
      }
    },
    {
      id: 'pending',
      label: 'En attente',
      icon: 'bi bi-clock',
      variant: 'warning',
      calculate: (items) => {
        const pendingCount = items.filter(item => 
          !item.isPublic || item.communicationStatus === 'pending'
        ).length;
        return { value: pendingCount };
      }
    }
  ],

  // Filtres de publication
  filterOptions: [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'artiste',
      type: 'text',
      placeholder: 'Artiste, lieu, libellé...',
    },
    {
      id: 'publicationStatus',
      label: 'Statut publication',
      field: 'isPublic',
      type: 'select',
      placeholder: 'Tous les statuts',
      options: [
        { value: 'true', label: '✓ Publique' },
        { value: 'false', label: '✗ Privée' }
      ]
    },
    {
      id: 'communicationStatus',
      label: 'Validation comm',
      field: 'communicationStatus',
      type: 'select',
      placeholder: 'Tous les statuts',
      options: [
        { value: 'approved', label: '🟢 Approuvé' },
        { value: 'pending', label: '🟡 En attente' },
        { value: 'rejected', label: '🔴 Refusé' }
      ]
    }
  ],

  // Filtres avancés
  advancedFilterOptions: [
    {
      id: 'type',
      label: 'Type événement',
      field: 'type',
      type: 'select',
      options: [
        { value: 'date', label: 'Date' },
        { value: 'festival', label: 'Festival' },
        { value: 'showcase', label: 'Showcase' },
        { value: 'conference', label: 'Conférence' }
      ]
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'ville',
      type: 'text',
      placeholder: 'Ville'
    },
    {
      id: 'dateMin',
      label: 'Date minimum',
      field: 'dateDebut',
      type: 'date'
    },
    {
      id: 'dateMax',
      label: 'Date maximum',
      field: 'dateDebut',
      type: 'date'
    }
  ],

  // Tri par défaut : dates à venir d'abord (utilise le champ Firebase 'date')
  sort: { field: 'date', direction: 'asc' },

  // Filtrer pour n'afficher que les dates potentiellement publiables
  dataFilter: (item) => {
    // Exclure les dates annulées
    if (item.statut === 'annule') return false;
    
    // On peut inclure toutes les dates pour permettre à comm de décider
    return true;
  },

  // Pas de données de test - utilise Firebase
  testData: []
};