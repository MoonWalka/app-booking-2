// src/components/structures/StructureDetails.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import StructuresDesktopDetails from './desktop/StructureDetails';
import StructuresMobileDetails from './mobile/StructureDetails';

/**
 * Composant wrapper responsive pour les détails d'une structure
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function StructureDetails(props) {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <StructuresMobileDetails {...props} />
  ) : (
    <StructuresDesktopDetails {...props} />
  );
}

export default StructureDetails;