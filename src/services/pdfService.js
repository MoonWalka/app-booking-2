// src/services/pdfService.js
import axios from 'axios';

/**
 * Service pour la génération de PDF à l'aide de Puppeteer via Cloud Functions
 */
const pdfService = {
  /**
   * Génère un PDF à partir de contenu HTML
   * @param {string} htmlContent - Le contenu HTML du document
   * @param {string} title - Le titre du document
   * @param {object} options - Options supplémentaires pour la génération du PDF
   * @returns {Promise<Blob>} - Une promesse contenant le blob PDF
   */
  generatePdf: async (htmlContent, title, options = {}) => {
    try {
      // URL de la fonction Cloud Firebase
      const functionUrl = process.env.REACT_APP_FIREBASE_REGION 
        ? `https://${process.env.REACT_APP_FIREBASE_REGION}-${process.env.REACT_APP_FIREBASE_PROJECT_ID}.cloudfunctions.net/generatePdf` 
        : `https://us-central1-${process.env.REACT_APP_FIREBASE_PROJECT_ID}.cloudfunctions.net/generatePdf`;

      // Préparation des données pour l'en-tête et le pied de page
      const defaultOptions = {
        displayHeaderFooter: true,
        footerTemplate: `
          <div style="font-size: 8pt; text-align: center; width: 100%; margin: 0 30px;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `,
      };

      // Fusion des options par défaut et des options personnalisées
      const mergedOptions = { ...defaultOptions, ...options };

      // Appeler la fonction Cloud Firebase
      const response = await axios.post(
        functionUrl, 
        {
          htmlContent,
          title,
          options: mergedOptions
        }, 
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  },

  /**
   * Génère et télécharge un PDF directement
   * @param {string} htmlContent - Le contenu HTML du document
   * @param {string} title - Le titre du document (sera également utilisé comme nom de fichier)
   * @param {object} options - Options supplémentaires pour la génération du PDF
   */
  generateAndDownloadPdf: async (htmlContent, title = 'document', options = {}) => {
    try {
      const pdfBlob = await pdfService.generatePdf(htmlContent, title, options);
      
      // Création d'un URL pour le blob PDF
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      
      // Création d'un lien temporaire pour télécharger le PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      document.body.appendChild(link);
      
      // Déclenchement du téléchargement
      link.click();
      
      // Nettoyage
      window.URL.revokeObjectURL(pdfUrl);
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw error;
    }
  }
};

export default pdfService;