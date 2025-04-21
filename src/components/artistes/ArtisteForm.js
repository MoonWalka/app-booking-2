// src/components/artistes/ArtisteForm.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

/**
 * Wrapper pour le formulaire d'artiste qui affiche la version mobile ou desktop
 * selon la taille de l'écran
 */
const ArtisteForm = (props) => {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'artistes/desktop/ArtisteForm',
    mobilePath: 'artistes/mobile/ArtisteForm'
  });
  
  return <ResponsiveComponent {...props} />;
};

export default ArtisteForm;