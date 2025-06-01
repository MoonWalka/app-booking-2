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
          <div className={`${styles.templateSectionPreview} tc-quill-editor-wrapper`}>
            <div className={styles.sectionLabel}>Contenu du modèle :</div>
            {selectedTemplate.bodyContent ? (
              <div 
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: replaceVariablesWithMockData(selectedTemplate.bodyContent) }} 
              />
            ) : (
              <span className="text-danger">(Aucun contenu dans ce modèle)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratTemplatePreview;