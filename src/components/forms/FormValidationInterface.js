// src/components/forms/FormValidationInterface.js (nouveau wrapper)
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive';

function FormValidationInterface(props) {
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveComponent = getResponsiveComponent({
    desktopPath: 'forms/desktop/FormValidationInterface',
    mobilePath: 'forms/mobile/FormValidationInterface'
  });
  
  // Passer tous les props au composant responsive
  return <ResponsiveComponent {...props} />;
}

export default FormValidationInterface;
