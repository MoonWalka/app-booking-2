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
    console.log('[DEBUG] generatePDFPreview appelé avec les données:', data);
    
    if (!data) {
      console.error('Aucune donnée fournie à generatePDFPreview');
      alert('Aucune donnée fournie pour générer l\'aperçu PDF');
      return;
    }
    
    if (!data.template) {
      console.error('Template manquant dans les données:', { data, template: data.template });
      alert('Le template du contrat est manquant. Veuillez vérifier que le contrat a bien un modèle associé.');
      return;
    }
    
    if (!data.concert) {
      console.error('Concert manquant dans les données:', { data, concert: data.concert });
      alert('Les données du concert sont manquantes.');
      return;
    }

    setIsGeneratingPdfPreview(true);
    try {
      console.log('[DEBUG] Appel de ContratPDFWrapper.generatePDFPreview avec:', data);
      // Utiliser la méthode du ContratPDFWrapper pour générer un aperçu PDF
      const url = await ContratPDFWrapper.generatePDFPreview(data, "");
      console.log('[DEBUG] URL générée:', url);
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
    console.log('[DEBUG] handleDownloadPdf appelé avec les données:', data);
    
    try {
      if (!data) {
        console.error('Aucune donnée fournie à handleDownloadPdf');
        alert('Aucune donnée fournie pour générer le PDF');
        return;
      }
      
      if (!data.template) {
        console.error('Template manquant pour le téléchargement:', { data, template: data.template });
        alert('Le template du contrat est manquant. Veuillez vérifier que le contrat a bien un modèle associé.');
        return;
      }
      
      if (!data.concert) {
        console.error('Concert manquant pour le téléchargement:', { data, concert: data.concert });
        alert('Les données du concert sont manquantes.');
        return;
      }

      // Générer un titre pour le PDF
      const pdfTitle = `Contrat_${data.concert?.titre || 'Concert'}_${new Date().toISOString().slice(0, 10)}`;
      console.log('[DEBUG] Titre du PDF:', pdfTitle);
      
      // Appeler la méthode statique du wrapper pour générer le PDF avec Puppeteer
      console.log('[DEBUG] Appel de ContratPDFWrapper.generatePuppeteerPdf');
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