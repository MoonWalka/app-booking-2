// src/components/contrats/sections/ContratPdfTabs.js
import React from 'react';
import styles from '@/pages/ContratDetailsPage.module.css';

/**
 * Component for PDF preview tab navigation
 */
const ContratPdfTabs = ({
  activeTab,
  onTabSelect,
  isGenerating,
  hasPdfPreview,
  onGeneratePdf
}) => {
  return (
    <div className={styles.pdfTabs}>
      <button
        className={`${styles.pdfTab} ${activeTab === 'html' ? styles.active : ''}`}
        onClick={() => onTabSelect('html')}
        type="button"
      >
        <i className="bi bi-globe"></i>
        Aperçu HTML
      </button>
      
      <button
        className={`${styles.pdfTab} ${activeTab === 'pdf' ? styles.active : ''}`}
        onClick={() => {
          if (activeTab !== 'pdf' && !hasPdfPreview) {
            onGeneratePdf();
          }
          onTabSelect('pdf');
        }}
        disabled={isGenerating}
        type="button"
      >
        <i className="bi bi-file-earmark-pdf"></i>
        {isGenerating ? 'Génération en cours...' : 'Aperçu PDF'}
      </button>
    </div>
  );
};

export default ContratPdfTabs;