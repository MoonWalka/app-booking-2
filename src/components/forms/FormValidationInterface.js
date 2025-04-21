// src/components/forms/FormValidationInterface.js (nouveau wrapper)
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

function FormValidationInterface(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'forms/desktop/FormValidationInterface',
    mobilePath: 'forms/mobile/FormValidationInterface'
  });
  
  // Passer tous les props au composant responsive
  return <ResponsiveComponent {...props} />;
}

export default FormValidationInterface;
