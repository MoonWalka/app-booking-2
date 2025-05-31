// src/components/artistes/ArtistesList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { ActionButtons } from '@/components/ui/ActionButtons';
import AddButton from '@/components/ui/AddButton';
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
  
  // Configuration des filtres avancés
  const advancedFilterOptions = [
    {
      id: 'genre',
      label: 'Genre musical',
      field: 'genre',
      type: 'select',
      options: [
        { value: 'rock', label: 'Rock' },
        { value: 'pop', label: 'Pop' },
        { value: 'jazz', label: 'Jazz' },
        { value: 'electro', label: 'Électro' },
        { value: 'hip-hop', label: 'Hip-Hop' },
        { value: 'classique', label: 'Classique' },
        { value: 'autre', label: 'Autre' }
      ]
    },
    {
      id: 'hasContact',
      label: 'Contact',
      field: 'hasContact',
      type: 'boolean',
      options: [
        { value: 'true', label: 'Avec contact' },
        { value: 'false', label: 'Sans contact' }
      ]
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'ville',
      type: 'text',
      placeholder: 'Ville de résidence'
    },
    {
      id: 'dateCreation',
      label: 'Date d\'ajout',
      field: 'createdAt',
      type: 'select',
      options: [
        { value: 'last7days', label: 'Derniers 7 jours' },
        { value: 'last30days', label: 'Derniers 30 jours' },
        { value: 'last90days', label: 'Derniers 90 jours' },
        { value: 'lastyear', label: 'Dernière année' }
      ]
    }
  ];
  
  // Fonction de calcul des statistiques
  const calculateStats = (items) => {
    const total = items.length;
    const actifs = items.filter(a => a.status === 'active').length;
    const avecContact = items.filter(a => a.email || a.telephone).length;
    
    // Compter les genres musicaux
    const genreCount = items.reduce((acc, artiste) => {
      if (artiste.genre) {
        acc[artiste.genre] = (acc[artiste.genre] || 0) + 1;
      }
      return acc;
    }, {});
    
    const genrePopulaire = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];
    
    return [
      {
        id: 'total',
        label: 'Total Artistes',
        value: total,
        icon: 'bi bi-music-note-list',
        variant: 'primary'
      },
      {
        id: 'actifs',
        label: 'Actifs',
        value: actifs,
        icon: 'bi bi-check-circle',
        variant: 'success',
        subtext: `${Math.round((actifs / total) * 100) || 0}%`
      },
      {
        id: 'contact',
        label: 'Avec contact',
        value: avecContact,
        icon: 'bi bi-person-lines-fill',
        variant: 'info',
        subtext: `${Math.round((avecContact / total) * 100) || 0}%`
      },
      {
        id: 'genre',
        label: 'Genre populaire',
        value: genrePopulaire ? genrePopulaire[0] : 'N/A',
        icon: 'bi bi-vinyl',
        variant: 'warning',
        subtext: genrePopulaire ? `${genrePopulaire[1]} artistes` : ''
      }
    ];
  };

  // Actions sur les lignes
  const renderActions = (artiste) => (
    <ActionButtons
      onView={() => navigate(`/artistes/${artiste.id}`)}
      onEdit={() => navigate(`/artistes/${artiste.id}/edit`)}
      onDelete={() => handleDelete(artiste.id)}
    />
  );

  // Actions de l'en-tête
  const headerActions = (
    <AddButton
      onClick={() => navigate('/artistes/nouveau')}
      label="Nouvel artiste"
    />
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
      showStats={true}
      calculateStats={calculateStats}
      showAdvancedFilters={true}
      advancedFilterOptions={advancedFilterOptions}
    />
  );
}

export default ArtistesList;