// src/components/artistes/ArtistesList.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

/**
 * Wrapper pour la liste des artistes qui affiche la version mobile ou desktop
 * selon la taille de l'écran
 */
const ArtistesList = (props) => {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'artistes/desktop/ArtistesList',
    mobilePath: 'artistes/mobile/ArtistesList'
  });
  
  return <ResponsiveComponent {...props} />;
};

export default ArtistesList;