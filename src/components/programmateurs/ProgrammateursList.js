// src/components/programmateurs/ProgrammateursList.js
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive'; // Utilisation du hook recommandé

function ProgrammateursList(props) {
  const responsive = useResponsive();
  
  const ResponsiveComponent = responsive.getResponsiveComponent({
    desktopPath: 'programmateurs/desktop/ProgrammateursList',
    mobilePath: 'programmateurs/mobile/ProgrammateursList'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ProgrammateursList;
