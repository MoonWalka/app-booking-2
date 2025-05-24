// src/components/forms/FormValidationInterface.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import FormsDesktopValidationInterface from './desktop/FormValidationInterface';
import FormsMobileValidationInterface from './mobile/FormValidationInterface';

/**
 * Composant wrapper responsive pour l'interface de validation des formulaires
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function FormValidationInterface(props) {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <FormsMobileValidationInterface {...props} />
  ) : (
    <FormsDesktopValidationInterface {...props} />
  );
}

export default FormValidationInterface;
