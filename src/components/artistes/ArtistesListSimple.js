// src/components/artistes/ArtistesListSimple.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddButton from '@/components/ui/AddButton';
import Table from '@/components/ui/Table';
import { useDeleteArtiste } from '@/hooks/artistes';
import useGenericEntityList from '@/hooks/generics/lists/useGenericEntityList';

/**
 * Liste simplifiée des artistes pour le paramétrage booking
 * Sans filtres avancés ni statistiques
 */
function ArtistesListSimple({ onAddArtiste }) {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Récupérer les données des artistes
  const { items: artistes, loading, error } = useGenericEntityList('artistes', {
    refreshKey,
    sort: { field: 'nom', direction: 'asc' }
  });
  
  // Callback appelé après suppression réussie pour actualiser la liste
  const onDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const { handleDelete } = useDeleteArtiste(onDeleteSuccess);

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

  // Configuration des actions pour chaque ligne
  const getRowActions = (artiste) => [
    {
      label: 'Modifier',
      icon: 'bi-pencil',
      variant: 'outline-primary',
      size: 'sm',
      onClick: () => navigate(`/artistes/${artiste.id}/edit`)
    },
    {
      label: 'Supprimer',
      icon: 'bi-trash',
      variant: 'outline-danger',
      size: 'sm',
      onClick: () => handleDelete(artiste.id, artiste.nom)
    }
  ];

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des artistes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        <h6>Erreur de chargement</h6>
        <p>Impossible de charger la liste des artistes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Header avec titre et bouton d'ajout */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">Gestion des Artistes</h4>
          <p className="text-muted mb-0">
            {artistes.length} artiste{artistes.length > 1 ? 's' : ''} enregistré{artistes.length > 1 ? 's' : ''}
          </p>
        </div>
        <AddButton
          onClick={onAddArtiste || (() => navigate('/artistes/nouveau'))}
          label="Nouvel artiste"
          icon="bi-plus"
        />
      </div>

      {/* Table des artistes */}
      {artistes.length === 0 ? (
        <div className="text-center p-5">
          <i className="bi bi-music-note-beamed" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
          <h5 className="mt-3">Aucun artiste</h5>
          <p className="text-muted">Commencez par ajouter votre premier artiste.</p>
          <AddButton
            onClick={onAddArtiste || (() => navigate('/artistes/nouveau'))}
            label="Ajouter un artiste"
            icon="bi-plus"
            variant="primary"
          />
        </div>
      ) : (
        <Table
          data={artistes}
          columns={columns}
          onRowClick={(artiste) => navigate(`/artistes/${artiste.id}`)}
          getRowActions={getRowActions}
          sortable={true}
          hoverable={true}
        />
      )}
    </div>
  );
}

export default ArtistesListSimple;