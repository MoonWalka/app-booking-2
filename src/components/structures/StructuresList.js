// src/components/structures/StructuresList.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

function StructuresList(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'structures/desktop/StructuresList',
    mobilePath: 'structures/mobile/StructuresList'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default StructuresList;