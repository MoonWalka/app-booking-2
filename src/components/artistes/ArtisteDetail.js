// src/components/artistes/ArtisteDetail.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ArtistesDesktopView from './desktop/ArtisteView';
import ArtistesMobileView from './mobile/ArtisteView';

/**
 * Composant conteneur pour les détails d'un artiste
 * Utilise le hook useResponsive pour afficher soit la version desktop, soit la version mobile
 */
const ArtisteDetail = () => {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <ArtistesMobileView />
  ) : (
    <ArtistesDesktopView />
  );
};

export default ArtisteDetail;