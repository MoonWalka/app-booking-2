import { pdf } from '@react-pdf/renderer';
import ContratPDFWrapper from '@/components/pdf/ContratPDFWrapper';

/**
 * Génère un PDF à partir des données du contrat
 * @param {Object} contratData - Les données complètes du contrat
 * @returns {Promise<Blob>} Le blob du PDF généré
 */
export const generateContractPdf = async (contratData) => {
  try {
    console.log('[generateContractPdf] Génération du PDF avec les données:', contratData);
    
    // Préparer les données pour ContratPDFWrapper
    const pdfData = {
      template: contratData.templateSnapshot || contratData.template,
      contrat: contratData,
      date: contratData.date || contratData.dateData || {},
      contact: contratData.contact || contratData.contactData || {},
      artiste: contratData.artiste || contratData.artisteData || {},
      lieu: contratData.lieu || contratData.lieuData || {},
      structure: contratData.structure || contratData.structureData || {},
      entreprise: contratData.entreprise || contratData.entrepriseInfo || {},
      contratData: contratData
    };

    // Générer le composant PDF
    const document = <ContratPDFWrapper {...pdfData} />;
    
    // Convertir en blob
    const pdfInstance = pdf(document);
    const blob = await pdfInstance.toBlob();
    
    console.log('[generateContractPdf] PDF généré avec succès, taille:', blob.size);
    return blob;
    
  } catch (error) {
    console.error('[generateContractPdf] Erreur lors de la génération du PDF:', error);
    throw error;
  }
};

/**
 * Génère un PDF en utilisant la méthode HTML (alternative)
 * @param {Object} contratData - Les données complètes du contrat
 * @returns {Promise<Blob>} Le blob du PDF généré
 */
export const generateContractPdfFromHtml = async (contratData) => {
  try {
    console.log('[generateContractPdfFromHtml] Génération du PDF via HTML avec les données:', contratData);
    
    // Obtenir le HTML du contrat
    const htmlContent = ContratPDFWrapper.getContratHTML(contratData, contratData.contratNumber || 'Contrat');
    
    // Créer un blob à partir du HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Note: Dans un environnement de production, vous devriez utiliser un service
    // de conversion HTML vers PDF comme Puppeteer, wkhtmltopdf, ou un service cloud
    console.log('[generateContractPdfFromHtml] HTML généré, conversion en PDF nécessaire via un service externe');
    
    return blob;
    
  } catch (error) {
    console.error('[generateContractPdfFromHtml] Erreur lors de la génération du PDF:', error);
    throw error;
  }
};