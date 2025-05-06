// src/components/programmateurs/ProgrammateurDetails.js
import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import { useProgrammateurDetails } from '@/hooks/programmateurs';
import ProgrammateurForm from '@/components/programmateurs/ProgrammateurForm';

/**
 * Composant conteneur pour les détails d'un programmateur
 * Décide d'afficher soit la vue, soit le formulaire d'édition
 */
function ProgrammateurDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const responsive = useResponsive();
  
  // Utilisation du hook pour gérer l'état global
  const { isEditing } = useProgrammateurDetails(id);
  
  // Si on est sur le chemin d'édition, afficher le formulaire
  if (location.pathname.includes('/edit/')) {
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
