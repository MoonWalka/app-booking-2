// hooks/contrats/useContratTemplateEditor.js
import { useState, useEffect, useRef } from 'react';

/**
 * Hook personnalisé pour gérer l'état et la logique de l'éditeur de modèles de contrat
 * 
 * @param {Object} template - Le modèle de contrat à éditer, ou null pour un nouveau modèle
 * @param {Function} onSave - Fonction de rappel pour enregistrer le modèle
 * @param {boolean} isModalContext - Indique si l'éditeur est affiché dans une modale
 * @param {Function} onClose - Fonction de rappel pour fermer la modale (si applicable)
 * @param {Function} navigate - Fonction pour la navigation (react-router-dom)
 * 
 * @returns {Object} État et fonctions pour l'éditeur de modèles
 */
const useContratTemplateEditor = (template, onSave, isModalContext, onClose, navigate) => {
  // Fonction utilitaire pour transformer les variables en format complet
  const createVariablesMap = (variables) => {
    const labelsMap = {
      "programmateur_nom": "Nom du programmateur",
      "programmateur_structure": "Structure du programmateur", 
      "programmateur_email": "Email du programmateur",
      "programmateur_siret": "SIRET du programmateur",
      "artiste_nom": "Nom de l'artiste",
      "artiste_genre": "Genre musical",
      "concert_titre": "Titre du concert",
      "concert_date": "Date du concert",
      "concert_montant": "Montant du contrat",
      "lieu_nom": "Nom du lieu",
      "lieu_adresse": "Adresse du lieu",
      "lieu_code_postal": "Code postal",
      "lieu_ville": "Ville",
      "lieu_capacite": "Capacité du lieu",
      "date_jour": "Jour (format numérique)",
      "date_mois": "Mois (format texte)",
      "date_annee": "Année",
      "date_complete": "Date complète"
    };
    
    return variables.map(variable => ({
      value: variable,
      label: labelsMap[variable] || variable
    }));
  };

  // Définition des variables disponibles
  const bodyVariablesRaw = [
    "programmateur_nom", "programmateur_structure", "programmateur_email", "programmateur_siret",
    "artiste_nom", "artiste_genre",
    "concert_titre", "concert_date", "concert_montant",
    "lieu_nom", "lieu_adresse", "lieu_code_postal", "lieu_ville", "lieu_capacite",
    "date_jour", "date_mois", "date_annee", "date_complete"
  ];

  const headerFooterVariablesRaw = [
    "programmateur_nom", "programmateur_structure", "programmateur_email", "programmateur_siret", "artiste_nom"
  ];

  const signatureVariablesRaw = [
    "programmateur_nom", "programmateur_structure", "artiste_nom", "lieu_ville",
    "date_jour", "date_mois", "date_annee", "date_complete"
  ];

  // Variables formatées pour les nouveaux composants
  const bodyVariables = createVariablesMap(bodyVariablesRaw);
  const headerFooterVariables = createVariablesMap(headerFooterVariablesRaw);
  const signatureVariables = createVariablesMap(signatureVariablesRaw);

  // Définition des types de modèles pour le select
  const templateTypes = [
    { value: 'session', label: 'Session standard' },
    { value: 'co-realisation', label: 'Co-réalisation' },
    { value: 'dates-multiples', label: 'Dates multiples' },
    { value: 'residence', label: 'Résidence artistique' },
    { value: 'atelier', label: 'Atelier / Workshop' }
  ];
  
  // États pour le modèle
  const [name, setName] = useState(template?.name || 'Nouveau modèle');
  const [isDefault, setIsDefault] = useState(template?.isDefault || false);
  const [templateType, setTemplateType] = useState(template?.type || 'session');
  const [previewMode, setPreviewMode] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  // États pour gérer le collapse des sections
  const [titleCollapsed, setTitleCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [footerCollapsed, setFooterCollapsed] = useState(false);
  const [signatureCollapsed, setSignatureCollapsed] = useState(false);
  
  // États pour les menus dropdown des variables
  const [headerVarsOpen, setHeaderVarsOpen] = useState(false);
  const [bodyVarsOpen, setBodyVarsOpen] = useState(false);
  const [footerVarsOpen, setFooterVarsOpen] = useState(false);
  const [signatureVarsOpen, setSignatureVarsOpen] = useState(false);
  
  // Référence pour fermer les dropdowns au clic à l'extérieur
  const headerVarsRef = useRef(null);
  const bodyVarsRef = useRef(null);
  const footerVarsRef = useRef(null);
  const signatureVarsRef = useRef(null);
  
  // États pour le contenu du contrat
  const [bodyContent, setBodyContent] = useState(template?.bodyContent || '');
  const [headerContent, setHeaderContent] = useState(template?.headerContent || '');
  const [headerHeight, setHeaderHeight] = useState(template?.headerHeight || 20);
  const [headerBottomMargin, setHeaderBottomMargin] = useState(template?.headerBottomMargin || 10);
  const [footerContent, setFooterContent] = useState(template?.footerContent || '');
  const [footerHeight, setFooterHeight] = useState(template?.footerHeight || 15);
  const [footerTopMargin, setFooterTopMargin] = useState(template?.footerTopMargin || 10);
  const [logoUrl, setLogoUrl] = useState(template?.logoUrl || '');
  
  // Nouveaux états pour les éléments hardcodés
  const [titleTemplate, setTitleTemplate] = useState(template?.titleTemplate || 'Contrat - {concert_titre}');
  const [signatureTemplate, setSignatureTemplate] = useState(template?.signatureTemplate || 
    `<div style="display: flex; justify-content: space-between; margin-top: 30px;">
      <div style="width: 45%;">
        <div style="margin-bottom: 50px;"><strong>Pour l'Organisateur:</strong></div>
        <div>{programmateur_nom}</div>
        <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
      </div>
      <div style="width: 45%;">
        <div style="margin-bottom: 50px;"><strong>Pour l'Artiste:</strong></div>
        <div>{artiste_nom}</div>
        <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
      </div>
    </div>`
  );
  
  // Synchroniser les états locaux quand le template change
  useEffect(() => {
    if (template) {
      console.log("🔄 Synchronisation des états avec le template:", template);
      setName(template.name || 'Nouveau modèle');
      setIsDefault(template.isDefault || false);
      setTemplateType(template.type || 'session');
      setBodyContent(template.bodyContent || '');
      setHeaderContent(template.headerContent || '');
      setHeaderHeight(template.headerHeight || 20);
      setHeaderBottomMargin(template.headerBottomMargin || 10);
      setFooterContent(template.footerContent || '');
      setFooterHeight(template.footerHeight || 15);
      setFooterTopMargin(template.footerTopMargin || 10);
      setLogoUrl(template.logoUrl || '');
      setTitleTemplate(template.titleTemplate || 'Contrat - {concert_titre}');
      setSignatureTemplate(template.signatureTemplate || 
        `<div style="display: flex; justify-content: space-between; margin-top: 30px;">
          <div style="width: 45%;">
            <div style="margin-bottom: 50px;"><strong>Pour l'Organisateur:</strong></div>
            <div>{programmateur_nom}</div>
            <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
          </div>
          <div style="width: 45%;">
            <div style="margin-bottom: 50px;"><strong>Pour l'Artiste:</strong></div>
            <div>{artiste_nom}</div>
            <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
          </div>
        </div>`
      );
    }
  }, [template]);

  // Gestion du clic à l'extérieur pour fermer les dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerVarsRef.current && !headerVarsRef.current.contains(event.target)) {
        setHeaderVarsOpen(false);
      }
      if (bodyVarsRef.current && !bodyVarsRef.current.contains(event.target)) {
        setBodyVarsOpen(false);
      }
      if (footerVarsRef.current && !footerVarsRef.current.contains(event.target)) {
        setFooterVarsOpen(false);
      }
      if (signatureVarsRef.current && !signatureVarsRef.current.contains(event.target)) {
        setSignatureVarsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fonction pour insérer une variable dans ReactQuill
  const insertVariable = (variable, targetId) => {
    // Chercher le conteneur ReactQuill par ID
    const container = document.getElementById(targetId);
    if (!container) {
      console.warn(`Élément avec ID ${targetId} non trouvé`);
      return;
    }

    // Chercher l'éditeur Quill dans le conteneur ou ses enfants
    let quillEditor = null;
    
    // Vérifier si l'élément est directement un éditeur Quill
    if (container.classList.contains('ql-editor')) {
      quillEditor = container;
    } else {
      // Chercher l'éditeur Quill dans les enfants
      quillEditor = container.querySelector('.ql-editor');
    }

    if (quillEditor) {
      // Insertion directe dans ReactQuill
      const variableText = `{${variable}}`;
      
      // Obtenir la position actuelle du curseur ou ajouter à la fin
      const selection = window.getSelection();
      let range;
      
      if (selection.rangeCount > 0 && quillEditor.contains(selection.focusNode)) {
        // Il y a une sélection dans l'éditeur
        range = selection.getRangeAt(0);
      } else {
        // Pas de sélection, créer une range à la fin du contenu
        range = document.createRange();
        range.selectNodeContents(quillEditor);
        range.collapse(false); // false = fin du contenu
      }
      
      // Insérer la variable
      range.deleteContents();
      const textNode = document.createTextNode(variableText);
      range.insertNode(textNode);
      
      // Placer le curseur après la variable insérée
      range.setStartAfter(textNode);
      range.collapse(true);
      
      // Mettre à jour la sélection
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Focus sur l'éditeur
      quillEditor.focus();
      
      // Déclencher les événements pour que ReactQuill détecte le changement
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      quillEditor.dispatchEvent(inputEvent);
      
      console.log(`Variable {${variable}} insérée dans ${targetId}`);
      return;
    }

    // Fallback : Si ce n'est pas ReactQuill, essayer la méthode directe via les setters
    const variableText = `{${variable}}`;
    switch (targetId) {
      case 'bodyContent':
        setBodyContent(prev => (prev || '') + variableText);
        break;
      case 'headerContent':
        setHeaderContent(prev => (prev || '') + variableText);
        break;
      case 'footerContent':
        setFooterContent(prev => (prev || '') + variableText);
        break;
      case 'titleTemplate':
        setTitleTemplate(prev => (prev || '') + variableText);
        break;
      case 'signatureTemplate':
        setSignatureTemplate(prev => (prev || '') + variableText);
        break;
      default:
        console.warn(`TargetId ${targetId} non reconnu pour l'insertion de variable`);
        break;
    }
    
    console.log(`Variable {${variable}} insérée via setter dans ${targetId}`);
  };

  // Fonction pour gérer l'ouverture/fermeture des menus variables
  const toggleVariablesMenu = (targetId) => {
    switch (targetId) {
      case 'headerContent':
        setHeaderVarsOpen(!headerVarsOpen);
        break;
      case 'bodyContent':
        setBodyVarsOpen(!bodyVarsOpen);
        break;
      case 'footerContent':
        setFooterVarsOpen(!footerVarsOpen);
        break;
      case 'signatureTemplate':
        setSignatureVarsOpen(!signatureVarsOpen);
        break;
      default:
        break;
    }
  };

  // Fonction pour uploader un logo
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Pour une implémentation réelle, vous auriez besoin d'uploader ce fichier vers Firebase Storage
      // et d'obtenir l'URL de téléchargement
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour supprimer le logo
  const handleRemoveLogo = () => {
    setLogoUrl('');
  };

  // Fonction pour gérer l'annulation adaptée au contexte (modal ou page complète)
  const handleCancel = () => {
    if (isModalContext && onClose) {
      onClose();
    } else {
      navigate('/parametres/contrats');
    }
  };
  
  // Fonction pour basculer l'état du collapse d'une section
  const toggleCollapse = (section) => {
    switch(section) {
      case 'title':
        setTitleCollapsed(!titleCollapsed);
        break;
      case 'header':
        setHeaderCollapsed(!headerCollapsed);
        break;
      case 'footer':
        setFooterCollapsed(!footerCollapsed);
        break;
      case 'signature':
        setSignatureCollapsed(!signatureCollapsed);
        break;
      default:
        break;
    }
  };

  // Fonction pour enregistrer le modèle
  const handleSave = () => {
    if (!name.trim()) {
      alert('Veuillez donner un nom à votre modèle.');
      return;
    }
    
    // Préparer les données dans le nouveau format
    const modelData = {
      ...(template && template.id ? { id: template.id } : {}),
      name,
      type: templateType,
      isDefault,
      bodyContent,
      headerContent,
      headerHeight,
      headerBottomMargin,
      footerContent,
      footerHeight,
      footerTopMargin,
      logoUrl,
      titleTemplate,
      signatureTemplate
    };
    
    console.log("Sauvegarde du modèle avec les données:", modelData);
    onSave(modelData);
  };

  // Fonction pour estimer approximativement la quantité de pages nécessaires
  const countEstimatedPages = (content, hasTitle = true, hasSignature = true) => {
    if (!content) return 1;
    
    // Compter les sauts de page explicites
    const explicitBreaks = (content.match(/\[SAUT_DE_PAGE\]/g) || []).length;
    
    // Si des sauts de page sont définis, on utilise ce nombre + 1
    if (explicitBreaks > 0) {
      return explicitBreaks + 1;
    }
    
    // Estimation très approximative basée sur le nombre de caractères
    // Une page A4 standard contient environ 3000 caractères (avec marges et taille de police standard)
    const contentLength = content.length;
    
    // Tenir compte de l'espace pris par le titre et la signature
    let totalLength = contentLength;
    if (hasTitle) totalLength += 200; // Espace approximatif du titre
    if (hasSignature) totalLength += 500; // Espace approximatif de la signature
    
    const estimatedPages = Math.max(1, Math.ceil(totalLength / 3000));
    
    return estimatedPages;
  };

  // Configuration des modules pour les éditeurs ReactQuill
  const editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'clean']
    ]
  };

  // Retourner tous les états et fonctions nécessaires pour le composant
  return {
    // États
    name,
    setName,
    isDefault,
    setIsDefault,
    templateType,
    setTemplateType,
    previewMode,
    setPreviewMode,
    showGuide,
    setShowGuide,
    
    // États des sections repliables
    titleCollapsed,
    headerCollapsed,
    footerCollapsed,
    signatureCollapsed,
    
    // États des menus dropdown
    headerVarsOpen,
    bodyVarsOpen,
    footerVarsOpen,
    signatureVarsOpen,
    
    // Références pour les menus dropdown
    headerVarsRef,
    bodyVarsRef,
    footerVarsRef,
    signatureVarsRef,
    
    // États du contenu du contrat
    bodyContent,
    setBodyContent,
    headerContent,
    setHeaderContent,
    headerHeight,
    setHeaderHeight,
    headerBottomMargin,
    setHeaderBottomMargin,
    footerContent,
    setFooterContent,
    footerHeight,
    setFooterHeight,
    footerTopMargin,
    setFooterTopMargin,
    logoUrl,
    
    // États pour les éléments spécifiques
    titleTemplate,
    setTitleTemplate,
    signatureTemplate,
    setSignatureTemplate,
    
    // Constantes
    bodyVariables,
    headerFooterVariables,
    signatureVariables,
    templateTypes,
    
    // Fonctions
    insertVariable,
    toggleVariablesMenu,
    handleLogoUpload,
    handleRemoveLogo,
    handleCancel,
    toggleCollapse,
    handleSave,
    countEstimatedPages,
    
    // Configuration
    editorModules
  };
};

export default useContratTemplateEditor;