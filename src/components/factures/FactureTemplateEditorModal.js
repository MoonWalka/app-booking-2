// src/components/factures/FactureTemplateEditorModal.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import FactureParametersEditor from './FactureParametersEditor';
import styles from '../contrats/ContratTemplateEditorModal.module.css';


const FactureTemplateEditorModal = ({ 
  isOpen, 
  onClose, 
  parameters, 
  onSave 
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  

  
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Si la modale n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  // Fonction pour gérer la sauvegarde (affiche une bannière de succès)
  const handleSave = async (configData) => {
    try {
      console.log("💾 Modal: Début sauvegarde paramètres facture", {
        type: configData.type,
        parameters: configData.parameters
      });
      
      await onSave(configData);
      
      console.log("✅ Modal: Sauvegarde paramètres facture réussie");
      setShowSuccess(true);
      
      // Auto-fermer la bannière après 5 secondes
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("❌ Modal: Erreur sauvegarde paramètres facture", error);
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
              <strong>✅ Paramètres de facturation enregistrés avec succès !</strong><br />
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
        {/* Utilisation du composant FactureParametersEditor */}
        <FactureParametersEditor
          parameters={parameters}
          onSave={handleSave}
          isModalContext={true}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
};

FactureTemplateEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  parameters: PropTypes.object,
  onSave: PropTypes.func.isRequired
};

export default FactureTemplateEditorModal;