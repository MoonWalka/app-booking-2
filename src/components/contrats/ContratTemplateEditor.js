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
  
  // Pour l'instant, utiliser la version desktop dans tous les cas
  // avec une propriété pour indiquer si on est en mode modal
  return (
    <DesktopContratTemplateEditor 
      {...otherProps} 
      isModalContext={isModal === true}
    />
  );
}

export default ContratTemplateEditor;
