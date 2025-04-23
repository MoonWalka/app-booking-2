// src/components/contrats/ContratTemplateEditor.js
import React from 'react';
// Imports supplémentaires de la branche refacto-structure-scriptshell pour implémentation future
 import { useState, useEffect, useRef } from 'react';
 import ReactQuill from 'react-quill';
 import 'react-quill/dist/quill.snow.css';
 import '@styles/index.css';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

function ContratTemplateEditor(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'contrats/desktop/ContratTemplateEditor',
    mobilePath: 'contrats/mobile/ContratTemplateEditor'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ContratTemplateEditor;
