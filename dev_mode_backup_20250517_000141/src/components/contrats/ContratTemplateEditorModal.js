// src/components/contrats/ContratTemplateEditorModal.js
import React from 'react';
import ReactDOM from 'react-dom';
import ContratTemplateEditor from './desktop/ContratTemplateEditor';
import styles from './ContratTemplateEditorModal.module.css';

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
      className={styles.modalOverlay} 
      onClick={onClose}
    >
      <div 
        className={styles.modalContent} 
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
