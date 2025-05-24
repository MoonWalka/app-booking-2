// src/components/artistes/ArtisteForm.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ArtistesDesktopForm from './desktop/ArtisteForm';
import ArtistesMobileForm from './mobile/ArtisteForm';

/**
 * Composant wrapper responsive pour le formulaire d'artiste
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function ArtisteForm(props) {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <ArtistesMobileForm {...props} />
  ) : (
    <ArtistesDesktopForm {...props} />
  );
}

export default ArtisteForm;