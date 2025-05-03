// src/components/concerts/ConcertDetails.js
import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common/useResponsive'; // Utilisation du nouveau hook recommandé
import ConcertForm from '@/components/concerts/ConcertForm';

// Hook pour les détails du concert
import useConcertDetails from '@/hooks/concerts/useConcertDetails';

/**
 * Composant conteneur pour les détails d'un concert
 * Décide d'afficher soit la vue, soit le formulaire d'édition
 */
function ConcertDetails() {
  const { id } = useParams();
  const location = useLocation();
  const responsive = useResponsive();
  
  // Utilisation du hook useConcertDetails pour gérer l'état global
  const { isEditMode, loading } = useConcertDetails(id, location);
  
  // En mode édition, afficher le formulaire
  if (isEditMode) {
    return <ConcertForm id={id} />;
  }
  
  // En mode visualisation, afficher la vue responsive
  const ConcertView = responsive.getResponsiveComponent({
    desktopPath: 'concerts/desktop/ConcertView',
    mobilePath: 'concerts/mobile/ConcertView'
  });
  
  return <ConcertView id={id} />;
}

export default ConcertDetails;
