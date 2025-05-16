import React from 'react';
import PropTypes from 'prop-types';
import styles from './AddressDisplay.module.css';

/**
 * Composant pour afficher une adresse formatée
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.adresse - Ligne d'adresse (rue et numéro)
 * @param {string} props.codePostal - Code postal
 * @param {string} props.ville - Ville
 * @param {string} props.pays - Pays
 * @param {number} props.latitude - Latitude pour la carte
 * @param {number} props.longitude - Longitude pour la carte
 * @param {string} props.variant - Variante d'affichage ('default', 'compact', 'inline')
 * @param {boolean} props.showMap - Indique si un lien vers la carte doit être affiché
 * @param {string} props.emptyText - Texte à afficher quand l'adresse est manquante
 * @param {string} props.className - Classes CSS additionnelles
 */
const AddressDisplay = ({
  adresse = '',
  codePostal = '',
  ville = '',
  pays = 'France',
  latitude = null,
  longitude = null,
  variant = 'default',
  showMap = false,
  emptyText = 'Adresse non spécifiée',
  className = '',
}) => {
  // Vérifier si l'adresse est complète
  const hasAddress = adresse || codePostal || ville;
  
  // Classe en fonction de la variante
  const getContainerClass = () => {
    switch (variant) {
      case 'compact': return styles.addressCompact;
      case 'inline': return styles.addressInline;
      default: return styles.addressDefault;
    }
  };

  // Construire l'URL Google Maps
  const getMapsUrl = () => {
    if (latitude && longitude) {
      return `https://www.google.com/maps?q=${latitude},${longitude}`;
    }
    
    if (adresse || codePostal || ville) {
      const addressParts = [];
      if (adresse) addressParts.push(adresse);
      if (codePostal) addressParts.push(codePostal);
      if (ville) addressParts.push(ville);
      if (pays && pays !== 'France') addressParts.push(pays);
      
      return `https://www.google.com/maps/search/${encodeURIComponent(addressParts.join(', '))}`;
    }
    
    return '#';
  };

  // Si pas d'adresse, afficher le message vide
  if (!hasAddress) {
    return (
      <div className={`${getContainerClass()} ${styles.empty} ${className}`}>
        <i className="bi bi-geo-alt me-2"></i>
        <span>{emptyText}</span>
      </div>
    );
  }

  return (
    <div className={`${getContainerClass()} ${className}`}>
      <div className={styles.addressContent}>
        <div className={styles.addressIcon}>
          <i className="bi bi-geo-alt"></i>
        </div>
        <div className={styles.addressDetails}>
          {adresse && (
            <div className={styles.addressLine}>{adresse}</div>
          )}
          
          <div className={styles.addressLocation}>
            {codePostal && <span>{codePostal}</span>}
            {ville && <span>{codePostal ? ` ${ville}` : ville}</span>}
          </div>
          
          {pays && pays !== 'France' && (
            <div className={styles.addressCountry}>{pays}</div>
          )}
        </div>
      </div>
      
      {showMap && hasAddress && (
        <a 
          href={getMapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapLink}
        >
          <i className="bi bi-map me-1"></i>
          Voir sur la carte
        </a>
      )}
    </div>
  );
};

AddressDisplay.propTypes = {
  adresse: PropTypes.string,
  codePostal: PropTypes.string,
  ville: PropTypes.string,
  pays: PropTypes.string,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'compact', 'inline']),
  showMap: PropTypes.bool,
  emptyText: PropTypes.string,
  className: PropTypes.string,
};

export default AddressDisplay;