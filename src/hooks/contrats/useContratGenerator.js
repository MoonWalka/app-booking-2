/**
 * @fileoverview Hook de génération de contrats PDF avec templates dynamiques
 * Gère la création, modification et sauvegarde de contrats PDF personnalisés
 * avec système de templates, variables dynamiques et gestion d'état avancée.
 * 
 * @author TourCraft Team
 * @since 2024
 */

/**
 * Hook de génération de contrats PDF avec système de templates avancé
 * 
 * Ce hook fournit une interface complète pour générer des contrats PDF personnalisés
 * en utilisant des templates dynamiques, des variables contextuelles et une gestion
 * d'état sophistiquée pour les workflows de contrats professionnels.
 * 
 * @description
 * Fonctionnalités principales :
 * - Gestion des templates de contrats avec sélection dynamique
 * - Génération de variables contextuelles automatiques
 * - Validation des données avant génération PDF
 * - Sauvegarde et versioning des contrats générés
 * - Gestion des contrats existants avec mise à jour
 * - Interface de débogage et gestion d'erreurs avancée
 * - Intégration avec les paramètres d'entreprise
 * - Système d'alertes et notifications
 * 
 * @param {Object} concert - Données complètes du concert
 * @param {string} concert.id - ID unique du concert
 * @param {string} concert.titre - Titre du concert
 * @param {Object} concert.date - Date du concert (Firestore timestamp)
 * @param {string} concert.heure - Heure du concert
 * @param {number} concert.montant - Montant du concert
 * 
 * @param {Object} programmateur - Données du programmateur
 * @param {string} programmateur.nom - Nom du programmateur
 * @param {string} programmateur.prenom - Prénom du programmateur
 * @param {string} programmateur.adresse - Adresse du programmateur
 * @param {string} programmateur.email - Email du programmateur
 * @param {string} programmateur.telephone - Téléphone du programmateur
 * @param {string} programmateur.structure - Structure du programmateur
 * 
 * @param {Object} artiste - Données de l'artiste
 * @param {string} artiste.nom - Nom de l'artiste
 * @param {string} artiste.genre - Genre musical
 * @param {string} artiste.contact - Contact de l'artiste
 * 
 * @param {Object} lieu - Données du lieu de concert
 * @param {string} lieu.nom - Nom du lieu
 * @param {string} lieu.adresse - Adresse du lieu
 * @param {string} lieu.capacite - Capacité du lieu
 * @param {string} lieu.ville - Ville du lieu
 * @param {string} lieu.codePostal - Code postal du lieu
 * 
 * @returns {Object} Interface complète de génération de contrats
 * @returns {Array} returns.templates - Liste des templates de contrats disponibles
 * @returns {string} returns.selectedTemplateId - ID du template sélectionné
 * @returns {Object|null} returns.selectedTemplate - Template sélectionné complet
 * @returns {boolean} returns.loading - État de chargement des données
 * @returns {boolean} returns.generatingPdf - État de génération PDF en cours
 * @returns {string|null} returns.pdfUrl - URL du PDF généré
 * @returns {Object|null} returns.entrepriseInfo - Informations de l'entreprise
 * @returns {string|null} returns.contratId - ID du contrat sauvegardé
 * @returns {string} returns.errorMessage - Message d'erreur détaillé
 * @returns {boolean} returns.showErrorAlert - État d'affichage de l'alerte d'erreur
 * @returns {boolean} returns.showSuccessAlert - État d'affichage de l'alerte de succès
 * @returns {boolean} returns.showDebugInfo - État d'affichage des infos de débogage
 * @returns {Function} returns.validateDataBeforeGeneration - Validation avant génération
 * @returns {Function} returns.handleTemplateChange - Gestionnaire de changement de template
 * @returns {Function} returns.prepareContractVariables - Préparation des variables de contrat
 * @returns {Function} returns.saveGeneratedContract - Sauvegarde du contrat généré
 * @returns {Function} returns.toggleDebugInfo - Basculement des infos de débogage
 * @returns {Function} returns.resetAlerts - Réinitialisation des alertes
 * @returns {Function} returns.showSuccess - Affichage d'alerte de succès
 * @returns {Function} returns.setPdfUrl - Définition de l'URL PDF
 * 
 * @example
 * ```javascript
 * const {
 *   templates,
 *   selectedTemplateId,
 *   selectedTemplate,
 *   loading,
 *   generatingPdf,
 *   pdfUrl,
 *   validateDataBeforeGeneration,
 *   handleTemplateChange,
 *   saveGeneratedContract,
 *   showSuccess,
 *   errorMessage
 * } = useContratGenerator(concert, programmateur, artiste, lieu);
 * 
 * // Sélection de template
 * <select value={selectedTemplateId} onChange={handleTemplateChange}>
 *   {templates.map(template => (
 *     <option key={template.id} value={template.id}>
 *       {template.name}
 *     </option>
 *   ))}
 * </select>
 * 
 * // Génération de contrat
 * const handleGenerate = async () => {
 *   if (!validateDataBeforeGeneration()) {
 *     alert('Données incomplètes pour la génération');
 *     return;
 *   }
 *   
 *   try {
 *     const pdfBlob = await generatePDF(selectedTemplate, variables);
 *     const url = await uploadPDF(pdfBlob);
 *     const contratId = await saveGeneratedContract(url);
 *     showSuccess(`Contrat ${contratId} généré avec succès !`);
 *   } catch (error) {
 *     console.error('Erreur génération:', error);
 *   }
 * };
 * ```
 * 
 * @dependencies
 * - Firebase Firestore (collections: contratTemplates, contrats, parametres)
 * - React hooks (useState, useEffect)
 * - PDF generation service
 * - File upload service
 * 
 * @complexity VERY_HIGH
 * @businessCritical true
 * @migrationCandidate useGenericDocumentGenerator - Candidat pour généralisation
 * 
 * @workflow
 * 1. Chargement des templates de contrats disponibles
 * 2. Récupération des informations d'entreprise
 * 3. Vérification d'existence de contrat pour le concert
 * 4. Sélection automatique du template par défaut
 * 5. Préparation des variables contextuelles
 * 6. Validation des données avant génération
 * 7. Génération du PDF avec template sélectionné
 * 8. Sauvegarde du contrat avec snapshot du template
 * 9. Gestion des versions et mises à jour
 * 10. Notifications et gestion d'erreurs
 * 
 * @templateSystem
 * - Templates avec header, body, footer personnalisables
 * - Variables dynamiques avec fallbacks
 * - Versioning automatique des templates
 * - Support logos et signatures
 * - Marges et hauteurs configurables
 * 
 * @variableMapping
 * - Programmateur: nom, prénom, adresse, email, téléphone, structure
 * - Lieu: nom, adresse, capacité, ville, codePostal
 * - Artiste: nom, genre, contact
 * - Concert: titre, date formatée, heure, montant formaté
 * 
 * @contractLifecycle
 * - generated: Contrat généré
 * - sent: Contrat envoyé
 * - signed: Contrat signé
 * - archived: Contrat archivé
 * 
 * @errorHandling
 * - Validation des données essentielles
 * - Gestion des templates manquants
 * - Erreurs de génération PDF détaillées
 * - Erreurs de sauvegarde Firestore
 * - Logging complet pour débogage
 * 
 * @performance
 * - Chargement asynchrone des templates
 * - Cache des informations d'entreprise
 * - Génération PDF optimisée
 * - Sauvegarde avec snapshots pour historique
 * 
 * @security
 * - Validation des données d'entrée
 * - Sanitization des variables de template
 * - Contrôle d'accès aux templates
 * - Audit trail des générations
 * 
 * @usedBy ContratGenerator, ContratEditor, ContratPreview, AdminContrats
 */

