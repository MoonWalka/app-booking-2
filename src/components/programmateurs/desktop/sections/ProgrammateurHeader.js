import React from 'react';
import Button from '@components/ui/Button';
import FlexContainer from '@components/ui/FlexContainer';
import styles from './ProgrammateurHeader.module.css';

/**
 * ProgrammateurHeader - En-tête du programmateur
 * Logique conditionnelle comme LieuHeader : 
 * - Mode lecture : Retour + Modifier
 * - Mode édition : Enregistrer + Supprimer + Annuler
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

        {/* Boutons d'action - Logique conditionnelle comme LieuHeader */}
        <div className={styles.actionsSection}>
          <FlexContainer gap="sm">
            {isEditMode ? (
              // Boutons en mode édition
              <>
                <Button
                  variant="success"
                  onClick={onSave}
                  disabled={isSubmitting || !canSave}
                  iconStart={isSubmitting ? null : "check-lg"}
                  type="submit"
                  className={styles.actionBtn}
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

                {/* Bouton Supprimer (seulement si ce n'est pas un nouveau programmateur) */}
                {!isNewFromUrl && (
                  <Button
                    variant="danger"
                    onClick={onDelete}
                    disabled={isSubmitting}
                    iconStart="trash"
                    className={styles.actionBtn}
                  >
                    Supprimer
                  </Button>
                )}

                <Button
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  iconStart="x-lg"
                  className={styles.actionBtn}
                >
                  Annuler
                </Button>
              </>
            ) : (
              // Boutons en mode lecture
              <>
                <Button
                  variant="secondary"
                  onClick={navigateToList}
                  iconStart="arrow-left"
                  className={styles.actionBtn}
                >
                  Retour
                </Button>

                <Button
                  variant="outline-primary"
                  onClick={onEdit}
                  iconStart="pencil"
                  className={styles.actionBtn}
                >
                  Modifier
                </Button>
              </>
            )}
          </FlexContainer>
        </div>
      </FlexContainer>
    </div>
  );
}; 