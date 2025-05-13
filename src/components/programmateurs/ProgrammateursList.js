// src/components/programmateurs/ProgrammateursList.js
import React from 'react';
import { useResponsive } from '@/hooks/common';
import { useNavigate } from 'react-router-dom';

function ProgrammateursList(props) {
  const responsive = useResponsive();
  const navigate = useNavigate();
  
  const ResponsiveComponent = responsive.getResponsiveComponent({
    desktopPath: 'programmateurs/desktop/ProgrammateursList',
    mobilePath: 'programmateurs/mobile/ProgrammateursList'
  });

  function handleNavigateToDetails(id) {
    console.log('[TRACE] [ProgrammateursList] Navigation vers les détails du programmateur avec ID:', id);
    navigate(`/programmateurs/${id}`);
  }
  
  // Passer les props au composant responsif
  return <ResponsiveComponent 
    {...props} 
    onNavigateToDetails={handleNavigateToDetails} 
  />;
}

export default ProgrammateursList;
