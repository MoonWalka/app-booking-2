// src/components/forms/ProgrammateurForm.js
import React from 'react';
import { useResponsive } from '@/hooks/common';
import { useParams } from 'react-router-dom'; // Utilisation du hook recommandé

console.log('[TRACE-UNIQUE][ProgrammateurForm] Composant exécuté !');

function ProgrammateurForm(props) {
  const params = useParams();
  console.log('[TRACE-UNIQUE][ProgrammateurForm] wrapper mount, useParams:', params);
  const responsive = useResponsive();
  
  const ResponsiveComponent = responsive.getResponsiveComponent({
    desktopPath: 'programmateurs/desktop/ProgrammateurForm',
    mobilePath: 'programmateurs/mobile/ProgrammateurForm'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ProgrammateurForm;
