import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import styles from './EntityListHeader.module.css';

/**
 * Header générique pour toutes les listes d'entités
 * Remplace ArtistesListHeader, ConcertsListHeader, ProgrammateursListHeader, etc.
 * 
 * @param {Object} props - Props du composant
 * @param {string} props.title - Titre de la page
 * @param {string} props.icon - Classe d'icône Bootstrap Icons
 * @param {Function} props.onAdd - Fonction d'ajout d'entité
 * @param {string} props.addLabel - Texte du bouton d'ajout
 * @param {boolean} props.showAddButton - Afficher le bouton d'ajout
 * @param {React.ReactNode} props.actions - Actions personnalisées supplémentaires
 * @param {string} props.subtitle - Sous-titre optionnel
 * @param {number} props.count - Nombre total d'entités (pour affichage)
 */
const EntityListHeader = ({
  title,
  icon = 'bi-list',
  onAdd,
  addLabel = 'Ajouter',
  showAddButton = true,
  actions,
  subtitle,
  count,
  ...props
}) => {
  return (
    <div className={styles.headerContainer} {...props}>
      <div className={styles.titleSection}>
        <div className={styles.titleWrapper}>
          {icon && <i className={`${icon} ${styles.titleIcon}`}></i>}
          <div className={styles.titleContent}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {typeof count === 'number' && (
              <span className={styles.countBadge}>
                {count} {count === 1 ? 'élément' : 'éléments'}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.actionsSection}>
        {actions && (
          <div className={styles.customActions}>
            {actions}
          </div>
        )}
        
        {showAddButton && onAdd && (
          <Button
            variant="primary"
            onClick={onAdd}
            className={styles.addButton}
            size="lg"
          >
            <i className="bi bi-plus"></i>
            <span className={styles.addButtonText}>{addLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

EntityListHeader.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  onAdd: PropTypes.func,
  addLabel: PropTypes.string,
  showAddButton: PropTypes.bool,
  actions: PropTypes.node,
  subtitle: PropTypes.string,
  count: PropTypes.number,
};

export default EntityListHeader;