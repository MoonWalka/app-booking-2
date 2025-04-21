// src/components/artistes/ArtisteDetail.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

/**
 * Wrapper pour la page de détail d'un artiste qui affiche la version mobile ou desktop
 * selon la taille de l'écran
 */
const ArtisteDetail = (props) => {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'artistes/desktop/ArtisteDetail',
    mobilePath: 'artistes/mobile/ArtisteDetail'
  });
  
  return <ResponsiveComponent {...props} />;
};

export default ArtisteDetail;