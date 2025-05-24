// src/components/programmateurs/ProgrammateurForm.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ProgrammateursDesktopForm from './desktop/ProgrammateurForm';
import ProgrammateursMobileForm from './mobile/ProgrammateurForm';

/**
 * Composant wrapper responsive pour le formulaire de programmateur
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function ProgrammateurForm(props) {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <ProgrammateursMobileForm {...props} />
  ) : (
    <ProgrammateursDesktopForm {...props} />
  );
}

export default ProgrammateurForm;
