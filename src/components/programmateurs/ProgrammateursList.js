// src/components/programmateurs/ProgrammateursList.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ProgrammateursDesktopList from './desktop/ProgrammateursList';
import ProgrammateursMobileList from './mobile/ProgrammateursList';

/**
 * Composant wrapper responsive pour la liste des programmateurs
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function ProgrammateursList(props) {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <ProgrammateursMobileList {...props} />
  ) : (
    <ProgrammateursDesktopList {...props} />
  );
}

export default ProgrammateursList;
