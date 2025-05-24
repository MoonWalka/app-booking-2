// src/components/contrats/ContratGenerator.js
import React from 'react';
import { useResponsive } from '@/hooks/common';
import DesktopContratGenerator from './desktop/ContratGenerator';

/**
 * Wrapper responsive pour le générateur de contrats
 * Note: Pour le moment, seule la version desktop est implémentée
 * À l'avenir, une version mobile pourrait être ajoutée si nécessaire
 */
function ContratGenerator(props) {
  const { isMobile } = useResponsive();
  
  // Architecture responsive prête pour l'avenir
  if (isMobile) {
    // Pour l'instant, utiliser la version desktop même sur mobile
    // TODO: Implémenter MobileContratGenerator si nécessaire
    return <DesktopContratGenerator {...props} />;
  }
  
  // Version desktop
  return <DesktopContratGenerator {...props} />;
}

export default ContratGenerator;
