// src/components/dates/configs/datesDirectoryConfig.js

/**
 * Configuration pour la vue "Liste des dates"
 * Objectif : Répertoire universel pour recherche rapide
 * Utilisateurs : Tous rôles internes
 * Actions : Aucune action directe, point d'entrée vers autres vues
 */
export const datesDirectoryConfig = {
  title: "Liste des dates",
  entityType: "dates",
  allowRowClick: true, // Point d'entrée vers autres vues
  showStats: false,
  showRefresh: true,
  showAdvancedFilters: true,
  pageSize: 50, // Plus d'éléments pour recherche rapide

  // Colonnes affichées : chronologie brute
  columns: [
    {
      id: 'entreprise',
      label: 'Entreprise',
      field: 'entreprise',
      sortable: true,
      width: '8%',
      render: (item) => item.entreprise || '-',
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
      render: (item) => item.artiste || '-',
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
      id: 'lieu',
      label: 'Lieu',
      field: 'lieu',
      sortable: true,
      width: '12%',
      render: (item) => item.lieu || '-',
    },
    {
      id: 'organisateur',
      label: 'Organisateur',
      field: 'organisateur',
      sortable: true,
      width: '10%',
      render: (item) => item.organisateur || '-',
    },
    {
      id: 'dossier',
      label: 'Dossier',
      field: 'dossier',
      sortable: true,
      width: '8%',
      render: (item) => item.dossier || '-',
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
      id: 'dateFin',
      label: 'Fin',
      field: 'dateFin',
      sortable: true,
      width: '8%',
      render: (item) => {
        if (!item.dateFin) return '-';
        const date = new Date(item.dateFin);
        return date.toLocaleDateString('fr-FR');
      },
    },
    {
      id: 'montant',
      label: 'Montant',
      field: 'montant',
      sortable: true,
      width: '9%',
      render: (item) => {
        if (!item.montant) return '-';
        return new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: 'EUR' 
        }).format(item.montant);
      },
    }
  ],

  // Pas d'actions directes - point d'entrée seulement
  actions: [],

  // Filtres pour recherche rapide
  filterOptions: [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'artiste',
      type: 'text',
      placeholder: 'Artiste, lieu, projet...',
    },
    {
      id: 'periode',
      label: 'Période',
      field: 'periode',
      type: 'select',
      placeholder: 'Toutes les périodes',
      options: [
        { value: 'past', label: 'Passées' },
        { value: 'current', label: 'En cours' },
        { value: 'upcoming', label: 'À venir' },
        { value: 'thismonth', label: 'Ce mois' },
        { value: 'nextmonth', label: 'Mois prochain' }
      ]
    }
  ],

  // Filtres avancés pour recherche approfondie
  advancedFilterOptions: [
    {
      id: 'entreprise',
      label: 'Entreprise',
      field: 'entreprise',
      type: 'text',
      placeholder: 'Nom entreprise'
    },
    {
      id: 'lieu',
      label: 'Lieu',
      field: 'lieu',
      type: 'text',
      placeholder: 'Nom du lieu'
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'ville',
      type: 'text',
      placeholder: 'Ville'
    },
    {
      id: 'organisateur',
      label: 'Organisateur',
      field: 'organisateur',
      type: 'text',
      placeholder: 'Nom organisateur'
    },
    {
      id: 'montantMin',
      label: 'Montant min',
      field: 'montant',
      type: 'number',
      placeholder: '0'
    },
    {
      id: 'montantMax',
      label: 'Montant max', 
      field: 'montant',
      type: 'number',
      placeholder: '50000'
    }
  ],

  // Tri par défaut : chronologique (utilise le champ Firebase 'date')
  sort: { field: 'date', direction: 'asc' },

  // Pas de filtrage de données - afficher tout
  dataFilter: null,

  // Pas de données de test - utilise Firebase
  testData: []
};