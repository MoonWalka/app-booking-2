// src/components/programmateurs/ProgrammateurDetails.js
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common/useResponsive'; // Utilisation du hook recommandé
import ProgrammateurForm from '@/components/programmateurs/ProgrammateurForm';

// Import custom hooks
import useProgrammateurDetails from '@/hooks/programmateurs/useProgrammateurDetails';

/**
 * Composant conteneur pour les détails d'un programmateur
 * Décide d'afficher soit la vue, soit le formulaire d'édition
 */
function ProgrammateurDetails() {
  const { id } = useParams();
  const location = useLocation();
  const responsive = useResponsive();
  
  // Utilisation du hook pour gérer l'état global
  const { isEditing } = useProgrammateurDetails(id);
  
  // En mode édition, afficher le formulaire
  if (isEditing) {
    return <ProgrammateurForm id={id} />;
  }
  
  // En mode visualisation, afficher la vue responsive
  const ProgrammateurView = responsive.getResponsiveComponent({
    desktopPath: 'programmateurs/desktop/ProgrammateurView',
    mobilePath: 'programmateurs/mobile/ProgrammateurView'
  });
  
  return <ProgrammateurView id={id} />;
}

export default ProgrammateurDetails;
