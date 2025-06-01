// src/pages/ContratDetailsPage.js
import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Spinner, Modal, Button } from 'react-bootstrap';
import ContratPDFWrapper from '@/components/pdf/ContratPDFWrapper';
import styles from './ContratDetailsPage.module.css';

// Import custom hooks
import { useContratDetails } from '@/hooks/contrats';
import useContratActions from '@/hooks/contrats/useContratActions';
import { usePdfPreview } from '@/hooks/contrats';

// Import UI components 
import ContratHeader from '@/components/contrats/sections/ContratHeader';
import ContratInfoCard from '@/components/contrats/sections/ContratInfoCard';
import ContratActions from '@/components/contrats/sections/ContratActions';
import ContratPdfTabs from '@/components/contrats/sections/ContratPdfTabs';
import ContratPdfViewer from '@/components/contrats/sections/ContratPdfViewer';
import ContratVariablesCard from '@/components/contrats/sections/ContratVariablesCard';
import DownloadModal from '@/components/common/DownloadModal';

const ContratDetailsPage = () => {
  const { contratId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
    setContrat,
    handleDelete,
    showDeleteModal,
    isDeleting,
    handleConfirmDelete,
    handleCancelDelete
  } = useContratDetails(contratId);

  // Debug logs pour voir les données récupérées
  console.log('[DEBUG ContratDetailsPage] Données récupérées:', {
    contrat,
    concert,
    template,
    programmateur,
    lieu,
    artiste,
    entreprise,
    loading,
    error
  });
  
  // Hook for handling contract actions (mark as sent, signed, delete)
  const {
    handleSendContrat,
    handleMarkAsSigned, 
    actionError,
    isActionLoading
  } = useContratActions(contratId, contrat, setContrat);

  // Hook for PDF preview functionality
  const {
    showPdfViewer,
    previewType,
    pdfPreviewUrl,
    isGeneratingPdfPreview,
    isDownloading,
    pdfViewerRef,
    setPreviewType,
    togglePdfViewer,
    generatePDFPreview,
    handleDownloadPdf
  } = usePdfPreview();

  // Gérer les paramètres de requête pour l'aperçu automatique
  useEffect(() => {
    const previewParam = searchParams.get('preview');
    
    // ✅ CORRECTION: Ajouter une protection contre les exécutions multiples
    if (previewParam && !loading && contrat && !showPdfViewer) {
      console.log(`[ContratDetailsPage] Traitement du paramètre preview=${previewParam}`);
      
      // Ouvrir automatiquement l'aperçu selon le paramètre
        togglePdfViewer();
      
      // Définir le type d'aperçu selon le paramètre
      if (previewParam === 'web') {
        console.log('[ContratDetailsPage] Activation de l\'aperçu HTML');
        setPreviewType('html');
      } else if (previewParam === 'pdf') {
        console.log('[ContratDetailsPage] Activation de l\'aperçu PDF');
        setPreviewType('pdf');
        // Générer automatiquement l'aperçu PDF
        setTimeout(() => {
          generatePDFPreview(ContratPDFWrapper, {
            contrat,
            concert,
            template,
            programmateur,
            lieu,
            artiste,
            entreprise
          });
        }, 500);
      }
      
      // Nettoyer l'URL après traitement
      navigate(`/contrats/${contratId}`, { replace: true });
    }
  }, [searchParams, loading, contrat, showPdfViewer, contratId, navigate, togglePdfViewer, setPreviewType, generatePDFPreview, concert, template, programmateur, lieu, artiste, entreprise]);

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
    // Extraire le message d'erreur de l'objet error
    const errorMessage = typeof error === 'string' 
      ? error 
      : error?.message || "Ce contrat n'existe pas ou n'a pas pu être chargé";
      
    return (
      <div className={styles.errorContainer}>
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{errorMessage}</p>
        </Alert>
        <button 
          className="tc-btn tc-btn-primary"
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
      {/* Contract Header */}
      <ContratHeader 
        contrat={contrat} 
        concert={concert}
        artiste={artiste}
        lieu={lieu}
      />

      {/* Action buttons */}
      <ContratActions 
        contrat={contrat}
        template={template}
        concert={concert}
        isLoading={isActionLoading || isDeleting}
        onPdfViewerToggle={togglePdfViewer}
        onSendContrat={handleSendContrat}
        onMarkAsSigned={handleMarkAsSigned}
        onDownloadPdf={handleDownload}
        onDeleteContrat={handleDelete}
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
        artiste={artiste}
        programmateur={programmateur}
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

      {/* Modale de confirmation de suppression (gérée par useGenericEntityDetails) */}
      {showDeleteModal && contrat && (
        <Modal show={showDeleteModal} onHide={handleCancelDelete} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirmer la suppression</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Êtes-vous sûr de vouloir supprimer le contrat pour "{contrat.nom || concert?.titre || 'ce contrat'}" ?</p>
            <p className="text-danger">Cette action est irréversible.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancelDelete} disabled={isDeleting}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  Suppression...
                </>
              ) : 'Supprimer'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal de téléchargement */}
      <DownloadModal 
        show={isDownloading}
        title="Téléchargement du contrat"
        message="Veuillez patienter pendant le téléchargement du contrat PDF..."
      />
    </div>
  );
};

export default ContratDetailsPage;
