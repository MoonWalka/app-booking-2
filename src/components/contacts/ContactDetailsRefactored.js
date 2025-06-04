import React from 'react';
import { useNavigate } from 'react-router-dom';
import GenericDetailView from '../common/GenericDetailView';

/**
 * Version refactorisée de ContactDetails utilisant l'architecture simplifiée
 */
const ContactDetailsRefactored = () => {
  const navigate = useNavigate();

  const handleEdit = (contact) => {
    navigate(`/contacts/${contact.id}/edit`);
  };

  const handleDelete = (contact) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le contact "${contact.prenom} ${contact.nom}" ?`)) {
      // TODO: Implémenter la suppression via le service
      console.log('Suppression du contact:', contact.id);
    }
  };

  return (
    <GenericDetailView
      entityType="contact"
      onEdit={handleEdit}
      onDelete={handleDelete}
      depth={1}
    />
  );
};

export default ContactDetailsRefactored;