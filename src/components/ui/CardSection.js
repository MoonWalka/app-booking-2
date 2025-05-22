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
 * @param {boolean} isEditing - Mode édition (optionnel)
 * @param {ReactNode} children - Contenu de la section
 */
const CardSection = ({
  title,
  icon,
  headerActions,
  footerContent,
  className = '',
  isEditing = false,
  collapsible,
  defaultCollapsed,
  onCollapseToggle,
  children,
  ...rest
}) => (
  <Card
    title={title}
    icon={icon}
    headerActions={headerActions}
    footerContent={footerContent}
    className={className}
    isEditing={isEditing}
    collapsible={collapsible}
    defaultCollapsed={defaultCollapsed}
    onCollapseToggle={onCollapseToggle}
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
  isEditing: PropTypes.bool,
  collapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  onCollapseToggle: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default CardSection;
