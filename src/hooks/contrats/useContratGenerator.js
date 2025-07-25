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
 * @param {Object} date - Données complètes de la date
 * @param {string} date.id - ID unique de la date
 * @param {string} date.titre - Titre de la date
 * @param {Object} date.date - Date de la date (Firestore timestamp)
 * @param {string} date.heure - Heure de la date
 * @param {number} date.montant - Montant de la date
 * 
 * @param {Object} contact - Données du contact (anciennement programmateur)
 * @param {string} contact.nom - Nom du contact
 * @param {string} contact.prenom - Prénom du contact
 * @param {string} contact.adresse - Adresse du contact
 * @param {string} contact.email - Email du contact
 * @param {string} contact.telephone - Téléphone du contact
 * @param {string} contact.structure - Structure du contact
 * 
 * @param {Object} artiste - Données de l'artiste
 * @param {string} artiste.nom - Nom de l'artiste
 * @param {string} artiste.genre - Genre musical
 * @param {string} artiste.contact - Contact de l'artiste
 * 
 * @param {Object} lieu - Données du lieu de l'événement
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
 * } = useContratGenerator(date, contact, artiste, lieu);
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
 * 3. Vérification d'existence de contrat pour la date
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
 * - contact: nom, prénom, adresse, email, téléphone, structure
 * - Lieu: nom, adresse, capacité, ville, codePostal
 * - Artiste: nom, genre, contact
 * - Date: titre, date formatée, heure, montant formaté
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
import { useState, useEffect, useCallback } from 'react';
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
import { ensureDefaultTemplate } from '@/utils/createDefaultContractTemplate';
import { useEntreprise } from '@/context/EntrepriseContext';

