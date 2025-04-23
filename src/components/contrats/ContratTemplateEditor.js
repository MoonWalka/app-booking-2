// src/components/contrats/ContratTemplateEditor.js
import React, { useEffect, useState } from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';
import DesktopContratTemplateEditor from './desktop/ContratTemplateEditor';

function ContratTemplateEditor(props) {
  console.log("ContratTemplateEditor rendu avec props:", props);
  const { isModal, ...otherProps } = props;
  
  // Toujours appeler useResponsiveComponent, car les Hooks doivent être appelés à chaque render
  // et dans le même ordre - c'est une règle fondamentale de React
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'contrats/desktop/ContratTemplateEditor',
    mobilePath: 'contrats/mobile/ContratTemplateEditor'
  });
  
  // Utiliser le résultat du hook pour le rendu non-modal
  // Pour le mode modal, utiliser directement le composant desktop 
  // ou le composant responsif selon la plateforme
  if (isModal) {
    console.log("Mode modal détecté");
    
    // Utiliser le composant responsif même en mode modal
    return <ResponsiveComponent {...otherProps} isModalContext={true} />;
  }
  
  console.log("Mode normal (non-modal)");
  return <ResponsiveComponent {...otherProps} />;
}

export default ContratTemplateEditor;
