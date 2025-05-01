// src/hooks/contrats/usePdfPreview.js
import { useState, useRef } from 'react';

/**
 * Hook to manage contract PDF preview functionality
 */
export const usePdfPreview = () => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [previewType, setPreviewType] = useState('html'); // 'html', 'react-pdf' ou 'pdf'
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isGeneratingPdfPreview, setIsGeneratingPdfPreview] = useState(false);
  const pdfViewerRef = useRef(null);

  // Toggle the PDF viewer and scroll to it when opened
  const togglePdfViewer = () => {
    setShowPdfViewer(!showPdfViewer);
    
    if (!showPdfViewer && pdfViewerRef.current) {
      pdfViewerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate PDF preview via Puppeteer
  const generatePDFPreview = async (ContratPDFWrapper, data) => {
    if (!data.template || !data.concertData) {
      alert('Données insuffisantes pour générer l\'aperçu PDF');
      return;
    }

    setIsGeneratingPdfPreview(true);
    try {
      // Utiliser la méthode du ContratPDFWrapper pour générer un aperçu PDF
      const url = await ContratPDFWrapper.generatePDFPreview(data, "");
      setPdfPreviewUrl(url);
      setPreviewType('pdf');
    } catch (error) {
      console.error('Erreur lors de la génération de l\'aperçu PDF:', error);
      alert(`Erreur lors de la génération de l'aperçu PDF: ${error.message}`);
    } finally {
      setIsGeneratingPdfPreview(false);
    }
  };

  // Download PDF with Puppeteer
  const handleDownloadPdf = async (ContratPDFWrapper, data) => {
    try {
      if (!data.template || !data.concertData) {
        alert('Données insuffisantes pour générer le PDF');
        return;
      }

      // Générer un titre pour le PDF
      const pdfTitle = `Contrat_${data.concertData.titre || 'Concert'}_${new Date().toISOString().slice(0, 10)}`;
      
      // Appeler la méthode statique du wrapper pour générer le PDF avec Puppeteer
      await ContratPDFWrapper.generatePuppeteerPdf(pdfTitle, data);
      // Le téléchargement est géré automatiquement par le service
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert(`Erreur lors de la génération du PDF: ${error.message}`);
    }
  };

  return {
    showPdfViewer,
    previewType,
    pdfPreviewUrl,
    isGeneratingPdfPreview,
    pdfViewerRef,
    setPreviewType,
    togglePdfViewer,
    generatePDFPreview,
    handleDownloadPdf
  };
};

export default usePdfPreview;