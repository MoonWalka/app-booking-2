import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive';

/**
 * Wrapper pour le formulaire d'artiste qui affiche la version mobile ou desktop
 * selon la taille de l'écran
 */
function ArtisteForm(props) {
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveComponent = getResponsiveComponent({
    desktopPath: 'artistes/desktop/ArtisteForm',
    mobilePath: 'artistes/mobile/ArtisteForm'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ArtisteForm;
