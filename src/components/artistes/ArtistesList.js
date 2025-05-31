// src/components/artistes/ArtistesList.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ArtistesDesktopList from './desktop/ArtistesList';
import ArtistesMobileList from './mobile/ArtistesList';

/**
 * Composant wrapper responsive pour la liste des artistes
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function ArtistesList(props) {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <ArtistesMobileList {...props} />
  ) : (
    <ArtistesDesktopList {...props} />
  );
}

export default ArtistesList;