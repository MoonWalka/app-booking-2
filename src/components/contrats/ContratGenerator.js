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
  
  // Pour l'instant, utiliser la version desktop dans tous les cas
  // Si une version spécifique pour mobile est nécessaire à l'avenir,
  // elle pourra être importée et utilisée ici
  return <DesktopContratGenerator {...props} />;
}

export default ContratGenerator;
