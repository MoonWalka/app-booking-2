import React from 'react';
import styles from './ContratTemplatePreview.module.css';

/**
 * Composant d'aperçu du modèle de contrat
 */
const ContratTemplatePreview = ({ selectedTemplate }) => {
  if (!selectedTemplate) {
    return null;
  }
  
  return (
    <div className={styles.templatePreview}>
      <h6>Aperçu du modèle</h6>
      {selectedTemplate.bodyContent ? (
        <div className={styles.templateBodyPreview}>
          <p className="text-muted small">Ce modèle utilise le format avec en-tête, corps et pied de page.</p>
        </div>
      ) : (
        <p className="text-danger">Attention: Ce modèle ne contient pas de contenu principal.</p>
      )}
    </div>
  );
};

export default ContratTemplatePreview;