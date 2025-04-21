// src/components/programmateurs/ProgrammateurDetails.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

function ProgrammateurDetails(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'programmateurs/desktop/ProgrammateurDetails',
    mobilePath: 'programmateurs/mobile/ProgrammateurDetails'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ProgrammateurDetails;
