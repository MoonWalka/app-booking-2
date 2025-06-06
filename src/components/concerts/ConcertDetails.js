// src/components/concerts/ConcertDetails.js
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import { useConcertWatcher } from '@/hooks/concerts/useConcertWatcher';

// Imports directs des composants
import ConcertsDesktopView from './desktop/ConcertViewWithRelances';
import ConcertsMobileView from './mobile/ConcertView';

/**
 * Composant conteneur pour les détails d'un concert
 * Utilise le hook useResponsive pour afficher soit la version desktop, soit la version mobile
 * VERSION CORRIGÉE : Le problème de boucle infinie a été résolu dans useConcertDetailsFixed
 */
const ConcertDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { isMobile } = useResponsive();

  // Détecter le mode édition
  const isEditMode = location.pathname.includes('/edit');

  // LOG DEBUG : montage du composant ConcertDetails
  console.log('[DEBUG][ConcertDetails] Montage avec id:', id, '| isMobile:', isMobile, '| isEditMode:', isEditMode);
  
  // Surveiller les changements du concert pour déclencher les relances automatiques
  useConcertWatcher(id, { enabled: !isEditMode });
  
  // Rendu conditionnel optimisé
  if (isMobile) {
    return <ConcertsMobileView id={id} />;
  }
  
  // Desktop : utiliser la version normale (problème de boucle infinie résolu)
  return <ConcertsDesktopView id={id} />;
};

export default ConcertDetails;