export const useContratGenerator = (date, contact, artiste, lieu, contratData = null) => {
  // Support rétrocompatibilité pour l'ancien paramètre 'programmateur'
  const programmateur = contact;
  const { currentEntreprise } = useEntreprise();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [entrepriseInfo, setEntrepriseInfo] = useState(null);
  const [contratId, setContratId] = useState(null);
  const [structureData, setStructureData] = useState(null);
  
  // États pour la gestion d'erreur et le succès
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Valider les données avant génération du PDF
  const validateDataBeforeGeneration = () => {
    // Vérifier si les données essentielles sont présentes
    if (!date || !date.id) {
      console.error("Données de date manquantes ou invalides:", date);
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
        
        // Vérifier et créer un modèle par défaut si nécessaire
        await ensureDefaultTemplate();
        
        // Récupérer tous les modèles de contrat
        const templatesQuery = query(
          collection(db, 'contratTemplates'),
          orderBy('name')
        );
        const templatesSnapshot = await getDocs(templatesQuery);
        
        // Filtrer les templates : garder ceux de l'entreprise courante OU ceux sans entrepriseId (globaux)
        let allDocs = templatesSnapshot.docs;
        if (currentEntreprise?.id) {
          allDocs = templatesSnapshot.docs.filter(doc => {
            const data = doc.data();
            // Garder le template s'il appartient à l'entreprise courante OU s'il n'a pas d'entrepriseId (template global)
            return data.entrepriseId === currentEntreprise.id || !data.entrepriseId;
          });
        }
        
        // Convertir les documents en objets
        const templatesList = allDocs.map(doc => ({
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
        
        // Charger les données de structure selon le type de contact
        if (contact) {
          console.log("Analyse du contact pour charger la structure:", {
            type: contact._type,
            structureId: contact.structureId,
            hasStructureData: !!contact.structure
          });
          
          // Nouveau système : le contact EST déjà une structure
          if (contact._type === 'structure') {
            console.log("Le contact est déjà une structure, utilisation directe des données");
            setStructureData(contact);
          }
          // Nouveau système : le contact est une personne, charger sa structure si liée
          else if (contact._type === 'personne') {
            console.log("Le contact est une personne, recherche d'une structure liée");
            // TODO: Implémenter la recherche de liaison personne-structure
            // Pour l'instant, on utilise les données de la personne
            setStructureData(null);
          }
          // Ancien système : contact avec structureId
          else if (contact.structureId) {
            console.log("Ancien système - Chargement de la structure via structureId:", contact.structureId);
            try {
              const structureDoc = await getDoc(doc(db, 'structures', contact.structureId));
              if (structureDoc.exists()) {
                const data = structureDoc.data();
                console.log("Structure trouvée, données complètes:", data);
                console.log("🏢 Structure - Champs disponibles:", {
                  nom: data.nom,
                  raisonSociale: data.raisonSociale,
                  adresse: data.adresse,
                  codePostal: data.codePostal,
                  ville: data.ville,
                  pays: data.pays,
                  siret: data.siret,
                  email: data.email,
                  telephone: data.telephone,
                  type: data.type
                });
                setStructureData(data);
              } else {
                console.warn("Structure non trouvée avec l'ID:", contact.structureId);
              }
            } catch (structureError) {
              console.error("Erreur lors du chargement de la structure:", structureError);
            }
          }
        }
        
        // Vérifier si un contrat existe déjà pour cette date
        if (date?.id) {
          console.log("Recherche d'un contrat existant pour la date:", date.id);
          // Récupérer tous les contrats pour cette date
          const contratsQuery = query(
            collection(db, 'contrats'),
            where('dateId', '==', date.id)
          );
          const contratsSnapshot = await getDocs(contratsQuery);
          
          // Filtrer par organisation si nécessaire
          let contratDocs = contratsSnapshot.docs;
          if (currentEntreprise?.id) {
            // Privilégier les contrats de l'entreprise courante, mais accepter aussi ceux sans entrepriseId
            contratDocs = contratsSnapshot.docs.filter(doc => {
              const data = doc.data();
              return data.entrepriseId === currentEntreprise.id || !data.entrepriseId;
            });
          }
          
          if (contratDocs.length > 0) {
            const contratData = contratDocs[0].data();
            const contratDocId = contratDocs[0].id;
            console.log("Contrat existant trouvé:", contratDocId);
            setContratId(contratDocId);
            setPdfUrl(contratData.pdfUrl);
            
            // Si le contrat existe, utiliser son template
            if (contratData.templateId) {
              console.log("Utilisation du template du contrat existant:", contratData.templateId);
              setSelectedTemplateId(contratData.templateId);
              const templateDoc = allDocs.find(doc => doc.id === contratData.templateId);
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
            console.log("Aucun contrat existant pour cette date");
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        // S'assurer que le message d'erreur est une chaîne
        const errorMsg = error?.message || error?.toString() || 'Erreur inconnue lors du chargement des données';
        setErrorMessage(`Erreur lors du chargement des données: ${errorMsg}`);
        setShowErrorAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date?.id, contact?.structureId, contact?._type, currentEntreprise?.id]);
  
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
  
  // Fonction utilitaire pour sécuriser les valeurs
  const safeStringValue = (value, fallback = 'Non spécifié') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      console.warn('⚠️ Tentative d\'affichage d\'un objet comme string:', value);
      return fallback;
    }
    return String(value);
  };

  // Fonction pour préparer les variables du contrat
  // IMPORTANT: Cette fonction supporte deux systèmes de contacts :
  // 1. Nouveau système relationnel : structures/personnes/liaisons avec contact.type et contact.structures[]
  // 2. Ancien système unifié : collection contacts avec contact.structure (string) et contact.structureId
  const prepareContractVariables = useCallback(() => {
    console.log("Préparation des variables du contrat");
    console.log("🔍 État actuel de structureData:", structureData);
    console.log("🔍 contact:", contact);
    console.log("🔍 contact.type:", contact?.type);
    console.log("🔍 contact.structures:", contact?.structures);
    console.log("🔍 contact.structureId:", contact?.structureId);
    
    // Log de débogage pour vérifier ce qui est transmis
    if (structureData) {
      console.log("✅ Structure chargée:", {
        nom: structureData.raisonSociale,
        siret: structureData.siret,
        adresse: structureData.adresse,
        email: structureData.email,
        telephone: structureData.telephone,
        numeroIntracommunautaire: structureData.numeroIntracommunautaire
      });
    } else {
      console.log("⚠️ Structure non chargée, utilisation des données du contact:", {
        structure: contact?.structure,
        siret: contact?.siret,
        adresse: contact?.adresse
      });
    }
    
    // Fonction helper pour convertir un montant en lettres
    const montantEnLettres = (montant) => {
      if (!montant) return 'Non spécifié';
      const montantNum = parseFloat(montant);
      if (isNaN(montantNum)) return 'Non spécifié';
      
      // Fonction de conversion nombre vers lettres en français
      const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
      const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
      const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
      
      const convertirNombreEnLettres = (nombre) => {
        if (nombre === 0) return 'zéro';
        if (nombre < 0) return 'moins ' + convertirNombreEnLettres(-nombre);
        
        let resultat = '';
        
        // Milliers
        if (nombre >= 1000) {
          const milliers = Math.floor(nombre / 1000);
          if (milliers === 1) {
            resultat += 'mille ';
          } else {
            resultat += convertirNombreEnLettres(milliers) + ' mille ';
          }
          nombre = nombre % 1000;
        }
        
        // Centaines
        if (nombre >= 100) {
          const centaines = Math.floor(nombre / 100);
          if (centaines === 1) {
            resultat += 'cent ';
          } else {
            resultat += unites[centaines] + ' cent' + (nombre % 100 === 0 && centaines > 1 ? 's ' : ' ');
          }
          nombre = nombre % 100;
        }
        
        // Dizaines et unités
        if (nombre >= 20) {
          const dizaine = Math.floor(nombre / 10);
          const unite = nombre % 10;
          
          if (dizaine === 7 || dizaine === 9) {
            resultat += dizaines[dizaine] + '-' + teens[unite] + ' ';
          } else {
            resultat += dizaines[dizaine];
            if (unite === 1 && dizaine !== 8) {
              resultat += ' et un ';
            } else if (unite > 0) {
              resultat += '-' + unites[unite] + ' ';
            } else {
              resultat += ' ';
            }
          }
        } else if (nombre >= 10) {
          resultat += teens[nombre - 10] + ' ';
        } else if (nombre > 0) {
          resultat += unites[nombre] + ' ';
        }
        
        return resultat.trim();
      };
      
      // Séparer la partie entière et décimale
      const partieEntiere = Math.floor(montantNum);
      const partieDecimale = Math.round((montantNum - partieEntiere) * 100);
      
      let resultat = convertirNombreEnLettres(partieEntiere) + ' euro' + (partieEntiere > 1 ? 's' : '');
      
      if (partieDecimale > 0) {
        resultat += ' et ' + convertirNombreEnLettres(partieDecimale) + ' centime' + (partieDecimale > 1 ? 's' : '');
      }
      
      // Mettre la première lettre en majuscule
      return resultat.charAt(0).toUpperCase() + resultat.slice(1);
    };
    
    return {
      // Variables entreprise
      nom_entreprise: entrepriseInfo?.nom || 'Non spécifié',
      adresse_entreprise: entrepriseInfo?.adresse || 'Non spécifiée',
      siret_entreprise: entrepriseInfo?.siret || 'Non spécifié',
      telephone_entreprise: entrepriseInfo?.telephone || 'Non spécifié',
      email_entreprise: entrepriseInfo?.email || 'Non spécifié',
      representant_entreprise: entrepriseInfo?.representant || 'Non spécifié',
      fonction_representant: entrepriseInfo?.fonctionRepresentant || 'Non spécifiée',
      
      // Variables Organisateur (Partie A - si contratData est fourni)
      ...(contratData?.organisateur && {
        organisateur_raison_sociale: contratData.organisateur.raisonSociale || 'Non spécifié',
        organisateur_adresse: contratData.organisateur.adresse || 'Non spécifiée',
        organisateur_code_postal: contratData.organisateur.codePostal || 'Non spécifié',
        organisateur_ville: contratData.organisateur.ville || 'Non spécifiée',
        organisateur_pays: contratData.organisateur.pays || 'France',
        organisateur_telephone: contratData.organisateur.telephone || 'Non spécifié',
        organisateur_email: contratData.organisateur.email || 'Non spécifié',
        organisateur_siret: contratData.organisateur.siret || 'Non spécifié',
        organisateur_numero_tva: contratData.organisateur.numeroTva || 'Non spécifié',
        organisateur_code_ape: contratData.organisateur.codeApe || 'Non spécifié',
        organisateur_numero_licence: contratData.organisateur.numeroLicence || 'Non spécifié',
        organisateur_signataire: contratData.organisateur.signataire || 'Non spécifié',
        organisateur_qualite: contratData.organisateur.qualite || 'Non spécifiée',
      }),
      
      // Variables Producteur (Partie B - si contratData est fourni)
      ...(contratData?.producteur && {
        producteur_raison_sociale: contratData.producteur.raisonSociale || entrepriseInfo?.nom || 'Non spécifié',
        producteur_adresse: contratData.producteur.adresse || entrepriseInfo?.adresse || 'Non spécifiée',
        producteur_code_postal: contratData.producteur.codePostal || 'Non spécifié',
        producteur_ville: contratData.producteur.ville || 'Non spécifiée',
        producteur_pays: contratData.producteur.pays || 'France',
        producteur_telephone: contratData.producteur.telephone || entrepriseInfo?.telephone || 'Non spécifié',
        producteur_email: contratData.producteur.email || entrepriseInfo?.email || 'Non spécifié',
        producteur_siret: contratData.producteur.siret || entrepriseInfo?.siret || 'Non spécifié',
        producteur_numero_tva: contratData.producteur.numeroTva || 'Non spécifié',
        producteur_code_ape: contratData.producteur.codeApe || 'Non spécifié',
        producteur_numero_licence: contratData.producteur.numeroLicence || 'Non spécifié',
        producteur_signataire: contratData.producteur.signataire || entrepriseInfo?.representant || 'Non spécifié',
        producteur_qualite: contratData.producteur.qualite || entrepriseInfo?.fonctionRepresentant || 'Non spécifiée',
      }),
      
      // Variables Prestations (si contratData est fourni)
      ...(contratData?.prestations && {
        total_ht: (() => {
          const total = contratData.prestations.reduce((sum, p) => sum + (parseFloat(p.montantHT) || 0), 0);
          return total.toFixed(2).replace('.', ',') + ' €';
        })(),
        total_tva: (() => {
          const total = contratData.prestations.reduce((sum, p) => sum + (parseFloat(p.montantTVA) || 0), 0);
          return total.toFixed(2).replace('.', ',') + ' €';
        })(),
        total_ttc: (() => {
          const total = contratData.prestations.reduce((sum, p) => sum + (parseFloat(p.montantTTC) || 0), 0);
          return total.toFixed(2).replace('.', ',') + ' €';
        })(),
        total_ttc_lettres: (() => {
          const total = contratData.prestations.reduce((sum, p) => sum + (parseFloat(p.montantTTC) || 0), 0);
          return montantEnLettres(total);
        })(),
        // Première prestation
        ...(contratData.prestations[0] && {
          prestation_1_description: contratData.prestations[0].description || 'Non spécifiée',
          prestation_1_montant_ht: (parseFloat(contratData.prestations[0].montantHT) || 0).toFixed(2).replace('.', ',') + ' €',
          prestation_1_tva: contratData.prestations[0].tauxTVA ? `${contratData.prestations[0].tauxTVA}%` : '0%',
          prestation_1_montant_ttc: (parseFloat(contratData.prestations[0].montantTTC) || 0).toFixed(2).replace('.', ',') + ' €',
        })
      }),
      
      // Variables Représentations (si contratData est fourni)
      ...(contratData?.representations && {
        representation_date_debut: contratData.representations.debut || 'Non spécifiée',
        representation_date_fin: contratData.representations.fin || 'Non spécifiée',
        representation_horaire_debut: contratData.representations.horaireDebut || 'Non spécifié',
        representation_horaire_fin: contratData.representations.horaireFin || 'Non spécifié',
        representation_nombre: contratData.representations.nbRepresentations || '1',
        representation_salle: contratData.representations.salle || 'Non spécifiée',
        representation_type: contratData.representations.type || 'Date',
        representation_invitations: contratData.representations.invitations ? contratData.representations.nbAdmins || '0' : '0',
      }),
      
      // Variables Logistique (si contratData est fourni)
      ...(contratData?.hebergements && contratData.hebergements.length > 0 && {
        hebergement_nombre_total: contratData.hebergements.reduce((sum, h) => sum + (parseInt(h.singles || 0) + parseInt(h.doubles || 0) * 2), 0).toString(),
        hebergement_singles: contratData.hebergements.reduce((sum, h) => sum + parseInt(h.singles || 0), 0).toString(),
        hebergement_doubles: contratData.hebergements.reduce((sum, h) => sum + parseInt(h.doubles || 0), 0).toString(),
        hebergement_arrivee: contratData.hebergements[0]?.dateArrivee || 'Non spécifiée',
        hebergement_depart: contratData.hebergements[0]?.dateDepart || 'Non spécifiée',
      }),
      ...(contratData?.restaurations && contratData.restaurations.length > 0 && {
        restauration_nombre: contratData.restaurations.reduce((sum, r) => sum + parseInt(r.nombre || 0), 0).toString(),
      }),
      transport_type: 'Non spécifié', // À mapper si les données sont disponibles
      
      // Variables Règlement (si contratData est fourni)
      ...(contratData?.echeances && contratData.echeances.length > 0 && {
        echeance_1_nature: contratData.echeances[0]?.nature || 'Non spécifiée',
        echeance_1_date: contratData.echeances[0]?.date || 'Non spécifiée',
        echeance_1_montant: contratData.echeances[0]?.montant ? `${contratData.echeances[0].montant} €` : 'Non spécifié',
      }),
      mode_reglement: contratData?.negociation?.moyenPaiement || 'virement',
      delai_paiement: '30 jours', // Valeur par défaut, à ajuster selon les besoins
      
      // Variables contact (nouvelle nomenclature)
      // Support du système relationnel (structures/personnes) ET de l'ancien système
      contact_nom: (() => {
        // Nouveau système : structure
        if (contact?._type === 'structure') {
          return contact.nom || contact.raisonSociale || 'Non spécifié';
        }
        // Nouveau système : personne
        if (contact?._type === 'personne') {
          return contact.nom || 'Non spécifié';
        }
        // Ancien système
        return contact?.nom || 'Non spécifié';
      })(),
      contact_prenom: (() => {
        // Nouveau système : structure (pas de prénom)
        if (contact?._type === 'structure') {
          return '';
        }
        // Nouveau système : personne
        if (contact?._type === 'personne') {
          return contact.prenom || '';
        }
        // Ancien système
        return contact?.prenom || '';
      })(),
      contact_structure: (() => {
        // Nouveau système : le contact EST la structure
        if (contact?._type === 'structure') {
          return contact.nom || contact.raisonSociale || 'Non spécifiée';
        }
        // Nouveau système : personne avec structure liée
        if (contact?._type === 'personne' && structureData) {
          return structureData.raisonSociale || structureData.nom || 'Non spécifiée';
        }
        // Ancien système avec structure chargée
        if (structureData?.raisonSociale) {
          return structureData.raisonSociale;
        }
        // Ancien système
        return contact?.structure || 'Non spécifiée';
      })(),
      contact_email: contact?.email || 'Non spécifié',
      contact_telephone: contact?.telephone || 'Non spécifié',
      contact_siret: (() => {
        // Nouveau système : structure
        if (contact?._type === 'structure') {
          return contact.siret || 'Non spécifié';
        }
        // Structure chargée séparément
        if (structureData?.siret) {
          return structureData.siret;
        }
        // Ancien système
        return contact?.siret || 'Non spécifié';
      })(),
      
      // Variables contact (compatibilité rétrograde - ancienne nomenclature programmateur)
      programmateur_nom: (() => {
        // Même logique que contact_nom pour la compatibilité
        if (contact?._type === 'structure') {
          return contact.nom || contact.raisonSociale || 'Non spécifié';
        }
        if (contact?._type === 'personne') {
          return contact.nom || 'Non spécifié';
        }
        return contact?.nom || 'Non spécifié';
      })(),
      programmateur_prenom: (() => {
        if (contact?._type === 'structure') {
          return '';
        }
        if (contact?._type === 'personne') {
          return contact.prenom || '';
        }
        return contact?.prenom || '';
      })(),
      programmateur_structure: (() => {
        // Même logique que contact_structure
        if (contact?._type === 'structure') {
          return contact.nom || contact.raisonSociale || 'Non spécifiée';
        }
        if (contact?._type === 'personne' && structureData) {
          return structureData.raisonSociale || structureData.nom || 'Non spécifiée';
        }
        if (structureData?.raisonSociale) {
          return structureData.raisonSociale;
        }
        return contact?.structure || 'Non spécifiée';
      })(),
      programmateur_email: contact?.email || 'Non spécifié',
      programmateur_telephone: contact?.telephone || 'Non spécifié',
      programmateur_siret: (() => {
        // Même logique que contact_siret
        if (contact?._type === 'structure') {
          return contact.siret || 'Non spécifié';
        }
        if (structureData?.siret) {
          return structureData.siret;
        }
        return contact?.siret || 'Non spécifié';
      })(),
      contact_adresse: (() => {
        // Nouveau système : si le contact EST une structure
        if (contact?._type === 'structure') {
          // Construire l'adresse complète à partir des champs plats
          const parts = [
            contact.adresse,
            contact.codePostal,
            contact.ville
          ].filter(Boolean);
          return parts.length > 0 ? parts.join(' ') : 'Non spécifiée';
        }
        
        // Si on a chargé une structure séparément
        if (structureData) {
          const parts = [
            structureData.adresse,
            structureData.codePostal,
            structureData.ville
          ].filter(Boolean);
          return parts.length > 0 ? parts.join(' ') : 'Non spécifiée';
        }
        
        // Nouveau système : personne peut avoir une adresse personnelle
        if (contact?._type === 'personne' && contact?.adresse) {
          return contact.adresse;
        }
        
        // Ancien système - utiliser l'adresse du contact
        return contact?.adresse || 'Non spécifiée';
      })(),
      contact_numero_intracommunautaire: structureData?.numeroIntracommunautaire || contact?.numeroIntracommunautaire || contact?.numero_intracommunautaire || 'Non spécifié',
      contact_representant: contact?.representant || contact?.nom || 'Non spécifié',
      contact_qualite_representant: contact?.qualiteRepresentant || contact?.qualite_representant || contact?.fonction || 'Non spécifiée',
      programmateur_adresse: (() => {
        // Même logique que contact_adresse pour la compatibilité
        if (contact?._type === 'structure') {
          const parts = [
            contact.adresse,
            contact.codePostal,
            contact.ville
          ].filter(Boolean);
          return parts.length > 0 ? parts.join(' ') : 'Non spécifiée';
        }
        
        if (structureData) {
          const parts = [
            structureData.adresse,
            structureData.codePostal,
            structureData.ville
          ].filter(Boolean);
          return parts.length > 0 ? parts.join(' ') : 'Non spécifiée';
        }
        
        if (contact?._type === 'personne' && contact?.adresse) {
          return contact.adresse;
        }
        
        return contact?.adresse || 'Non spécifiée';
      })(),
      programmateur_numero_intracommunautaire: structureData?.numeroIntracommunautaire || contact?.numeroIntracommunautaire || contact?.numero_intracommunautaire || 'Non spécifié',
      programmateur_representant: contact?.representant || contact?.nom || 'Non spécifié',
      programmateur_qualite_representant: contact?.qualiteRepresentant || contact?.qualite_representant || contact?.fonction || 'Non spécifiée',
      
      // Variables artiste
      artiste_nom: artiste?.nom || 'Non spécifié',
      artiste_genre: artiste?.genre || 'Non spécifié',
      artiste_contact: artiste?.contact || 'Non spécifié',
      artiste_representant: artiste?.representant || artiste?.contact || 'Non spécifié',
      artiste_structure_nom: artiste?.structureNom || artiste?.structure || 'Non spécifiée',
      artiste_structure_siret: artiste?.structureSiret || 'Non spécifié',
      
      // Variables date (événement)
      date_titre: date?.titre || 'Non spécifié',
      date_date: (() => {
        if (!date?.date) return 'Non spécifiée';
        
        // Gérer différents formats de date possibles
        let dateObj;
        
        // Si c'est un timestamp Firestore
        if (date.date.seconds) {
          dateObj = new Date(date.date.seconds * 1000);
        } 
        // Si c'est une string de date
        else if (typeof date.date === 'string') {
          dateObj = new Date(date.date);
        }
        // Si c'est déjà un objet Date
        else if (date.date instanceof Date) {
          dateObj = date.date;
        }
        // Si c'est un timestamp numérique
        else if (typeof date.date === 'number') {
          dateObj = new Date(date.date);
        } else {
          return 'Non spécifiée';
        }
        
        // Vérifier que la date est valide
        if (isNaN(dateObj.getTime())) {
          return 'Non spécifiée';
        }
        
        return dateObj.toLocaleDateString('fr-FR');
      })(),
      date_heure: date?.heure || 'Non spécifiée',
      date_montant: date?.montant 
        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(date.montant)
        : 'Non spécifié',
      date_montant_lettres: montantEnLettres(date?.montant),
      date_type: contratData?.representations?.type || date?.type || 'Date',
      
      // Variables lieu
      lieu_nom: lieu?.nom || 'Non spécifié',
      lieu_adresse: lieu?.adresse || 'Non spécifiée',
      lieu_code_postal: lieu?.codePostal || lieu?.code_postal || 'Non spécifié',
      lieu_ville: lieu?.ville || 'Non spécifiée',
      lieu_capacite: lieu?.capacite || 'Non spécifiée',
      
      // Variables structure
      structure_nom: safeStringValue(structureData?.nom || structureData?.raisonSociale || contact?.structure, 'Non spécifiée'),
      structure_siret: safeStringValue(structureData?.siret, 'Non spécifié'),
      structure_adresse: (() => {
        // Dans le nouveau système, l'adresse est stockée en champs plats
        return safeStringValue(structureData?.adresse, 'Non spécifiée');
      })(),
      structure_code_postal: (() => {
        return safeStringValue(structureData?.codePostal, 'Non spécifié');
      })(),
      structure_ville: (() => {
        return safeStringValue(structureData?.ville, 'Non spécifiée');
      })(),
      structure_pays: (() => {
        return safeStringValue(structureData?.pays, 'France');
      })(),
      structure_email: safeStringValue(structureData?.email, 'Non spécifié'),
      structure_telephone: safeStringValue(structureData?.telephone, 'Non spécifié'),
      structure_type: safeStringValue(structureData?.type, 'Non spécifié'),
      
      // Variables de date
      date_jour: new Date().getDate().toString(),
      date_mois: new Date().toLocaleDateString('fr-FR', { month: 'long' }),
      date_annee: new Date().getFullYear().toString(),
      date_complete: new Date().toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      date_signature: new Date().toLocaleDateString('fr-FR'),
      
      // Variables signature
      lieu_signature: lieu?.ville || 'Non spécifiée',
      programmateur_fonction: contact?.fonction || 'Non spécifiée',
      
      // Variables spéciales
      SAUT_DE_PAGE: '<div style="page-break-after: always;"></div>',
      page: '{page}',
      total: '{total}',
      
      // Variables anciennes pour compatibilité (à supprimer plus tard)
      nomProgrammateur: contact?.nom || 'Non spécifié',
      prenomProgrammateur: contact?.prenom || '',
      adresseProgrammateur: contact?.adresse || 'Non spécifiée',
      emailProgrammateur: contact?.email || 'Non spécifié',
      telephoneProgrammateur: contact?.telephone || 'Non spécifié',
      structureProgrammateur: programmateur?.structure || 'Non spécifiée',
      nomLieu: lieu?.nom || 'Non spécifié',
      adresseLieu: lieu?.adresse || 'Non spécifiée',
      capaciteLieu: lieu?.capacite || 'Non spécifiée',
      villeLieu: lieu?.ville || 'Non spécifiée',
      codePostalLieu: lieu?.codePostal || 'Non spécifié',
      nomArtiste: artiste?.nom || 'Non spécifié',
      genreArtiste: artiste?.genre || 'Non spécifié',
      contactArtiste: artiste?.contact || 'Non spécifié',
      titreDate: date?.titre || 'Non spécifié',
      dateDate: (() => {
        if (!date?.date) return 'Non spécifiée';
        
        // Gérer différents formats de date possibles
        let dateObj;
        
        // Si c'est un timestamp Firestore
        if (date.date.seconds) {
          dateObj = new Date(date.date.seconds * 1000);
        } 
        // Si c'est une string de date
        else if (typeof date.date === 'string') {
          dateObj = new Date(date.date);
        }
        // Si c'est déjà un objet Date
        else if (date.date instanceof Date) {
          dateObj = date.date;
        }
        // Si c'est un timestamp numérique
        else if (typeof date.date === 'number') {
          dateObj = new Date(date.date);
        } else {
          return 'Non spécifiée';
        }
        
        // Vérifier que la date est valide
        if (isNaN(dateObj.getTime())) {
          return 'Non spécifiée';
        }
        
        return dateObj.toLocaleDateString('fr-FR');
      })(),
      heureDate: date?.heure || 'Non spécifiée',
      montantDate: date?.montant 
        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(date.montant)
        : 'Non spécifié',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structureData, programmateur, artiste, lieu, date, entrepriseInfo, contratData]);
  
  // Fonction pour sauvegarder le contrat généré
  const saveGeneratedContract = async (url) => {
    try {
      console.log("Début de saveGeneratedContract avec URL:", url);
      setGeneratingPdf(true);
      
      const variables = prepareContractVariables();
      console.log("Variables préparées:", variables);
      
      // Fonction utilitaire pour nettoyer les valeurs undefined
      const cleanFirestoreData = (obj) => {
        const cleaned = {};
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          if (value !== undefined) {
            cleaned[key] = value === '' ? null : value;
          }
        });
        return cleaned;
      };

      // Créer une "snapshot" complète du template utilisé
      const templateSnapshotRaw = {
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
        type: selectedTemplate.templateType || selectedTemplate.type || 'Standard'
      };

      // Nettoyer les valeurs undefined pour Firestore
      const templateSnapshot = cleanFirestoreData(templateSnapshotRaw);
      
      console.log("Snapshot du template créée:", templateSnapshot);
      
      // Vérifier si un contrat existe déjà
      if (contratId) {
        console.log("Mise à jour du contrat existant:", contratId);
        const contratRef = doc(db, 'contrats', contratId);
        await updateDoc(contratRef, {
          pdfUrl: url,
          templateId: selectedTemplateId,
          templateSnapshot,
          type: selectedTemplate.templateType || selectedTemplate.type || 'Standard',
          dateGeneration: serverTimestamp(),
          variables
        });
        console.log("Contrat mis à jour avec succès");
        
        
        return contratId;
      } else {
        console.log("Création d'un nouveau contrat pour la date:", date.id);
        const contratData = {
          dateId: date.id,
          templateId: selectedTemplateId,
          templateSnapshot,
          type: selectedTemplate.templateType || selectedTemplate.type || 'Standard',
          dateGeneration: serverTimestamp(),
          dateEnvoi: null,
          status: 'generated',
          pdfUrl: url,
          variables,
          ...(currentEntreprise?.id && { entrepriseId: currentEntreprise.id })
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
      
      // S'assurer que le message d'erreur est une chaîne
      const errorMsg = error?.message || error?.toString() || 'Erreur inconnue lors de la sauvegarde';
      setErrorMessage(`Erreur lors de la sauvegarde du contrat: ${errorMsg}`);
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
    structureData, // Ajout de structureData pour qu'il soit accessible
    
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