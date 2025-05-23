import React from 'react';
import PropTypes from 'prop-types';
import { Card as BootstrapCard } from 'react-bootstrap';
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
 * @param {boolean} [props.isEditing=false] - Indique si la carte est en mode édition
 * @param {boolean} [props.isHoverable=true] - Indique si la carte doit avoir une animation au survol
 * @param {string} [props.variant] - Variante de la carte (primary, success, warning, danger)
 * @param {ReactNode} [props.headerActions] - Actions à afficher dans l'en-tête (côté droit)
 * @param {ReactNode} [props.footerContent] - Contenu du pied de page (si nécessaire)
 * @param {Function} [props.onClick] - Fonction appelée au clic sur la carte
 */
const Card = ({
  children,
  title,
  icon,
  className = '',
  isEditing = false,
  isHoverable = true,
  variant,
  headerActions,
  footerContent,
  onClick,
  ...rest
}) => {
  // Déterminer les classes CSS à appliquer
  const cardClassNames = classNames(
    styles.card,
    {
      [styles.cardEditing]: isEditing,
      [styles.cardHoverable]: isHoverable && !isEditing,
      [styles[`card${variant?.charAt(0).toUpperCase() + variant?.slice(1) || ''}`]]: variant
    },
    'tc-card',
    isEditing ? 'editing' : '',
    isHoverable && !isEditing ? 'tc-card-hover' : '',
    variant ? `tc-card-${variant}` : '',
    className
  );

  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  return (
    <BootstrapCard 
      className={cardClassNames}
      onClick={handleClick}
      {...rest}
    >
      {(title || icon || headerActions) && (
        <BootstrapCard.Header className={classNames(styles.cardHeader, 'tc-card-header')}>
          <div className={styles.headerTitleSection}>
            {icon && <span className={styles.cardIcon}>{icon}</span>}
            {title && <BootstrapCard.Title className={styles.cardTitle}>{title}</BootstrapCard.Title>}
          </div>
          
          {headerActions && (
            <div className={styles.headerActions}>
              {headerActions}
            </div>
          )}
        </BootstrapCard.Header>
      )}

      <BootstrapCard.Body className={classNames(styles.cardBody, 'tc-card-body')}>
        {children}
      </BootstrapCard.Body>

      {footerContent && (
        <BootstrapCard.Footer className={classNames(styles.cardFooter, 'tc-card-footer')}>
          {footerContent}
        </BootstrapCard.Footer>
      )}
    </BootstrapCard>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string,
  isEditing: PropTypes.bool,
  isHoverable: PropTypes.bool,
  variant: PropTypes.string,
  headerActions: PropTypes.node,
  footerContent: PropTypes.node,
  onClick: PropTypes.func
};

// Sous-composants pour une API cohérente
Card.Body = BootstrapCard.Body;
Card.Title = BootstrapCard.Title;
Card.Text = BootstrapCard.Text;
Card.Header = BootstrapCard.Header;
Card.Footer = BootstrapCard.Footer;

export default Card;