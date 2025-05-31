// src/components/contrats/ContratTemplateEditor.js
import React from 'react';
import PropTypes from 'prop-types';
import ContratTemplateEditorSimple from './ContratTemplateEditorSimple';

/**
 * Éditeur de modèles de contrats simplifié
 * Interface épurée avec seulement le nom, type et éditeur de contenu
 */
function ContratTemplateEditor(props) {
  console.log("ContratTemplateEditor rendu avec props:", props);
  
  // Utiliser directement la version simplifiée
  return <ContratTemplateEditorSimple {...props} />;
}

ContratTemplateEditor.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    templateType: PropTypes.string,
    bodyContent: PropTypes.string,
    isDefault: PropTypes.bool
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isModalContext: PropTypes.bool
};

export default ContratTemplateEditor;
