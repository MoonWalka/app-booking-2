import React from 'react';
import styles from './ContratTemplatePreview.module.css';

/**
 * Composant d'aperçu du modèle de contrat
 */
const ContratTemplatePreview = ({ previewHtml }) => {
  return (
    <div className={styles.templatePreview}>
      <div className={styles.previewHeader}>
        <h3>Aperçu du contrat</h3>
        <small className="text-muted">Avec des données fictives d'exemple</small>
      </div>
      <div className={styles.previewContent}>
        <div className={styles.multiPagePreviewWrapper}>
          <iframe
            srcDoc={previewHtml}
            title="Aperçu du contrat"
            className={styles.htmlPreviewFrame}
            scrolling="yes"
          />
        </div>
      </div>
    </div>
  );
};

export default ContratTemplatePreview;