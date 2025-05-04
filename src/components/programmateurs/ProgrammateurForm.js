// src/components/forms/ProgrammateurForm.js
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive'; // Utilisation du hook recommandé

function ProgrammateurForm(props) {
  const responsive = useResponsive();
  
  const ResponsiveComponent = responsive.getResponsiveComponent({
    desktopPath: 'programmateurs/desktop/ProgrammateurForm',
    mobilePath: 'programmateurs/mobile/ProgrammateurForm'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ProgrammateurForm;
