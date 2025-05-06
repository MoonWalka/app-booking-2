// src/components/artistes/ArtistesList.js
import React from 'react';
import { useResponsive } from '@/hooks/common';
;

function ArtistesList(props) {
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveComponent = getResponsiveComponent({
    desktopPath: 'artistes/desktop/ArtistesList',
    mobilePath: 'artistes/mobile/ArtistesList'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ArtistesList;