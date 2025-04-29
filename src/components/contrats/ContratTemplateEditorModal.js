// src/components/contrats/ContratTemplateEditorModal.js
import React from 'react';
import ReactDOM from 'react-dom';
import ContratTemplateEditor from './desktop/ContratTemplateEditor';

const ContratTemplateEditorModal = ({ 
  isOpen, 
  onClose, 
  template, 
  onSave 
}) => {
  console.log("============ MODALE CONTRAT TEMPLATE EDITOR CHARGÉE ============");

  // Si la modale n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  // Fonction pour gérer la sauvegarde et fermer la modale
  const handleSave = (modelData) => {
    onSave(modelData);
    onClose();
  };

  // Utiliser createPortal pour rendre la modale directement dans le body
  return ReactDOM.createPortal(
    <div 
      className="tc-modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050
      }}
      onClick={onClose}
    >
      <div 
        className="tc-modal-content template-editor-modal" 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Utilisation du composant ContratTemplateEditor réutilisable */}
        <ContratTemplateEditor
          template={template}
          onSave={handleSave}
          isModalContext={true}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
};

export default ContratTemplateEditorModal;
