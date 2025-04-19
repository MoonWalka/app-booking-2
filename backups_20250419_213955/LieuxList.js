// src/components/lieux/LieuxList.js
import React from 'react';
import { useResponsiveComponent } from '../../hooks/useResponsiveComponent';

function LieuxList(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'lieux/desktop/LieuxList',
    mobilePath: 'lieux/mobile/LieuxList'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default LieuxList;
