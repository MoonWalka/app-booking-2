// src/components/contrats/sections/ContratPdfTabs.js
import React from 'react';
import { Nav } from 'react-bootstrap';
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
    <Nav 
      variant="tabs" 
      className="mb-3"
      activeKey={activeTab}
      onSelect={onTabSelect}
    >
      <Nav.Item>
        <Nav.Link eventKey="html" className="d-flex align-items-center">
          <i className="bi bi-file-earmark-code me-2"></i>
          Aperçu HTML
          <span className="badge bg-success ms-2" style={{ fontSize: '0.7em' }}>Recommandé</span>
        </Nav.Link>
      </Nav.Item>
      
      <Nav.Item>
        <Nav.Link eventKey="react-pdf" className="d-flex align-items-center">
          <i className="bi bi-file-earmark-text me-2"></i>
          Aperçu simple
        </Nav.Link>
      </Nav.Item>
      
      <Nav.Item>
        <Nav.Link 
          eventKey="pdf" 
          className="d-flex align-items-center"
          onClick={() => {
            if (activeTab !== 'pdf' && !hasPdfPreview) {
              onGeneratePdf();
            }
          }}
          disabled={isGenerating}
        >
          <i className="bi bi-file-earmark-pdf me-2"></i>
          {isGenerating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Génération en cours...
            </>
          ) : (
            <>
              Aperçu PDF exact
              {hasPdfPreview && <span className="badge bg-info ms-2" style={{ fontSize: '0.7em' }}>Prêt</span>}
            </>
          )}
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default ContratPdfTabs;