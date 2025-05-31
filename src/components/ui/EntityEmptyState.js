import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import styles from './EntityEmptyState.module.css';

/**
 * État vide générique pour toutes les listes d'entités
 * Remplace ArtistesEmptyState, ConcertsEmptyState, etc.
 * 
 * @param {Object} props - Props du composant
 * @param {string} props.entityType - Type d'entité (artistes, concerts, etc.)
 * @param {string} props.entityTypeSingular - Type d'entité au singulier
 * @param {string} props.icon - Classe d'icône Bootstrap Icons
 * @param {string} props.searchTerm - Terme de recherche actuel
 * @param {Function} props.onAdd - Fonction d'ajout d'entité
 * @param {string} props.addLabel - Texte du bouton d'ajout
 * @param {boolean} props.showAddButton - Afficher le bouton d'ajout
 * @param {string} props.title - Titre personnalisé
 * @param {string} props.message - Message personnalisé
 * @param {React.ReactNode} props.illustration - Illustration personnalisée
 * @param {React.ReactNode} props.actions - Actions personnalisées
 */
const EntityEmptyState = ({
  entityType = 'éléments',
  entityTypeSingular = 'élément',
  icon = 'bi-inbox',
  searchTerm = '',
  onAdd,
  addLabel,
  showAddButton = true,
  title,
  message,
  illustration,
  actions,
  ...props
}) => {
  // Générer les textes par défaut basés sur le contexte
  const getDefaultTitle = () => {
    if (searchTerm) {
      return `Aucun ${entityTypeSingular} trouvé`;
    }
    return `Aucun ${entityTypeSingular} pour le moment`;
  };

  const getDefaultMessage = () => {
    if (searchTerm) {
      return `Votre recherche "${searchTerm}" n'a donné aucun résultat. Essayez avec d'autres termes ou ajoutez un nouveau ${entityTypeSingular}.`;
    }
    return `Vous n'avez pas encore ajouté de ${entityType}. Commencez par créer votre premier ${entityTypeSingular}.`;
  };

  const getDefaultAddLabel = () => {
    return addLabel || `Ajouter un ${entityTypeSingular}`;
  };

  const finalTitle = title || getDefaultTitle();
  const finalMessage = message || getDefaultMessage();
  const finalAddLabel = getDefaultAddLabel();

  return (
    <div className={styles.emptyStateContainer} {...props}>
      <div className={styles.contentWrapper}>
        {/* Illustration */}
        <div className={styles.illustrationContainer}>
          {illustration ? (
            illustration
          ) : (
            <div className={styles.defaultIllustration}>
              <i className={`${icon} ${styles.emptyIcon}`}></i>
              {searchTerm && (
                <i className="bi bi-search ${styles.searchOverlay}"></i>
              )}
            </div>
          )}
        </div>
        
        {/* Texte */}
        <div className={styles.textContent}>
          <h3 className={styles.title}>{finalTitle}</h3>
          <p className={styles.message}>{finalMessage}</p>
        </div>
        
        {/* Actions */}
        <div className={styles.actionsContainer}>
          {searchTerm ? (
            <div className={styles.searchActions}>
              <Button
                variant="outline-primary"
                onClick={() => window.location.reload()}
                className={styles.clearSearchButton}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Effacer la recherche
              </Button>
              {showAddButton && onAdd && (
                <Button
                  variant="primary"
                  onClick={onAdd}
                  className={styles.addButton}
                >
                  <i className="bi bi-plus"></i>
                  {finalAddLabel}
                </Button>
              )}
            </div>
          ) : (
            <div className={styles.defaultActions}>
              {showAddButton && onAdd && (
                <Button
                  variant="primary"
                  onClick={onAdd}
                  className={styles.addButton}
                  size="lg"
                >
                  <i className="bi bi-plus"></i>
                  {finalAddLabel}
                </Button>
              )}
              {actions && (
                <div className={styles.customActions}>
                  {actions}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

EntityEmptyState.propTypes = {
  entityType: PropTypes.string,
  entityTypeSingular: PropTypes.string,
  icon: PropTypes.string,
  searchTerm: PropTypes.string,
  onAdd: PropTypes.func,
  addLabel: PropTypes.string,
  showAddButton: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  illustration: PropTypes.node,
  actions: PropTypes.node,
};

export default EntityEmptyState;