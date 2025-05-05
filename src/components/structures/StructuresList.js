// src/components/structures/StructuresList.js
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive';

function StructuresList(props) {
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveComponent = getResponsiveComponent({
    desktopPath: 'structures/desktop/StructuresList',
    mobilePath: 'structures/mobile/StructuresList'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default StructuresList;