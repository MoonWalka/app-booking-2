// src/components/structures/StructuresList.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import StructuresDesktopList from './desktop/StructuresList';
import StructuresMobileList from './mobile/StructuresList';

/**
 * Composant wrapper responsive pour la liste des structures
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function StructuresList(props) {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <StructuresMobileList {...props} />
  ) : (
    <StructuresDesktopList {...props} />
  );
}

export default StructuresList;