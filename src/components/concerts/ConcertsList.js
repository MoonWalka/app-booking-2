// src/components/concerts/ConcertsList.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ConcertsDesktopList from './desktop/ConcertsList';
import ConcertsMobileList from './mobile/ConcertsList';

/**
 * Composant wrapper responsive pour la liste des concerts
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function ConcertsList(props) {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <ConcertsMobileList {...props} />
  ) : (
    <ConcertsDesktopList {...props} />
  );
}

export default ConcertsList;
