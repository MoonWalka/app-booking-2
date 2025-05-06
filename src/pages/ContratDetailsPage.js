// src/pages/ContratDetailsPage.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import ContratPDFWrapper from '@/components/contrats/ContratPDFWrapper';
import styles from './ContratDetailsPage.module.css';

// Import custom hooks
import { useContratDetailsV2 } from '@/hooks/contrats';
import useContratActions from '@/hooks/contrats/useContratActions';
import usePdfPreview from '@/hooks/contrats/usePdfPreview';

// Import UI components 
import ContratHeader from '@/components/contrats/sections/ContratHeader';
import ContratInfoCard from '@/components/contrats/sections/ContratInfoCard';
import ContratActions from '@/components/contrats/sections/ContratActions';
import ContratPdfTabs from '@/components/contrats/sections/ContratPdfTabs';
import ContratPdfViewer from '@/components/contrats/sections/ContratPdfViewer';
import ContratVariablesCard from '@/components/contrats/sections/ContratVariablesCard';

const ContratDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use custom hooks to handle data fetching and logic
  const{ 
    contrat, 
    concert, 
    template, 
    programmateur, 
    lieu, 
    artiste, 
    entreprise, 
    loading, 
    error,
    setContrat
  } = useContratDetailsV2(id);
  
  // Hook for handling contract actions (mark as sent, signed, delete)
  const {
    handleSendContrat,
    handleMarkAsSigned, 
    handleDeleteContrat,
    actionError,
    isActionLoading
  } = useContratActions(id, contrat, setContrat);

  // Hook for PDF preview functionality
  const {
    showPdfViewer,
    previewType,
    pdfPreviewUrl,
    isGeneratingPdfPreview,
    pdfViewerRef,
    setPreviewType,
    togglePdfViewer,
    generatePDFPreview,
    handleDownloadPdf
  } = usePdfPreview();

  // Prepare data for PDF generation
  const pdfData = {
    contrat,
    concert,
    template,
    programmateur,
    lieu,
    artiste,
    entreprise
  };

  // Handle navigation back to contracts list
  const handleNavigateBack = () => {
    navigate('/contrats');
  };

  // Generate PDF preview with available data
  const handleGeneratePreview = () => {
    generatePDFPreview(ContratPDFWrapper, pdfData);
  };

  // Handle downloading PDF with Puppeteer
  const handleDownload = () => {
    handleDownloadPdf(ContratPDFWrapper, pdfData);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement du contrat...</p>
      </div>
    );
  }

  // Error state
  if (error || !contrat) {
    return (
      <div className={styles.errorContainer}>
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error || "Ce contrat n'existe pas ou n'a pas pu être chargé"}</p>
        </Alert>
        <button 
          className="btn btn-primary"
          onClick={handleNavigateBack}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste des contrats
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="row">
        <div className="col-12">
          {/* Contract Header */}
          <ContratHeader contrat={contrat} />

          {/* Action buttons */}
          <ContratActions 
            contrat={contrat}
            template={template}
            concert={concert}
            isLoading={isActionLoading}
            onPdfViewerToggle={togglePdfViewer}
            onSendContrat={handleSendContrat}
            onMarkAsSigned={handleMarkAsSigned}
            onDownloadPdf={handleDownload}
            onDeleteContrat={handleDeleteContrat}
            onNavigateBack={handleNavigateBack}
          />

          {/* Display action errors if any */}
          {actionError && (
            <Alert variant="danger" className="mb-4">
              {actionError}
            </Alert>
          )}

          {/* Contract information card */}
          <ContratInfoCard 
            contrat={contrat}
            concert={concert}
            template={template}
            lieu={lieu}
          />

          {/* Variables card - collapsible */}
          <ContratVariablesCard contrat={contrat} />

          {/* PDF viewer section */}
          {showPdfViewer && (
            <>
              {/* Tab navigation for different preview types */}
              <ContratPdfTabs 
                activeTab={previewType}
                onTabSelect={setPreviewType}
                isGenerating={isGeneratingPdfPreview}
                hasPdfPreview={!!pdfPreviewUrl}
                onGeneratePdf={handleGeneratePreview}
              />

              {/* PDF content viewer */}
              <ContratPdfViewer 
                previewType={previewType}
                forwardedRef={pdfViewerRef}
                pdfData={pdfData}
                ContratPDFWrapper={ContratPDFWrapper}
                isGeneratingPdfPreview={isGeneratingPdfPreview}
                pdfPreviewUrl={pdfPreviewUrl}
                onGeneratePreview={handleGeneratePreview}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContratDetailsPage;
