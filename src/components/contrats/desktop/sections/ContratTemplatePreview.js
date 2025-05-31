import React, { useState } from 'react';
import styles from './ContratTemplatePreview.module.css';
import { replaceVariablesWithMockData } from '@/hooks/contrats/contractVariables';

/**
 * Composant d'aperçu du modèle de contrat
 */
const ContratTemplatePreview = ({ selectedTemplate }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!selectedTemplate) {
    return null;
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className={styles.templatePreview}>
      <div 
        className={styles.previewHeader}
        onClick={toggleCollapse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleCollapse();
          }
        }}
        title={isCollapsed ? "Cliquer pour afficher l'aperçu du modèle" : "Cliquer pour masquer l'aperçu du modèle"}
      >
        <h6 className={styles.previewTitle}>Aperçu du modèle</h6>
        <div className={styles.collapseButton}>
          <i className={`bi ${isCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'}`}></i>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className={styles.previewContent}>
          <div className={styles.templateSectionPreview}>
            <div className={styles.sectionLabel}>En-tête :</div>
            {selectedTemplate.headerContent ? (
              <div dangerouslySetInnerHTML={{ __html: replaceVariablesWithMockData(selectedTemplate.headerContent) }} />
            ) : (
              <span className="text-muted">(Aucun en-tête)</span>
            )}
          </div>
          <div className={styles.templateSectionPreview}>
            <div className={styles.sectionLabel}>Corps :</div>
            {selectedTemplate.bodyContent ? (
              <div dangerouslySetInnerHTML={{ __html: replaceVariablesWithMockData(selectedTemplate.bodyContent) }} />
            ) : (
              <span className="text-danger">(Aucun contenu principal)</span>
            )}
          </div>
          <div className={styles.templateSectionPreview}>
            <div className={styles.sectionLabel}>Pied de page :</div>
            {selectedTemplate.footerContent ? (
              <div dangerouslySetInnerHTML={{ __html: replaceVariablesWithMockData(selectedTemplate.footerContent) }} />
            ) : (
              <span className="text-muted">(Aucun pied de page)</span>
            )}
          </div>
          <div className={styles.templateSectionPreview}>
            <div className={styles.sectionLabel}>Signature :</div>
            {selectedTemplate.signatureTemplate ? (
              <div dangerouslySetInnerHTML={{ __html: replaceVariablesWithMockData(selectedTemplate.signatureTemplate) }} />
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