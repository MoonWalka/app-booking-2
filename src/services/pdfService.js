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

      // Log pour débogage - affiche l'URL utilisée
      console.log('URL de la fonction Cloud Functions:', functionUrl);
      console.log('Project ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID);
      console.log('Region:', process.env.REACT_APP_FIREBASE_REGION || 'us-central1');

      // Préparation des données pour l'en-tête et le pied de page
      const defaultOptions = {
        displayHeaderFooter: true,
        footerTemplate: `
          <div style="font-size: 8pt; text-align: center; width: 100%; margin: 0 30px;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `,
        timeout: 30000, // Timeout par défaut de 30 secondes
      };

      // Fusion des options par défaut et des options personnalisées
      const mergedOptions = { ...defaultOptions, ...options };

      // Créer une source d'annulation pour pouvoir annuler la requête si nécessaire
      const source = axios.CancelToken.source();

      // Définir un timeout pour la requête complète
      const requestTimeout = setTimeout(() => {
        source.cancel("La requête a pris trop de temps - timeout dépassé");
      }, mergedOptions.timeout || 30000);

      try {
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
            },
            cancelToken: source.token,
            timeout: mergedOptions.timeout
          }
        );

        // Annuler le timeout puisque la requête a réussi
        clearTimeout(requestTimeout);
        
        return response.data;
      } catch (axiosError) {
        // Annuler le timeout en cas d'erreur également
        clearTimeout(requestTimeout);
        
        // Gestion spécifique des erreurs Axios
        if (axios.isCancel(axiosError)) {
          throw new Error("La génération du PDF a été annulée car elle prenait trop de temps.");
        }
        
        // Erreur 404 - La Cloud Function n'existe pas
        if (axiosError.response && axiosError.response.status === 404) {
          throw new Error(
            "La fonction de génération de PDF n'a pas été trouvée (erreur 404). " +
            "Veuillez vérifier que la Cloud Function 'generatePdf' est bien déployée sur Firebase."
          );
        }
        
        // Erreur CORS
        if (axiosError.message && axiosError.message.includes('access control checks')) {
          throw new Error(
            "Erreur CORS: L'application n'est pas autorisée à accéder à la fonction de génération PDF. " +
            "Vérifiez la configuration CORS de votre Cloud Function."
          );
        }
        
        // Propager les erreurs de réseau avec un message clair
        if (axiosError.message && axiosError.message.includes('Network Error')) {
          throw new Error("Erreur de connexion au service de génération de PDF. Vérifiez votre connexion internet.");
        }
        
        // Autres erreurs
        throw axiosError;
      }
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