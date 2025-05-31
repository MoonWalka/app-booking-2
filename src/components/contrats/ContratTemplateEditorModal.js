// src/components/contrats/ContratTemplateEditorModal.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import ContratTemplateEditor from './ContratTemplateEditor';
import styles from './ContratTemplateEditorModal.module.css';


const ContratTemplateEditorModal = ({ 
  isOpen, 
  onClose, 
  template, 
  onSave 
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  

  
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
    }
  }, [isOpen]);
  console.log('ContratTemplateEditorModal', { isOpen, template });

  // Si la modale n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  // Fonction pour gérer la sauvegarde (affiche une bannière de succès)
  const handleSave = async (modelData) => {
    try {
      console.log("💾 Modal: Début sauvegarde", {
        templateId: template?.id,
        modelName: modelData.name,
        bodyContentLength: modelData.bodyContent?.length
      });
      
      await onSave(modelData);
      
      console.log("✅ Modal: Sauvegarde réussie");
      setShowSuccess(true);
      
      // Auto-fermer la bannière après 5 secondes
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("❌ Modal: Erreur sauvegarde", error);
      // Le composant enfant gère déjà l'alerte d'erreur
    }
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
          <div className={styles.successBanner}>
            <span>
              <strong>✅ Modèle enregistré avec succès !</strong><br />
              Vous pouvez maintenant fermer la fenêtre en cliquant sur la croix en haut à droite.
            </span>
            <button
              className={styles.closeBannerButton}
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

ContratTemplateEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  template: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    templateType: PropTypes.string,
    bodyContent: PropTypes.string,
    isDefault: PropTypes.bool
  }),
  onSave: PropTypes.func.isRequired
};

export default ContratTemplateEditorModal;
