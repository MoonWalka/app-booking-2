// src/components/programmateurs/ProgrammateurForm.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ProgrammateurDesktopForm from './desktop/ProgrammateurForm';
import ProgrammateurFormMobile from './mobile/ProgrammateurForm';

/**
 * Composant wrapper responsive pour le formulaire de programmateur
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function ProgrammateurForm(props) {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <ProgrammateurFormMobile {...props} />
  ) : (
    <ProgrammateurDesktopForm {...props} />
  );
}

export default ProgrammateurForm;
