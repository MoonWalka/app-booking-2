// src/components/concerts/ConcertsList.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

function ConcertsList(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'concerts/desktop/ConcertsList',
    mobilePath: 'concerts/mobile/ConcertsList'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ConcertsList;
