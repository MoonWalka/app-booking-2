// src/components/artistes/ArtisteDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ArtistesDesktopView from './desktop/ArtisteView';
import ArtistesMobileView from './mobile/ArtisteView';

/**
 * Composant conteneur pour les détails d'un artiste
 * Utilise le hook useResponsive pour afficher soit la version desktop, soit la version mobile
 */
const ArtisteDetail = () => {
  const { id } = useParams();
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple avec passage de l'ID
  return isMobile ? (
    <ArtistesMobileView id={id} />
  ) : (
    <ArtistesDesktopView id={id} />
  );
};

export default ArtisteDetail;