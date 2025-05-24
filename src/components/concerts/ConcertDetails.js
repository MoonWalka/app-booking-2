// src/components/concerts/ConcertDetails.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ConcertsDesktopView from './desktop/ConcertView';
import ConcertsMobileView from './mobile/ConcertView';

/**
 * Composant conteneur pour les détails d'un concert
 * Utilise le hook useResponsive pour afficher soit la version desktop, soit la version mobile
 */
const ConcertDetails = () => {
  const { id } = useParams();
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <ConcertsMobileView id={id} />
  ) : (
    <ConcertsDesktopView id={id} />
  );
};

export default ConcertDetails;
