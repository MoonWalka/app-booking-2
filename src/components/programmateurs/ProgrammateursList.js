// src/components/programmateurs/ProgrammateursList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  // Fonction de navigation vers les détails d'un programmateur
  const handleNavigateToDetails = (programmateurId) => {
    navigate(`/programmateurs/${programmateurId}`);
  };
  
  // Rendu conditionnel simple avec la prop de navigation
  return isMobile ? (
    <ProgrammateursMobileList {...props} onNavigateToDetails={handleNavigateToDetails} />
  ) : (
    <ProgrammateursDesktopList {...props} onNavigateToDetails={handleNavigateToDetails} />
  );
}

export default ProgrammateursList;
