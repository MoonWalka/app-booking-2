// src/components/contrats/ContratTemplateEditor.js
import React from 'react';
import { useResponsive } from '@/hooks/common';
import DesktopContratTemplateEditor from './desktop/ContratTemplateEditor';

/**
 * Wrapper responsive pour l'éditeur de modèles de contrats
 * Note: Pour le moment, seule la version desktop est implémentée
 */
function ContratTemplateEditor(props) {
  console.log("ContratTemplateEditor rendu avec props:", props);
  const { isModal, ...otherProps } = props;
  const { isMobile } = useResponsive();
  
  // Adapter l'interface selon le type d'appareil (NOUVEAU)
  const getResponsiveConfig = () => {
    if (isMobile) {
      return {
        isModalContext: true, // Forcer le mode modal sur mobile pour une meilleure UX
        compactMode: true,
        showFullscreen: true
      };
    }
    return {
      isModalContext: isModal === true,
      compactMode: false,
      showFullscreen: false
    };
  };

  const responsiveConfig = getResponsiveConfig();
  
  // Pour l'instant, utiliser la version desktop dans tous les cas
  // avec des propriétés adaptées au type d'appareil
  return (
    <DesktopContratTemplateEditor 
      {...otherProps} 
      {...responsiveConfig}
      isMobileDevice={isMobile}
    />
  );
}

export default ContratTemplateEditor;
