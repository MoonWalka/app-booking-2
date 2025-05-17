// src/components/structures/StructureDetails.js
import React from 'react';
import { useResponsive } from '@/hooks/common';
;

function StructureDetails(props) {
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveComponent = getResponsiveComponent({
    desktopPath: 'structures/desktop/StructureDetails',
    mobilePath: 'structures/mobile/StructureDetails'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default StructureDetails;