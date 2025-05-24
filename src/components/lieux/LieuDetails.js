// src/components/lieux/LieuDetails.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import LieuxDesktopView from './desktop/LieuView';
import LieuxMobileView from './mobile/LieuView';

/**
 * Composant conteneur pour les détails d'un lieu
 * Utilise le hook useResponsive pour afficher soit la version desktop, soit la version mobile
 */
const LieuDetails = () => {
  const { id } = useParams();
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <LieuxMobileView id={id} />
  ) : (
    <LieuxDesktopView id={id} />
  );
};

export default LieuDetails;
