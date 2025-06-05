import React from 'react';
import PropTypes from 'prop-types';
import styles from './EntityCard.module.css';

/**
 * Composant EntityCard - Carte d'entité cliquable avec couleurs thématiques
 * Basé sur le design des cartes de ConcertViewModern
 * 
 * @param {Object} props
 * @param {string} props.entityType - Type d'entité ('artiste', 'contact', 'structure', 'lieu', 'concert')
 * @param {string} props.name - Nom principal de l'entité
 * @param {string} props.subtitle - Sous-titre/type affiché
 * @param {function} props.onClick - Fonction appelée au clic
 * @param {string} [props.className] - Classes CSS additionnelles
 * @param {ReactNode} [props.icon] - Icône personnalisée (utilise l'icône par défaut si non fourni)
 * @param {boolean} [props.disabled] - Désactive la carte
 */
const EntityCard = ({
  entityType,
  name,
  subtitle,
  onClick,
  className = '',
  icon = null,
  disabled = false
}) => {
  // Mapping des types d'entités vers leurs configurations
  const entityConfig = {
    artiste: {
      colorClass: styles.entityArtiste,
      iconClass: styles.entityIconArtiste,
      defaultIcon: '🎤',
      defaultSubtitle: 'Artiste'
    },
    contact: {
      colorClass: styles.entityContact,
      iconClass: styles.entityIconContact,
      defaultIcon: '👤',
      defaultSubtitle: 'Contact'
    },
    structure: {
      colorClass: styles.entityStructure,
      iconClass: styles.entityIconStructure,
      defaultIcon: '🏢',
      defaultSubtitle: 'Structure'
    },
    lieu: {
      colorClass: styles.entityLieu,
      iconClass: styles.entityIconLieu,
      defaultIcon: '📍',
      defaultSubtitle: 'Lieu'
    },
    concert: {
      colorClass: styles.entityConcert,
      iconClass: styles.entityIconConcert,
      defaultIcon: '🎵',
      defaultSubtitle: 'Concert'
    }
  };

  const config = entityConfig[entityType] || entityConfig.contact;
  const displayIcon = icon || config.defaultIcon;
  const displaySubtitle = subtitle || config.defaultSubtitle;

  const handleClick = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick(e);
    }
  };

  const cardClasses = [
    styles.entityCard,
    config.colorClass,
    disabled ? styles.disabled : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      style={{ 
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      <div className={styles.entityContent}>
        <div className={`${styles.entityIcon} ${config.iconClass}`}>
          {typeof displayIcon === 'string' ? (
            <span className={styles.iconEmoji}>{displayIcon}</span>
          ) : (
            displayIcon
          )}
        </div>
        <div className={styles.entityInfo}>
          <p className={styles.entityName} title={name}>
            {name || 'Sans nom'}
          </p>
          <p className={styles.entityType}>
            {displaySubtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

EntityCard.propTypes = {
  entityType: PropTypes.oneOf(['artiste', 'contact', 'structure', 'lieu', 'concert']).isRequired,
  name: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.node,
  disabled: PropTypes.bool
};

export default EntityCard;