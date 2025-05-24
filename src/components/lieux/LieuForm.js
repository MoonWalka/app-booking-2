// src/components/lieux/LieuForm.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import LieuxDesktopForm from './desktop/LieuForm';
import LieuMobileForm from './mobile/LieuMobileForm'; // NOUVEAU: Composant mobile finalisé

/**
 * Composant wrapper responsive pour le formulaire de lieu
 * Utilise maintenant les versions desktop et mobile complètes
 */
function LieuForm(props) {
  const { isMobile } = useResponsive(); // FINALISATION INTELLIGENTE: Variable maintenant utilisée !
  
  // Rendu conditionnel complet desktop/mobile
  return isMobile ? (
    <LieuMobileForm {...props} />
  ) : (
    <LieuxDesktopForm {...props} />
  );
}

export default LieuForm;
