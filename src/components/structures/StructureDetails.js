// src/components/structures/StructureDetails.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

function StructureDetails(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'structures/desktop/StructureDetails',
    mobilePath: 'structures/mobile/StructureDetails'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default StructureDetails;