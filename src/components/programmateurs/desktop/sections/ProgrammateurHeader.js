import React from 'react';
import Button from '@components/ui/Button';
import FlexContainer from '@components/ui/FlexContainer';
import styles from './ProgrammateurHeader.module.css';

/**
 * ProgrammateurHeader - En-tête du formulaire de programmateur
 * Affiche le titre et les boutons d'action (Enregistrer, Annuler, Supprimer)
 */
export const ProgrammateurHeader = ({
  programmateur,
  isEditMode,
  isNewFromUrl,
  onSave,
  onCancel,
  onDelete,
  isSubmitting,
  canSave,
  navigateToList
}) => {
  const getTitle = () => {
    if (isNewFromUrl) {
      return 'Nouveau programmateur';
    }
    
    if (programmateur?.nom && programmateur?.prenom) {
      return `${programmateur.prenom} ${programmateur.nom}`;
    }
    
    return 'Programmateur';
  };

  const getSubtitle = () => {
    if (programmateur?.fonction) {
      return programmateur.fonction;
    }
    return null;
  };

  return (
    <div className={styles.headerContainer}>
      <FlexContainer justify="space-between" align="center" className={styles.headerContent}>
        {/* Titre et informations */}
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            {getTitle()}
          </h1>
          {getSubtitle() && (
            <p className={styles.subtitle}>
              {getSubtitle()}
            </p>
          )}
        </div>

        {/* Boutons d'action */}
        <div className={styles.actionsSection}>
          <FlexContainer gap="sm">
            {/* Bouton Retour */}
            <Button
              variant="outline-secondary"
              onClick={navigateToList}
              disabled={isSubmitting}
              iconStart="arrow-left"
            >
              Retour
            </Button>

            {/* Bouton Supprimer (seulement en mode édition) */}
            {!isNewFromUrl && (
              <Button
                variant="outline-danger"
                onClick={onDelete}
                disabled={isSubmitting}
                iconStart="trash"
              >
                Supprimer
              </Button>
            )}

            {/* Bouton Annuler */}
            <Button
              variant="outline-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              iconStart="x-lg"
            >
              Annuler
            </Button>

            {/* Bouton Enregistrer */}
            <Button
              variant="primary"
              onClick={onSave}
              disabled={isSubmitting || !canSave}
              iconStart={isSubmitting ? null : "check-lg"}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </FlexContainer>
        </div>
      </FlexContainer>
    </div>
  );
}; 