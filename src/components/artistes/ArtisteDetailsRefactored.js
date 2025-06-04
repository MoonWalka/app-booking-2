import React from 'react';
import { useNavigate } from 'react-router-dom';
import GenericDetailView from '../common/GenericDetailView';

/**
 * Version refactorisée de ArtisteDetails utilisant l'architecture simplifiée
 */
const ArtisteDetailsRefactored = () => {
  const navigate = useNavigate();

  const handleEdit = (artiste) => {
    navigate(`/artistes/${artiste.id}/modifier`);
  };

  const handleDelete = (artiste) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'artiste "${artiste.nom}" ?`)) {
      // TODO: Implémenter la suppression via le service
      console.log('Suppression de l\'artiste:', artiste.id);
    }
  };

  return (
    <GenericDetailView
      entityType="artiste"
      onEdit={handleEdit}
      onDelete={handleDelete}
      depth={1}
    />
  );
};

export default ArtisteDetailsRefactored;