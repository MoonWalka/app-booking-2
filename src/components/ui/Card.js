import React, { useState } from 'react';
import PropTypes from 'prop-types';
// Migration: Utiliser div natif au lieu de BootstrapCard
import classNames from 'classnames';
import styles from './Card.module.css';

/**
 * Composant Card standardisé pour l'application TourCraft
 * 
 * @param {Object} props - Propriétés du composant
 * @param {ReactNode} props.children - Contenu de la carte
 * @param {string} [props.title] - Titre de la carte
 * @param {ReactNode} [props.icon] - Icône à afficher dans l'en-tête
 * @param {string} [props.className] - Classes CSS additionnelles
 * @param {string} [props.headerClassName] - Classes CSS additionnelles pour le header
 * @param {boolean} [props.isEditing=false] - Indique si la carte est en mode édition
 * @param {boolean} [props.isHoverable=true] - Indique si la carte doit avoir une animation au survol
 * @param {string} [props.variant] - Variante de la carte (primary, success, warning, danger)
 * @param {ReactNode} [props.headerActions] - Actions à afficher dans l'en-tête (côté droit)
 * @param {ReactNode} [props.footerContent] - Contenu du pied de page (si nécessaire)
 * @param {Function} [props.onClick] - Fonction appelée au clic sur la carte
 * @param {boolean} [props.collapsible=false] - Indique si la carte peut être réduite/agrandie
 * @param {boolean} [props.defaultCollapsed=false] - État initial de la carte (réduite ou non)
 * @param {Function} [props.onCollapseToggle] - Fonction appelée lors du changement d'état de réduction
 * @param {boolean} [props.hasDropdown=false] - Indique si la carte contient des dropdowns (désactive overflow:hidden)
 */
const Card = ({
  children,
  title,
  icon,
  className = '',
  headerClassName = '',
  isEditing = false,
  isHoverable = true,
  variant,
  headerActions,
  footerContent,
  onClick,
  collapsible = false,
  defaultCollapsed = false,
  onCollapseToggle,
  hasDropdown = false,
  ...rest
}) => {
  // Déterminer les classes CSS à appliquer
  const cardClassNames = classNames(
    styles.card,
    {
      [styles.cardEditing]: isEditing,
      [styles.cardHoverable]: isHoverable && !isEditing,
      [styles.cardWithDropdown]: hasDropdown,
      [styles[`card${variant?.charAt(0).toUpperCase() + variant?.slice(1) || ''}`]]: variant
    },
    'tc-card',
    isEditing ? 'editing' : '',
    isHoverable && !isEditing ? 'tc-card-hover' : '',
    variant ? `tc-card-${variant}` : '',
    className
  );

  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const handleCollapseToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseToggle) onCollapseToggle(newState);
  };

  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  return (
    <div 
      className={cardClassNames}
      onClick={handleClick}
      {...rest}
    >
      {(title || icon || headerActions || collapsible) && (
        <div className={classNames(styles.cardHeader, headerClassName, 'tc-card-header')}>
          <div className={styles.headerTitleSection}>
            {icon && <span className={styles.cardIcon}>{icon}</span>}
            {title && <h4 className={styles.cardTitle}>{title}</h4>}
          </div>
          
          {(collapsible || headerActions) && (
            <div className={styles.headerActions}>
              {collapsible && (
                <button onClick={handleCollapseToggle} className={styles.collapseButton}>
                  {isCollapsed ? '▸' : '▾'}
                </button>
              )}
              {headerActions}
            </div>
          )}
        </div>
      )}

      {!isCollapsed && (
        <div className={classNames(styles.cardBody, 'tc-card-body')}>
          {children}
        </div>
      )}

      {footerContent && (
        <div className={classNames(styles.cardFooter, 'tc-card-footer')}>
          {footerContent}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  isEditing: PropTypes.bool,
  isHoverable: PropTypes.bool,
  variant: PropTypes.string,
  headerActions: PropTypes.node,
  footerContent: PropTypes.node,
  onClick: PropTypes.func,
  collapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  onCollapseToggle: PropTypes.func,
  hasDropdown: PropTypes.bool
};

// Composant Card natif TourCraft - Plus de dépendance Bootstrap

export default Card;