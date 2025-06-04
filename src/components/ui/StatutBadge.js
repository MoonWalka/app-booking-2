import React from 'react';
import PropTypes from 'prop-types';
import styles from './StatutBadge.module.css';

/**
 * Composant générique pour afficher des badges de statut
 * Utilisé pour les statuts de concerts, contrats, et autres entités
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.status - Code du statut à afficher
 * @param {string} props.entityType - Type d'entité (concert, contrat, etc.) pour les statuts spécifiques
 * @param {string} props.text - Texte à afficher (remplace le label du statut si défini)
 * @param {string} props.size - Taille du badge ('small', 'medium', 'large')
 * @param {string} props.className - Classes CSS additionnelles
 * @returns {JSX.Element} Badge de statut
 */
const StatutBadge = ({
  status,
  entityType = 'default',
  text,
  size = 'medium',
  className = '',
  ...otherProps
}) => {
  // Configuration des statuts par type d'entité
  const statusConfigs = {
    // Statuts génériques (utilisables pour tout type d'entité)
    default: {
      active: { color: 'success', icon: 'bi-check-circle', label: 'Actif' },
      inactive: { color: 'secondary', icon: 'bi-dash-circle', label: 'Inactif' },
      pending: { color: 'warning', icon: 'bi-clock', label: 'En attente' },
      error: { color: 'danger', icon: 'bi-exclamation-circle', label: 'Erreur' },
      draft: { color: 'info', icon: 'bi-pencil', label: 'Brouillon' }
    },
    // Statuts spécifiques aux concerts
    concert: {
      en_negociation: { color: 'info', icon: 'bi-chat-dots', label: 'En négociation' },
      option: { color: 'warning', icon: 'bi-calendar-check', label: 'Option' },
      confirme: { color: 'success', icon: 'bi-calendar-check-fill', label: 'Confirmé' },
      annule: { color: 'danger', icon: 'bi-calendar-x', label: 'Annulé' },
      termine: { color: 'secondary', icon: 'bi-calendar-check', label: 'Terminé' },
      contact: { color: 'info', icon: 'bi-person-lines-fill', label: 'Contact' }
    },
    // Statuts spécifiques aux contrats
    contrat: {
      brouillon: { color: 'info', icon: 'bi-file-earmark', label: 'Brouillon' },
      envoye: { color: 'warning', icon: 'bi-send', label: 'Envoyé' },
      signe: { color: 'success', icon: 'bi-file-earmark-check', label: 'Signé' },
      annule: { color: 'danger', icon: 'bi-file-earmark-x', label: 'Annulé' },
      archive: { color: 'secondary', icon: 'bi-archive', label: 'Archivé' }
    },
    // Statuts spécifiques aux factures
    facture: {
      brouillon: { color: 'info', icon: 'bi-file-earmark', label: 'Brouillon' },
      envoyee: { color: 'warning', icon: 'bi-send', label: 'Envoyée' },
      payee: { color: 'success', icon: 'bi-credit-card', label: 'Payée' },
      retard: { color: 'danger', icon: 'bi-exclamation-circle', label: 'En retard' },
      annulee: { color: 'secondary', icon: 'bi-file-earmark-x', label: 'Annulée' }
    }
  };

  // Obtenir la configuration pour ce statut
  const getStatusConfig = () => {
    // Chercher d'abord dans les statuts spécifiques à l'entité
    if (statusConfigs[entityType] && statusConfigs[entityType][status]) {
      return statusConfigs[entityType][status];
    }
    // Sinon utiliser les statuts génériques
    if (statusConfigs.default[status]) {
      return statusConfigs.default[status];
    }
    // Statut inconnu
    return { 
      color: 'secondary', 
      icon: 'bi-question-circle', 
      label: text || status || 'Inconnu' 
    };
  };

  const statusConfig = getStatusConfig();
  const label = text || statusConfig.label;

  return (
    <div 
      className={`${styles.badge} ${styles[statusConfig.color]} ${styles[size]} ${className}`}
      title={label}
      {...otherProps}
    >
      {statusConfig.icon && (
        <i className={`bi ${statusConfig.icon} ${styles.icon}`}></i>
      )}
      <span className={styles.label}>{label}</span>
    </div>
  );
};

StatutBadge.propTypes = {
  status: PropTypes.string,
  entityType: PropTypes.oneOf(['default', 'concert', 'contrat', 'facture', 'contact']),
  text: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string
};

export default StatutBadge;
