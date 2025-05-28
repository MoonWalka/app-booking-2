import React from 'react';
import PropTypes from 'prop-types';
import Card from '@/components/ui/Card';

/**
 * CardSection - Section réutilisable pour les formulaires et vues détails
 * @param {string} title - Titre de la section
 * @param {ReactNode} icon - Icône à afficher dans l'en-tête
 * @param {ReactNode} headerActions - Actions à afficher dans l'en-tête (optionnel)
 * @param {ReactNode} footerContent - Pied de carte (optionnel)
 * @param {string} className - Classes CSS additionnelles (optionnel)
 * @param {string} headerClassName - Classes CSS additionnelles pour le header (optionnel)
 * @param {boolean} isEditing - Mode édition (optionnel)
 * @param {ReactNode} children - Contenu de la section
 * @param {boolean} hasDropdown - Indique si la section contient des dropdowns (optionnel)
 */
const CardSection = ({
  title,
  icon,
  headerActions,
  footerContent,
  className = '',
  headerClassName = '',
  isEditing = false,
  collapsible,
  defaultCollapsed,
  onCollapseToggle,
  hasDropdown = false,
  children,
  ...rest
}) => (
  <Card
    title={title}
    icon={icon}
    headerActions={headerActions}
    footerContent={footerContent}
    className={className}
    headerClassName={headerClassName}
    isEditing={isEditing}
    collapsible={collapsible}
    defaultCollapsed={defaultCollapsed}
    onCollapseToggle={onCollapseToggle}
    hasDropdown={hasDropdown}
    {...rest}
  >
    {children}
  </Card>
);

CardSection.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.node,
  headerActions: PropTypes.node,
  footerContent: PropTypes.node,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  isEditing: PropTypes.bool,
  collapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  onCollapseToggle: PropTypes.func,
  hasDropdown: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default CardSection;
