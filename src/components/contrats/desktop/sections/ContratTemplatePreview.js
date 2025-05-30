import React, { useState } from 'react';
import styles from './ContratTemplatePreview.module.css';

/**
 * Composant d'aperçu du modèle de contrat
 */
const ContratTemplatePreview = ({ selectedTemplate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!selectedTemplate) {
    return null;
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className={styles.templatePreview}>
      <div className={styles.previewHeader}>
        <h6 className={styles.previewTitle}>Aperçu du modèle</h6>
        <button
          type="button"
          className={styles.collapseButton}
          onClick={toggleCollapse}
          title={isCollapsed ? "Étendre l'aperçu" : "Réduire l'aperçu"}
        >
          <i className={`bi ${isCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'}`}></i>
        </button>
      </div>
      
      {!isCollapsed && (
        <div className={styles.previewContent}>
          <div className={styles.templateSectionPreview}>
            <div className={styles.sectionLabel}>En-tête :</div>
            {selectedTemplate.headerContent ? (
              <div dangerouslySetInnerHTML={{ __html: selectedTemplate.headerContent }} />
            ) : (
              <span className="text-muted">(Aucun en-tête)</span>
            )}
          </div>
          <div className={styles.templateSectionPreview}>
            <div className={styles.sectionLabel}>Corps :</div>
            {selectedTemplate.bodyContent ? (
              <div dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyContent }} />
            ) : (
              <span className="text-danger">(Aucun contenu principal)</span>
            )}
          </div>
          <div className={styles.templateSectionPreview}>
            <div className={styles.sectionLabel}>Pied de page :</div>
            {selectedTemplate.footerContent ? (
              <div dangerouslySetInnerHTML={{ __html: selectedTemplate.footerContent }} />
            ) : (
              <span className="text-muted">(Aucun pied de page)</span>
            )}
          </div>
          <div className={styles.templateSectionPreview}>
            <div className={styles.sectionLabel}>Signature :</div>
            {selectedTemplate.signatureTemplate ? (
              <div dangerouslySetInnerHTML={{ __html: selectedTemplate.signatureTemplate }} />
            ) : (
              <span className="text-muted">(Aucune section signature)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratTemplatePreview;