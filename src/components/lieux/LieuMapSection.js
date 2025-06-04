import React from 'react';
import styles from './LieuMapSection.module.css';

/**
 * Section carte Google Maps pour les lieux
 */
const LieuMapSection = ({ entity }) => {
  if (!entity || !entity.adresse) {
    return (
      <div className={styles.noAddress}>
        <i className="bi bi-map text-muted"></i>
        <p className={styles.textMuted}>Aucune adresse disponible pour afficher la carte</p>
      </div>
    );
  }

  const mapQuery = `${entity.adresse}, ${entity.codePostal} ${entity.ville}`;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}`;

  return (
    <div className={styles.mapSection}>
      <div className={styles.mapContainer}>
        <iframe 
          title={`Carte de localisation de ${entity.nom} - ${mapQuery}`}
          src={`${mapUrl}&z=15&output=embed`}
          width="100%" 
          height="400" 
          style={{ border: 'none' }}
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      
      <div className={styles.mapActions}>
        <a 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer" 
          className={styles.mapButton}
        >
          <i className="bi bi-map me-1"></i>
          Voir en plein écran
        </a>
        
        {entity.latitude && entity.longitude && (
          <span className={styles.coordinates}>
            <i className="bi bi-geo me-1"></i>
            {entity.latitude.toFixed(6)}, {entity.longitude.toFixed(6)}
          </span>
        )}
      </div>
    </div>
  );
};

export default LieuMapSection;