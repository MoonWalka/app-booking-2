// src/components/lieux/LieuxList.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import LieuxDesktopList from './desktop/LieuxList';
import LieuxMobileList from './mobile/LieuxMobileList'; // NOUVEAU: Composant mobile finalisé

/**
 * Composant wrapper responsive pour la liste des lieux
 * Utilise maintenant les versions desktop et mobile complètes
 */
function LieuxList(props) {
  const { isMobile } = useResponsive(); // FINALISATION INTELLIGENTE: Variable maintenant utilisée !
  
  // Rendu conditionnel complet desktop/mobile
  return isMobile ? (
    <LieuxMobileList {...props} />
  ) : (
    <LieuxDesktopList {...props} />
  );
}

export default LieuxList;
