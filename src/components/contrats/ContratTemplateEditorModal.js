// src/components/contrats/ContratTemplateEditorModal.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ContratTemplateEditor from './desktop/ContratTemplateEditor';
import styles from './ContratTemplateEditorModal.module.css';

const ContratTemplateEditorModal = ({ 
  isOpen, 
  onClose, 
  template, 
  onSave 
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (isOpen) setShowSuccess(false);
  }, [isOpen]);
  console.log('ContratTemplateEditorModal', { isOpen, template });

  // Si la modale n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  // Fonction pour gérer la sauvegarde (affiche une bannière de succès)
  const handleSave = (modelData) => {
    onSave(modelData);
    setShowSuccess(true);
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
        {/* Bannière de succès custom */}
        {showSuccess && (
          <div style={{
            background: '#d1e7dd',
            color: '#0f5132',
            border: '1px solid #badbcc',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <span>
              <strong>✅ Modèle enregistré avec succès !</strong><br />
              Vous pouvez maintenant fermer la fenêtre en cliquant sur la croix en haut à droite.
            </span>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0f5132',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                marginLeft: '16px',
              }}
              onClick={() => setShowSuccess(false)}
              aria-label="Fermer l'alerte"
            >
              ✕
            </button>
          </div>
        )}
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
