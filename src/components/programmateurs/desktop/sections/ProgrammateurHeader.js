import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormHeader from '@/components/ui/FormHeader';
import Button from '@/components/ui/Button';
import { mapTerm } from '@/utils/terminologyMapping';

/**
 * ProgrammateurHeader - En-tête du programmateur
 * Harmonisé avec ConcertHeader pour utiliser FormHeader avec style sophistiqué
 */
export const ProgrammateurHeader = ({
  programmateur,
  isEditMode,
  isNewFromUrl,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  isSubmitting,
  canSave,
  navigateToList
}) => {
  const navigate = useNavigate();

  const getTitle = () => {
    if (isNewFromUrl) {
      return mapTerm('Nouveau programmateur');
    }
    
    if (programmateur?.nom && programmateur?.prenom) {
      return `${programmateur.prenom} ${programmateur.nom}`;
    }
    
    return mapTerm('Programmateur');
  };

  const getSubtitle = () => {
    if (programmateur?.fonction) {
      return programmateur.fonction;
    }
    return null;
  };

  // Préparer les actions selon le mode (même structure que ConcertHeader)
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
        disabled={isSubmitting}
        icon={<i className="bi bi-x-circle"></i>}
      >
        Annuler
      </Button>
    );

    if (onDelete && !isNewFromUrl) {
      actions.push(
        <Button
          key="delete"
          variant="outline-danger"
          onClick={onDelete}
          disabled={isSubmitting}
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
        onClick={navigateToList || (() => navigate('/programmateurs'))}
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
      title={getTitle()}
      subtitle={getSubtitle()}
      icon={<i className="bi bi-person-check"></i>}
      isLoading={isSubmitting}
      roundedTop={true}
      actions={actions}
    />
  );
}; 