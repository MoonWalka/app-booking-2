// src/components/concerts/desktop/sections/ConcertLieuMap.js
import React from 'react';
import styles from './ConcertLieuMap.module.css';

/**
 * Composant carte Google Maps pour afficher le lieu d'un concert
 * Utilise l'iframe Google Maps comme dans l'ancienne version
 */
function ConcertLieuMap({ lieu, onDirections }) {
  console.log('[ConcertLieuMap] Lieu reçu:', lieu);

  // Fonction pour ouvrir Google Maps
  const handleDirections = () => {
    if (lieu?.latitude && lieu?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lieu.latitude},${lieu.longitude}`;
      window.open(url, '_blank');
    } else if (lieu?.adresse) {
      const encodedAddress = encodeURIComponent(lieu.adresse);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(url, '_blank');
    }
    
    if (onDirections) {
      onDirections();
    }
  };

  // Si pas d'adresse, afficher un placeholder stylé
  if (!lieu || !lieu.adresse) {
    return (
      <div className={styles.mapPlaceholder}>
        <div className={styles.mapContent}>
          <i className={styles.mapIcon}>🗺️</i>
          <p className={styles.mapTitle}>{lieu?.nom || 'Lieu du concert'}</p>
          <p className={styles.mapAddress}>
            Aucune adresse disponible pour afficher la carte
          </p>
        </div>
      </div>
    );
  }

  // Construire la requête de carte avec zoom adapté (z=9 pour ~50km de rayon)
  const mapQuery = `${lieu.adresse}${lieu.codePostal ? `, ${lieu.codePostal}` : ''}${lieu.ville ? ` ${lieu.ville}` : ''}`;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=9&output=embed`;

  return (
    <div className={styles.mapContainer}>
      {/* Google Maps iframe */}
      <iframe 
        title={`Carte de localisation de ${lieu.nom} - ${mapQuery}`}
        src={mapUrl}
        width="100%" 
        height="280" 
        style={{ border: 'none' }}
        allowFullScreen="" 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        className={styles.googleMap}
      ></iframe>
    </div>
  );
}

export default ConcertLieuMap;