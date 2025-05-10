// src/components/forms/ProgrammateurForm.js
import React from 'react';
import { useResponsive } from '@/hooks/common';
; // Utilisation du hook recommandé

console.log('[TRACE-UNIQUE][ProgrammateurForm] Composant exécuté !');

function ProgrammateurForm(props) {
  const responsive = useResponsive();
  
  const ResponsiveComponent = responsive.getResponsiveComponent({
    desktopPath: 'programmateurs/desktop/ProgrammateurForm',
    mobilePath: 'programmateurs/mobile/ProgrammateurForm'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ProgrammateurForm;
