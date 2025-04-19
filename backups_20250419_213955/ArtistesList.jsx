// src/components/artistes/ArtistesList.jsx
import React from 'react';
import { useResponsiveComponent } from '../../hooks/useResponsiveComponent';

function ArtistesList(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'artistes/desktop/ArtistesList',
    mobilePath: 'artistes/mobile/ArtistesList'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ArtistesList;
