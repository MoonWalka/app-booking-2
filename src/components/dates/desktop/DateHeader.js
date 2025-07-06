import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormHeader from '@/components/ui/FormHeader';
import Button from '@/components/ui/Button';

/**
 * Composant d'en-tête pour la page de détails d'un date
 * Utilise maintenant FormHeader pour une stylisation cohérente avec la page d'édition
 * Adapté de la maquette datedetail.md avec stylisation moderne
 */
const DateHeader = ({ 
  date, 
  onEdit, 
  onDelete, 
  isEditMode, 
  onSave, 
  onCancel, 
  isSubmitting, 
  canSave, 
  formatDate,
  navigateToList
}) => {
  const navigate = useNavigate();

  // Préparer les actions selon le mode
  const actions = [];

  if (isEditMode) {
    // Mode édition - boutons de sauvegarde et annulation
    actions.push(
      <Button
        key="save"
        variant="primary"
        onClick={onSave}
        disabled={isSubmitting || !canSave}
        loading={isSubmitting}
        icon={<i className="bi bi-check-circle"></i>}
      >
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    );

    actions.push(
      <Button
        key="cancel"
        variant="outline-secondary"
        onClick={onCancel}
        icon={<i className="bi bi-x-circle"></i>}
      >
        Annuler
      </Button>
    );

    if (onDelete) {
      actions.push(
        <Button
          key="delete"
          variant="outline-danger"
          onClick={onDelete}
          icon={<i className="bi bi-trash"></i>}
        >
          Supprimer
        </Button>
      );
    }
  } else {
    // Mode affichage - boutons de navigation et modification
    actions.push(
      <Button
        key="back"
        variant="outline-secondary"
        onClick={navigateToList || (() => navigate('/dates'))}
        icon={<i className="bi bi-arrow-left"></i>}
      >
        Retour
      </Button>
    );

    actions.push(
      <Button
        key="edit"
        variant="outline-primary"
        onClick={onEdit}
        icon={<i className="bi bi-pencil"></i>}
      >
        Modifier
      </Button>
    );
  }

  return (
    <FormHeader
      title={date?.titre || `Date du ${formatDate(date?.date)}`}
      icon={<i className="bi bi-music-note-beamed"></i>}
      isLoading={isSubmitting}
      roundedTop={true}
      actions={actions}
    />
  );
};

export default DateHeader;