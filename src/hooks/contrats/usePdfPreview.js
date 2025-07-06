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
  const [isDownloading, setIsDownloading] = useState(false);
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
      console.error('Date manquant dans les données:', { data, concert: data.concert });
      alert('Les données du date sont manquantes.');
      return;
    }

    setIsGeneratingPdfPreview(true);
    try {
      console.log('[DEBUG] Appel de ContratPDFWrapper.generatePDFPreview avec:', data);
      // Utiliser la méthode du ContratPDFWrapper pour générer un aperçu PDF
      const url = await ContratPDFWrapper.generatePDFPreview(data, 'Apercu_Contrat');
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
    
    setIsDownloading(true);
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
        console.error('Date manquant pour le téléchargement:', { data, concert: data.concert });
        alert('Les données du date sont manquantes.');
        return;
      }

      // Générer un nom de fichier approprié
      const generateFileName = () => {
        const parts = [];
        
        // Date du date au format YYYYMMDD
        if (data.concert?.date) {
          const date = data.date.date.seconds 
            ? new Date(data.date.date.seconds * 1000) 
            : new Date(data.date.date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          parts.push(`${year}${month}${day}`);
        }
        
        // Nom de l'artiste (nettoyé)
        if (data.artiste?.nom) {
          const artisteClean = data.artiste.nom
            .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '') // Garder lettres, chiffres, accents, espaces, tirets
            .replace(/\s+/g, '_') // Remplacer espaces par underscore
            .substring(0, 30); // Limiter la longueur
          parts.push(artisteClean);
        }
        
        // Lieu (nettoyé)
        if (data.lieu?.nom) {
          const lieuClean = data.lieu.nom
            .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 20);
          parts.push(lieuClean);
        }
        
        // Type de contrat
        if (data.template?.templateType) {
          parts.push(data.template.templateType);
        }
        
        // Si on n'a aucune info, utiliser un nom par défaut
        if (parts.length === 0) {
          return 'Contrat';
        }
        
        // Joindre avec des tirets (sans l'extension .pdf car elle est ajoutée par le service)
        return `Contrat_${parts.join('-')}`;
      };
      
      const pdfTitle = generateFileName();
      console.log('[DEBUG] Nom du fichier PDF:', pdfTitle);
      
      // Appeler la méthode statique du wrapper pour générer le PDF avec Puppeteer
      console.log('[DEBUG] Appel de ContratPDFWrapper.generatePuppeteerPdf');
      await ContratPDFWrapper.generatePuppeteerPdf(pdfTitle, data);
      // Le téléchargement est géré automatiquement par le service
      
      // Attendre un petit délai pour que l'utilisateur voie que c'est terminé
      setTimeout(() => {
        setIsDownloading(false);
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert(`Erreur lors de la génération du PDF: ${error.message}`);
      setIsDownloading(false);
    }
  };

  return {
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
  };
};

export default usePdfPreview;