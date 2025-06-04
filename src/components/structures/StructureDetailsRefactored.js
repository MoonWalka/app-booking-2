import React from 'react';
import { useNavigate } from 'react-router-dom';
import GenericDetailView from '../common/GenericDetailView';

/**
 * Version refactorisée de StructureDetails utilisant l'architecture simplifiée
 */
const StructureDetailsRefactored = () => {
  const navigate = useNavigate();

  const handleEdit = (structure) => {
    navigate(`/structures/${structure.id}/edit`);
  };

  const handleDelete = (structure) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la structure "${structure.nom}" ?`)) {
      // TODO: Implémenter la suppression via le service
      console.log('Suppression de la structure:', structure.id);
    }
  };

  return (
    <GenericDetailView
      entityType="structure"
      onEdit={handleEdit}
      onDelete={handleDelete}
      depth={1}
    />
  );
};

export default StructureDetailsRefactored;