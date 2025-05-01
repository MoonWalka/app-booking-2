// src/components/artistes/ArtistesList.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

/**
 * Wrapper for the artist list page that displays either the mobile or desktop version 
 * depending on screen size
 */
const ArtistesList = (props) => {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'artistes/desktop/ArtistesList',
    mobilePath: 'artistes/mobile/ArtistesList'
  });
  
  return <ResponsiveComponent {...props} />;
};

export default ArtistesList;