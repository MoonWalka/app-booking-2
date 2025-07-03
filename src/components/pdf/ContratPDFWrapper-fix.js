// MODIFICATION TEMPORAIRE pour ignorer contratContenu dans les anciens contrats
// Ce fichier montre les changements nécessaires dans ContratPDFWrapper.js

// Dans la fonction getContratHTML, ajouter cette vérification au début :

const getContratHTML = (data, title = '', forPreview = false, editedContent = null) => {
  console.log('[DEBUG ContratPDFWrapper] getContratHTML data:', data);
  const safeData = createSafeData(data);
  
  // NOUVELLE VÉRIFICATION : Ignorer contratContenu s'il existe
  // Ceci force l'utilisation du nouveau système de templates
  if (safeData.contrat && safeData.contrat.contratContenu) {
    console.warn('⚠️ Ancien contrat détecté avec contratContenu - Utilisation du nouveau système de templates');
    // Ne pas utiliser contratContenu, continuer avec le template
  }

  // Si on a du contenu édité, l'utiliser mais remplacer les variables
  if (editedContent) {
    // ... code existant pour editedContent ...
  }
  
  // SYSTÈME UNIFIÉ UNIQUEMENT - Utiliser directement bodyContent
  // ... reste du code existant ...
}

// Alternative : Modifier createSafeData pour supprimer contratContenu

const createSafeData = (data) => {
  // ... code existant ...
  
  const safeData = {
    template: effectiveTemplate,
    concert: concert || concertData || {},
    contact: contact || contactData || {},
    programmateur: programmateur || programmateurData || {},
    artiste: artiste || artisteData || {},
    lieu: lieu || lieuData || {},
    structure: structure || structureData || {},
    entreprise: entreprise || entrepriseInfo || {},
    contratData: contratData || data.contratData || null
  };

  // NOUVELLE LIGNE : Supprimer contratContenu s'il existe
  if (safeData.contrat && safeData.contrat.contratContenu) {
    delete safeData.contrat.contratContenu;
  }

  console.log('[DEBUG ContratPDFWrapper] createSafeData input:', data);
  console.log('[DEBUG ContratPDFWrapper] createSafeData output:', safeData);

  return safeData;
};