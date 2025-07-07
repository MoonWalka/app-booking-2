import React from 'react';
import styles from './NiveauDisplay.module.css';

/**
 * Composant pour afficher le niveau d'une date avec un visuel approprié
 * @param {string} niveau - Le niveau de la date (incomplete, interet, option, confirme, annule, reporte)
 */
const NiveauDisplay = ({ niveau }) => {
  // Déterminer le type d'affichage selon le niveau
  const getNiveauConfig = (niveau) => {
    switch (niveau) {
      case 'incomplete':
        return { bars: 1, class: 'incomplete', icon: null };
      case 'interet':
        return { bars: 2, class: 'interet', icon: null };
      case 'option':
        return { bars: 3, class: 'option', icon: null };
      case 'confirme':
        return { bars: 3, class: 'confirme', icon: 'bi-check-circle-fill' };
      case 'annule':
        return { bars: 0, class: 'annule', icon: 'bi-x-circle-fill' };
      case 'reporte':
        return { bars: 0, class: 'reporte', icon: 'bi-arrow-clockwise' };
      default:
        return { bars: 1, class: 'default', icon: null };
    }
  };

  const config = getNiveauConfig(niveau);

  // Si c'est annulé ou reporté, afficher une icône spéciale
  if (config.icon) {
    return (
      <div className={`${styles.niveauCell} ${styles[config.class]}`}>
        <i className={`bi ${config.icon} ${styles.niveauIcon}`}></i>
      </div>
    );
  }

  // Sinon, afficher les barres
  return (
    <div className={styles.niveauCell}>
      <div className={styles.niveauBars}>
        {Array.from({ length: 3 }, (_, index) => (
          <div 
            key={index}
            className={`${styles.niveauBar} ${
              index < config.bars 
                ? `${styles.niveauBarActive} ${styles[config.class]}` 
                : styles.niveauBarInactive
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default NiveauDisplay;