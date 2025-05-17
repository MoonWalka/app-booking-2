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
    // Fusionner les options avec les valeurs par défaut
    const mergedOptions = {
      timeout: 60000, // 60 secondes par défaut
      ...options
    };
    
    // Déclarer la variable requestTimeout en dehors du bloc try pour qu'elle soit accessible dans le catch
    let requestTimeout;
    // Utiliser un CancelToken source pour pouvoir annuler la requête
    const source = axios.CancelToken.source();
    
    try {
      // URL de la fonction Cloud Firebase
      const functionUrl = process.env.REACT_APP_FIREBASE_REGION
        ? `https://${process.env.REACT_APP_FIREBASE_REGION}-${process.env.REACT_APP_FIREBASE_PROJECT_ID}.cloudfunctions.net/generatePdf`
        : `https://us-central1-${process.env.REACT_APP_FIREBASE_PROJECT_ID}.cloudfunctions.net/generatePdf`;
      
      // Log pour débogage
      console.log('Utilisation de Firebase Cloud Functions (plan Blaze) pour générer le PDF');
      console.log('Project ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID);
      
      // Définir le timeout pour annuler la requête si elle prend trop de temps
      requestTimeout = setTimeout(() => {
        source.cancel('La requête a pris trop de temps, elle a été automatiquement annulée.');
      }, mergedOptions.timeout);
      
      // Faire la requête à la Cloud Function
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
      if (requestTimeout) {
        clearTimeout(requestTimeout);
      }
      // Gestion spécifique des erreurs Axios
      if (axios.isCancel(axiosError)) {
        throw new Error("La génération du PDF a été annulée car elle prenait trop de temps.");
      }
      // Erreur 404 - La Cloud Function n'existe pas
      if (axiosError.response && axiosError.response.status === 404) {
        throw new Error(
          "La fonction de génération de PDF n'a pas été trouvée (erreur 404). " +
          "Veuillez vérifier que la Cloud Function 'generatePdf' est bien déployée sur Firebase et que vous avez activé le plan Blaze."
        );
      }
      // Erreur 403 - Problème d'autorisation (plan Spark)
      if (axiosError.response && axiosError.response.status === 403) {
        throw new Error(
          "Accès non autorisé (erreur 403). " +
          "Veuillez vérifier que vous avez bien activé le plan Blaze sur Firebase pour utiliser les Cloud Functions avec Puppeteer."
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
        throw new Error("Erreur de connexion au service de génération de PDF. Vérifiez votre connexion internet et que la formule Blaze est bien activée sur Firebase.");
      }
      // Autres erreurs
      throw axiosError;
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
      // Générer le PDF
      const pdfBlob = await pdfService.generatePdf(htmlContent, title, options);
      
      // Créer une URL pour le blob
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Créer un lien pour le téléchargement
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title}.pdf`;
      
      // Ajouter le lien au document, cliquer dessus, puis le supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer l'URL du blob
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      
      // Afficher une alerte avec un message d'erreur plus convivial
      alert(`Erreur lors de la génération du PDF: ${error.message || 'Une erreur inconnue est survenue'}. Vérifiez que vous avez bien activé le plan Blaze sur Firebase.`);
      
      throw error;
    }
  }
};

export default pdfService;