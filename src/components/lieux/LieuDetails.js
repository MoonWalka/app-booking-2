// src/components/lieux/LieuDetails.js
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import { useLieuDetails } from '@/hooks/lieux';
import LieuForm from '@/components/lieux/LieuForm';

/**
 * Composant conteneur pour les détails d'un lieu
 * Décide d'afficher soit la vue, soit le formulaire d'édition
 */
function LieuDetails() {
  const { id } = useParams();
  const location = useLocation();
  const responsive = useResponsive();
  
  // Utilisation du hook useLieuDetails pour gérer l'état global
  const { isEditing } = useLieuDetails(id);
  
  // En mode édition, afficher le formulaire
  if (isEditing) {
    return <LieuForm id={id} />;
  }
  
  // En mode visualisation, afficher la vue responsive
  const LieuView = responsive.getResponsiveComponent({
    desktopPath: 'lieux/desktop/LieuView',
    mobilePath: 'lieux/mobile/LieuView'
  });
  
  return <LieuView id={id} />;
}

export default LieuDetails;
