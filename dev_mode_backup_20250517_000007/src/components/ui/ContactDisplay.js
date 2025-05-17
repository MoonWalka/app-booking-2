import React from 'react';
import PropTypes from 'prop-types';
import styles from './ContactDisplay.module.css';

/**
 * Composant pour afficher les informations de contact
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.nom - Nom du contact
 * @param {string} props.prenom - Prénom du contact
 * @param {string} props.fonction - Fonction du contact
 * @param {string} props.email - Email du contact
 * @param {string} props.telephone - Téléphone du contact
 * @param {string} props.variant - Variante d'affichage ('default', 'compact', 'inline')
 * @param {string} props.emptyText - Texte à afficher quand une information est manquante
 * @param {string} props.className - Classes CSS additionnelles
 */
const ContactDisplay = ({
  nom = '',
  prenom = '',
  fonction = '',
  email = '',
  telephone = '',
  variant = 'default',
  emptyText = 'Non spécifié',
  className = '',
}) => {
  // Formatter le nom complet
  const fullName = () => {
    if (prenom && nom) return `${prenom} ${nom}`;
    if (nom) return nom;
    if (prenom) return prenom;
    return null;
  };

  // Classe en fonction de la variante
  const getContainerClass = () => {
    switch (variant) {
      case 'compact': return styles.contactCompact;
      case 'inline': return styles.contactInline;
      default: return styles.contactDefault;
    }
  };

  return (
    <div className={`${getContainerClass()} ${className}`}>
      {fullName() ? (
        <div className={styles.contactName}>
          <i className="bi bi-person me-2"></i>
          {fullName()}
          {fonction && <span className={styles.contactFunction}>{fonction}</span>}
        </div>
      ) : variant === 'default' && (
        <div className={styles.contactEmpty}>
          <i className="bi bi-person me-2"></i>
          <span>{emptyText}</span>
        </div>
      )}
      
      {email ? (
        <div className={styles.contactItem}>
          <i className="bi bi-envelope me-2"></i>
          <a href={`mailto:${email}`} className={styles.contactLink}>
            {email}
          </a>
        </div>
      ) : variant === 'default' && (
        <div className={styles.contactEmpty}>
          <i className="bi bi-envelope me-2"></i>
          <span>{emptyText}</span>
        </div>
      )}
      
      {telephone ? (
        <div className={styles.contactItem}>
          <i className="bi bi-telephone me-2"></i>
          <a href={`tel:${telephone}`} className={styles.contactLink}>
            {telephone}
          </a>
        </div>
      ) : variant === 'default' && (
        <div className={styles.contactEmpty}>
          <i className="bi bi-telephone me-2"></i>
          <span>{emptyText}</span>
        </div>
      )}
    </div>
  );
};

ContactDisplay.propTypes = {
  nom: PropTypes.string,
  prenom: PropTypes.string,
  fonction: PropTypes.string,
  email: PropTypes.string,
  telephone: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'compact', 'inline']),
  emptyText: PropTypes.string,
  className: PropTypes.string,
};

export default ContactDisplay;