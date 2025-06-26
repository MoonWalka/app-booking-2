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

const ContratDetailsPage = ({ autoDownload = false }) => {
  const { contratId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Use custom hooks to handle data fetching and logic
  const{ 
    contrat, 
    concert, 
    template, 
    contact,
    programmateur, // Rétrocompatibilité
    lieu, 
    artiste, 
    entreprise,
    structure, 
    loading, 
    error,
    setContrat,
    refresh,
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
    contact,
    programmateur,
    lieu,
    artiste,
    entreprise,
    structure,
    loading,
    error
  });
  
  // Log spécifique quand toutes les données sont chargées
  if (contrat && concert && template && !loading) {
    console.log('[DEBUG ContratDetailsPage] TOUTES LES DONNÉES CHARGÉES:', {
      contact,
      lieu,
      artiste,
      structure,
      entreprise
    });
  }
  
  // Hook for handling contract actions (mark as sent, signed, delete)
  const {
    handleSendContrat,
    handleMarkAsSigned, 
    actionError,
    isActionLoading
  } = useContratActions(contratId, contrat, setContrat, concert, contact || programmateur, refresh);

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
            contact: contact || programmateur, // Priorité au contact, fallback programmateur
            programmateur: contact || programmateur, // Rétrocompatibilité
            lieu,
            artiste,
            entreprise,
            structure
          });
        }, 500);
      }
      
      // Nettoyer l'URL après traitement
      navigate(`/contrats/${contratId}`, { replace: true });
    }
  }, [searchParams, loading, contrat, showPdfViewer, contratId, navigate, togglePdfViewer, setPreviewType, generatePDFPreview, concert, template, contact, programmateur, lieu, artiste, entreprise, structure]);

  // Prepare data for PDF generation - utiliser useMemo pour s'assurer que les données sont à jour
  const pdfData = React.useMemo(() => ({
    contrat,
    concert,
    template,
    contact: contact || programmateur, // Priorité au contact, fallback programmateur
    programmateur: contact || programmateur, // Rétrocompatibilité
    lieu,
    artiste,
    entreprise,
    structure
  }), [contrat, concert, template, contact, programmateur, lieu, artiste, entreprise, structure]);

  // Handle navigation back to contracts list
  const handleNavigateBack = () => {
    navigate('/contrats');
  };

  // Generate PDF preview with available data
  const handleGeneratePreview = () => {
    generatePDFPreview(ContratPDFWrapper, pdfData);
  };

  // Handle downloading PDF with Puppeteer
  const handleDownload = React.useCallback(() => {
    // Vérifier que les données essentielles sont chargées
    if (!concert || !template) {
      alert('Les données du contrat sont encore en cours de chargement. Veuillez réessayer dans un instant.');
      return;
    }
    
    // Log pour déboguer
    console.log('[DEBUG handleDownload] pdfData au moment du téléchargement:', pdfData);
    console.log('[DEBUG handleDownload] structure disponible:', structure);
    
    handleDownloadPdf(ContratPDFWrapper, pdfData);
  }, [concert, template, pdfData, structure, handleDownloadPdf]);

  // Flag pour éviter les téléchargements multiples
  const [autoDownloadTriggered, setAutoDownloadTriggered] = React.useState(false);

  // Gérer le téléchargement automatique pour la route /download
  useEffect(() => {
    // Déclencher le téléchargement automatique si autoDownload est activé et pas encore déclenché
    if (autoDownload && !loading && contrat && concert && template && !isDownloading && !autoDownloadTriggered) {
      console.log('[ContratDetailsPage] Déclenchement du téléchargement automatique');
      
      // Marquer comme déclenché pour éviter les doublons
      setAutoDownloadTriggered(true);
      
      // Vérifier que les données essentielles sont chargées
      if (!contact && !lieu && !artiste) {
        console.warn('[ContratDetailsPage] Données incomplètes pour le téléchargement automatique');
        return;
      }
      
      // Attendre un court délai pour s'assurer que toutes les données sont chargées
      const timer = setTimeout(() => {
        console.log('[ContratDetailsPage] Lancement du téléchargement automatique');
        handleDownload();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoDownload, loading, contrat, concert, template, contact, lieu, artiste, isDownloading, autoDownloadTriggered, handleDownload]);

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
      {/* Message pour téléchargement automatique */}
      {autoDownload && (
        <div className="alert alert-info mb-4">
          <div className="d-flex align-items-center">
            <i className="bi bi-download me-2"></i>
            <div>
              <strong>Téléchargement en cours...</strong>
              <div className="mt-1">
                Le téléchargement du contrat PDF va commencer automatiquement. 
                Si rien ne se passe, vous pouvez utiliser le bouton "Télécharger PDF" ci-dessous.
              </div>
            </div>
          </div>
        </div>
      )}

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
        // Désactiver le téléchargement si les données ne sont pas prêtes
        isDownloadDisabled={!contact && !lieu && !artiste}
        onViewFacture={(factureId) => navigate(`/factures/${factureId}`)}
        onGenerateFacture={(concertId) => navigate(`/factures/generate/${concertId}?fromContrat=true`)}
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
        contact={contact || programmateur}
        programmateur={contact || programmateur} // Rétrocompatibilité
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
