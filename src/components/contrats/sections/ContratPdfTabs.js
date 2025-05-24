// src/components/contrats/sections/ContratPdfTabs.js
import React from 'react';
import styles from './ContratPdfTabs.module.css';

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
    <div className={styles.tabsContainer}>
      <ul className={styles.tabsList}>
        <li className={styles.tabItem}>
          <button
            className={`${styles.tabLink} ${activeTab === 'html' ? styles.active : ''}`}
            onClick={() => onTabSelect('html')}
          >
            <i className={`bi bi-file-earmark-code ${styles.tabIcon}`}></i>
            Aperçu HTML
            <span className={`${styles.tabBadge} ${styles.tabBadgeSuccess}`}>Recommandé</span>
          </button>
        </li>
        
        <li className={styles.tabItem}>
          <button
            className={`${styles.tabLink} ${activeTab === 'react-pdf' ? styles.active : ''}`}
            onClick={() => onTabSelect('react-pdf')}
          >
            <i className={`bi bi-file-earmark-text ${styles.tabIcon}`}></i>
            Aperçu simple
          </button>
        </li>
        
        <li className={styles.tabItem}>
          <button
            className={`${styles.tabLink} ${activeTab === 'pdf' ? styles.active : ''}`}
            onClick={() => {
              if (activeTab !== 'pdf' && !hasPdfPreview) {
                onGeneratePdf();
              }
              onTabSelect('pdf');
            }}
            disabled={isGenerating}
          >
            <i className={`bi bi-file-earmark-pdf ${styles.tabIcon}`}></i>
            {isGenerating ? (
              <>
                <span className={styles.spinner} role="status" aria-hidden="true"></span>
                Génération en cours...
              </>
            ) : (
              <>
                Aperçu PDF exact
                {hasPdfPreview && <span className={`${styles.tabBadge} ${styles.tabBadgeInfo}`}>Prêt</span>}
              </>
            )}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ContratPdfTabs;