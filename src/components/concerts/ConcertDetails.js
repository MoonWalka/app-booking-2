// src/components/concerts/ConcertDetails.js
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ConcertsDesktopView from './desktop/ConcertView';
import ConcertsDesktopViewUltraSimple from './desktop/ConcertViewUltraSimple';
import ConcertsMobileView from './mobile/ConcertView';

/**
 * Composant conteneur pour les détails d'un concert
 * Utilise le hook useResponsive pour afficher soit la version desktop, soit la version mobile
 * MÉTHODOLOGIE SÉCURISÉE : Utilise ConcertViewUltraSimple en mode visualisation pour 0 re-render
 */
const ConcertDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { isMobile } = useResponsive();

  // Détecter le mode édition
  const isEditMode = location.pathname.includes('/edit');

  // LOG DEBUG : montage du composant ConcertDetails
  console.log('[DEBUG][ConcertDetails] Montage avec id:', id, '| isMobile:', isMobile, '| isEditMode:', isEditMode);
  
  // Rendu conditionnel optimisé
  if (isMobile) {
    return <ConcertsMobileView id={id} />;
  }
  
  // Desktop : utiliser la version ultra-simple en mode visualisation
  return isEditMode ? (
    <ConcertsDesktopView id={id} />
  ) : (
    <ConcertsDesktopViewUltraSimple id={id} />
  );
};

export default ConcertDetails;
