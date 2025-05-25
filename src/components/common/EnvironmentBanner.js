import React from 'react';
import { CURRENT_MODE } from '../../services/firebase-service';
import './EnvironmentBanner.css';

/**
 * Composant qui affiche une bannière indiquant l'environnement actuel
 * Ne s'affiche pas en production
 */
const EnvironmentBanner = () => {
  if (CURRENT_MODE === 'production') return null;
  
  const bannerText = CURRENT_MODE === 'local' ? 
    '🔌 MODE HORS LIGNE' : 
    '🧪 ENVIRONNEMENT DE DÉVELOPPEMENT';
    
  return (
    <div className={`environment-banner environment-${CURRENT_MODE}`}>
      {bannerText}
    </div>
  );
};

export default EnvironmentBanner;
