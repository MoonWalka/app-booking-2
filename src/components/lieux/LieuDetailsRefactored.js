import React from 'react';
import { useNavigate } from 'react-router-dom';
import GenericDetailView from '../common/GenericDetailView';

/**
 * Version refactorisée de LieuDetails utilisant l'architecture simplifiée
 */
const LieuDetailsRefactored = () => {
  const navigate = useNavigate();

  const handleEdit = (lieu) => {
    navigate(`/lieux/${lieu.id}/edit`);
  };

  const handleDelete = (lieu) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le lieu "${lieu.nom}" ?`)) {
      // TODO: Implémenter la suppression via le service
      console.log('Suppression du lieu:', lieu.id);
    }
  };

  return (
    <GenericDetailView
      entityType="lieu"
      onEdit={handleEdit}
      onDelete={handleDelete}
      depth={1}
    />
  );
};

export default LieuDetailsRefactored;