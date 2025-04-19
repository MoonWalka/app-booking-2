// src/components/contrats/ContratGenerator.js
import React from 'react';
import { useResponsiveComponent } from '@hooks/useResponsiveComponent';

function ContratGenerator(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'contrats/desktop/ContratGenerator',
    mobilePath: 'contrats/mobile/ContratGenerator'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ContratGenerator;
