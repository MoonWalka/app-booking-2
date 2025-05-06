// src/components/concerts/ConcertsList.js
import React from 'react';
import { useResponsive } from '@/hooks/common';
;

function ConcertsList(props) {
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveComponent = getResponsiveComponent({
    desktopPath: 'concerts/desktop/ConcertsList',
    mobilePath: 'concerts/mobile/ConcertsList'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ConcertsList;