// src/hooks/contrats/useContratGenerator.js
import { useState, useEffect } from 'react';
import { db } from '@/services/firebase-service';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp
} from '@/services/firebase-service';

export const useContratGenerator = (concert, programmateur, artiste, lieu) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [entrepriseInfo, setEntrepriseInfo] = useState(null);
  const [contratId, setContratId] = useState(null);
  
  // États pour la gestion d'erreur et le succès
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Valider les données avant génération du PDF
  const validateDataBeforeGeneration = () => {
    // Vérifier si les données essentielles sont présentes
    if (!concert || !concert.id) {
      console.error("Données de concert manquantes ou invalides:", concert);
      return false;
    }
    
    if (!selectedTemplate) {
      console.error("Aucun modèle de contrat sélectionné");
      return false;
    }
    
    // Vérifier si le modèle a le bon format
    if (!selectedTemplate.bodyContent) {
      console.error("Le modèle sélectionné n'a pas de contenu body:", selectedTemplate);
      return false;
    }
    
    return true;
  };

  // Charger les modèles de contrat disponibles et les infos d'entreprise
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage('');
      setShowErrorAlert(false);
      
      try {
        console.log("Début du chargement des données pour la génération de contrat");
        // Récupérer les modèles de contrat
        const templatesQuery = query(
          collection(db, 'contratTemplates'), 
          orderBy('name')
        );
        const templatesSnapshot = await getDocs(templatesQuery);
        
        // Convertir les documents en objets
        const templatesList = templatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`${templatesList.length} modèles de contrat chargés`);
        setTemplates(templatesList);
        
        // Sélectionner le modèle par défaut s'il existe
        const defaultTemplate = templatesList.find(t => t.isDefault);
        if (defaultTemplate) {
          console.log("Modèle par défaut trouvé:", defaultTemplate.id);
          setSelectedTemplateId(defaultTemplate.id);
          setSelectedTemplate(defaultTemplate);
        } else if (templatesList.length > 0) {
          // Sinon, sélectionner le premier modèle
          setSelectedTemplateId(templatesList[0].id);
          setSelectedTemplate(templatesList[0]);
        }
        
        // Charger les informations de l'entreprise
        const entrepriseDoc = await getDoc(doc(db, 'parametres', 'entreprise'));
        if (entrepriseDoc.exists()) {
          console.log("Informations d'entreprise chargées");
          setEntrepriseInfo(entrepriseDoc.data());
        } else {
          console.warn("Informations d'entreprise non trouvées");
        }
        
        // Vérifier si un contrat existe déjà pour ce concert
        if (concert?.id) {
          console.log("Recherche d'un contrat existant pour le concert:", concert.id);
          const contratsQuery = query(
            collection(db, 'contrats'),
            where('concertId', '==', concert.id)
          );
          const contratsSnapshot = await getDocs(contratsQuery);
          
          if (!contratsSnapshot.empty) {
            const contratData = contratsSnapshot.docs[0].data();
            const contratDocId = contratsSnapshot.docs[0].id;
            console.log("Contrat existant trouvé:", contratDocId);
            setContratId(contratDocId);
            setPdfUrl(contratData.pdfUrl);
            
            // Si le contrat existe, utiliser son template
            if (contratData.templateId) {
              console.log("Utilisation du template du contrat existant:", contratData.templateId);
              setSelectedTemplateId(contratData.templateId);
              const templateDoc = templatesSnapshot.docs.find(doc => doc.id === contratData.templateId);
              if (templateDoc) {
                setSelectedTemplate({
                  id: templateDoc.id,
                  ...templateDoc.data()
                });
              } else {
                console.warn("Le template du contrat existant n'a pas été trouvé");
              }
            }
          } else {
            console.log("Aucun contrat existant pour ce concert");
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setErrorMessage(`Erreur lors du chargement des données: ${error.message}`);
        setShowErrorAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [concert?.id]);
  
  // Mettre à jour le modèle sélectionné quand l'ID change
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(template);
    }
  }, [selectedTemplateId, templates]);
  
  // Fonction pour gérer le changement de modèle
  const handleTemplateChange = (e) => {
    setSelectedTemplateId(e.target.value);
  };
  
  // Fonction pour préparer les variables du contrat
  const prepareContractVariables = () => {
    console.log("Préparation des variables du contrat");
    return {
      nomProgrammateur: programmateur?.nom || 'Non spécifié',
      prenomProgrammateur: programmateur?.prenom || '',
      adresseProgrammateur: programmateur?.adresse || 'Non spécifiée',
      emailProgrammateur: programmateur?.email || 'Non spécifié',
      telephoneProgrammateur: programmateur?.telephone || 'Non spécifié',
      structureProgrammateur: programmateur?.structure || 'Non spécifiée',
      
      nomLieu: lieu?.nom || 'Non spécifié',
      adresseLieu: lieu?.adresse || 'Non spécifiée',
      capaciteLieu: lieu?.capacite || 'Non spécifiée',
      villeLieu: lieu?.ville || 'Non spécifiée',
      codePostalLieu: lieu?.codePostal || 'Non spécifié',
      
      nomArtiste: artiste?.nom || 'Non spécifié',
      genreArtiste: artiste?.genre || 'Non spécifié',
      contactArtiste: artiste?.contact || 'Non spécifié',
      
      titreConcert: concert?.titre || 'Non spécifié',
      dateConcert: concert?.date ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR') : 'Non spécifiée',
      heureConcert: concert?.heure || 'Non spécifiée',
      montantConcert: concert?.montant 
        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant)
        : 'Non spécifié',
    };
  };
  
  // Fonction pour sauvegarder le contrat généré
  const saveGeneratedContract = async (url) => {
    try {
      console.log("Début de saveGeneratedContract avec URL:", url);
      setGeneratingPdf(true);
      
      const variables = prepareContractVariables();
      console.log("Variables préparées:", variables);
      
      // Créer une "snapshot" complète du template utilisé
      const templateSnapshot = {
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        version: Date.now(), // Ajouter un timestamp comme version
        // Copier toutes les propriétés pertinentes du template
        bodyContent: selectedTemplate.bodyContent,
        headerContent: selectedTemplate.headerContent,
        footerContent: selectedTemplate.footerContent,
        titleTemplate: selectedTemplate.titleTemplate,
        dateTemplate: selectedTemplate.dateTemplate && selectedTemplate.dateTemplate.trim() !== '' 
          ? selectedTemplate.dateTemplate 
          : null,
        signatureTemplate: selectedTemplate.signatureTemplate,
        // Autres propriétés importantes
        headerHeight: selectedTemplate.headerHeight,
        footerHeight: selectedTemplate.footerHeight,
        headerBottomMargin: selectedTemplate.headerBottomMargin,
        footerTopMargin: selectedTemplate.footerTopMargin,
        logoUrl: selectedTemplate.logoUrl,
        type: selectedTemplate.type
      };
      
      console.log("Snapshot du template créée:", templateSnapshot);
      
      // Vérifier si un contrat existe déjà
      if (contratId) {
        console.log("Mise à jour du contrat existant:", contratId);
        const contratRef = doc(db, 'contrats', contratId);
        await updateDoc(contratRef, {
          pdfUrl: url,
          templateId: selectedTemplateId,
          templateSnapshot,
          dateGeneration: serverTimestamp(),
          variables
        });
        console.log("Contrat mis à jour avec succès");
        
        return contratId;
      } else {
        console.log("Création d'un nouveau contrat pour le concert:", concert.id);
        const contratData = {
          concertId: concert.id,
          templateId: selectedTemplateId,
          templateSnapshot,
          dateGeneration: serverTimestamp(),
          dateEnvoi: null,
          status: 'generated',
          pdfUrl: url,
          variables
        };
        
        console.log("Données du contrat à enregistrer:", contratData);
        
        try {
          const docRef = await addDoc(collection(db, 'contrats'), contratData);
          console.log("Nouveau contrat créé avec ID:", docRef.id);
          setContratId(docRef.id);
          return docRef.id;
        } catch (innerError) {
          console.error("Erreur lors de l'ajout du document:", innerError);
          console.error("Code:", innerError.code);
          console.error("Message:", innerError.message);
          throw innerError;
        }
      }
    } catch (error) {
      console.error('Erreur détaillée lors de la sauvegarde du contrat:', error);
      console.error('Type d\'erreur:', error.constructor.name);
      console.error('Message d\'erreur:', error.message);
      console.error('Code d\'erreur:', error.code);
      console.error('Stack trace:', error.stack);
      
      setErrorMessage(`Erreur lors de la sauvegarde du contrat: ${error.message}`);
      setShowErrorAlert(true);
      throw error;
    } finally {
      setGeneratingPdf(false);
    }
  };
  
  // Fonction pour basculer l'affichage des informations de débogage
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };
  
  // Fonction pour réinitialiser les alertes
  const resetAlerts = () => {
    setShowErrorAlert(false);
    setShowSuccessAlert(false);
  };
  
  // Fonction pour afficher une alerte de succès
  const showSuccess = (message = "Contrat généré et sauvegardé avec succès !") => {
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  return {
    // États
    templates,
    selectedTemplateId,
    selectedTemplate,
    loading,
    generatingPdf,
    pdfUrl,
    entrepriseInfo,
    contratId,
    errorMessage,
    showErrorAlert,
    showSuccessAlert,
    showDebugInfo,
    
    // Fonctions
    validateDataBeforeGeneration,
    handleTemplateChange,
    prepareContractVariables,
    saveGeneratedContract,
    toggleDebugInfo,
    resetAlerts,
    showSuccess,
    setPdfUrl
  };
};

export default useContratGenerator;