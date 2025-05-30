// hooks/contrats/useContratTemplateEditor.js
import { useState, useEffect, useMemo } from 'react';
// Import pour le module saut de page Quill
import '@/components/contrats/QuillPageBreakModule';
// Importer les variables depuis la source de vérité
import { 
  bodyVariables as bodyVariablesSource, 
  headerFooterVariables as headerFooterVariablesSource, 
  signatureVariables as signatureVariablesSource,
  templateTypes as templateTypesSource // Importer aussi les types de template
} from './contractVariables'; 

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
      // Programmateur
      "programmateur_nom": "Nom du contact (Programmateur)",
      "programmateur_structure": "Structure (Programmateur)", 
      "programmateur_email": "Email (Programmateur)",
      "programmateur_siret": "SIRET (Programmateur)",
      "programmateur_numero_intracommunautaire": "N° TVA Intracom. (Programmateur)",
      "programmateur_adresse": "Adresse (Programmateur)",
      "programmateur_representant": "Représentant Légal (Programmateur)",
      "programmateur_qualite_representant": "Qualité du Représentant (Programmateur)",
      // Artiste
      "artiste_nom": "Nom de l'artiste",
      "artiste_genre": "Genre musical",
      // Concert
      "concert_titre": "Titre du concert/événement",
      "concert_date": "Date du concert",
      "concert_montant": "Montant du contrat (chiffres)",
      "concert_montant_lettres": "Montant du contrat (lettres)",
      // Lieu
      "lieu_nom": "Nom du lieu",
      "lieu_adresse": "Adresse du lieu",
      "lieu_code_postal": "Code postal (Lieu)",
      "lieu_ville": "Ville (Lieu)",
      "lieu_capacite": "Capacité du lieu",
      // Dates générales
      "date_jour": "Jour actuel (numérique)",
      "date_mois": "Mois actuel (texte)",
      "date_annee": "Année actuelle",
      "date_complete": "Date actuelle complète"
    };
    
    return variables.map(variable => ({
      value: variable,
      label: labelsMap[variable] || variable.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()) // Fallback label
    }));
  };

  // Utiliser les variables importées de la source de vérité
  const bodyVariables = useMemo(() => createVariablesMap(bodyVariablesSource), []);
  const headerFooterVariables = useMemo(() => createVariablesMap(headerFooterVariablesSource), []);
  const signatureVariables = useMemo(() => createVariablesMap(signatureVariablesSource), []);

  // Utiliser les types de template importés
  const templateTypes = useMemo(() => templateTypesSource, []);
  
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
  const [titleTemplate, setTitleTemplate] = useState(template?.titleTemplate || 'Contrat - [concert_titre]');
  const [signatureTemplate, setSignatureTemplate] = useState(template?.signatureTemplate || 
    `<div style="display: flex; justify-content: space-between; margin-top: 30px;">
      <div style="width: 45%;">
        <div style="margin-bottom: 50px;"><strong>Pour l'Organisateur:</strong></div>
        <div>[programmateur_nom]</div>
        <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
      </div>
      <div style="width: 45%;">
        <div style="margin-bottom: 50px;"><strong>Pour l'Artiste:</strong></div>
        <div>[artiste_nom]</div>
        <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
      </div>
    </div>`
  );
  
  // Synchroniser les états locaux quand le template change
  useEffect(() => {
    if (template && template.id) {
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
      setTitleTemplate(template.titleTemplate || 'Contrat - [concert_titre]');
      setSignatureTemplate(template.signatureTemplate || 
        `<div style="display: flex; justify-content: space-between; margin-top: 30px;">
          <div style="width: 45%;">
            <div style="margin-bottom: 50px;"><strong>Pour l'Organisateur:</strong></div>
            <div>[programmateur_nom]</div>
            <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
          </div>
          <div style="width: 45%;">
            <div style="margin-bottom: 50px;"><strong>Pour l'Artiste:</strong></div>
            <div>[artiste_nom]</div>
            <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
          </div>
        </div>`
      );
    }
  }, [template]);

  // Fonction pour insérer une variable dans ReactQuill
  const insertVariable = (variable, targetId) => {
    const container = document.getElementById(targetId);
    if (!container) {
      console.warn(`Élément avec ID ${targetId} non trouvé`);
      return;
    }

    let quillEditor = null;
    if (container.classList.contains('ql-editor')) {
      quillEditor = container;
    } else {
      quillEditor = container.querySelector('.ql-editor');
    }

    if (quillEditor) {
      const variableText = `[${variable}]`;
      const selection = window.getSelection();
      let range;
      if (selection.rangeCount > 0 && quillEditor.contains(selection.focusNode)) {
        range = selection.getRangeAt(0);
      } else {
        range = document.createRange();
        range.selectNodeContents(quillEditor);
        range.collapse(false);
      }
      range.deleteContents();
      const textNode = document.createTextNode(variableText);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      quillEditor.focus();
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      quillEditor.dispatchEvent(inputEvent);
      console.log(`Variable [${variable}] insérée dans ${targetId}`);
      return;
    }

    const variableText = `[${variable}]`;
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
    console.log(`Variable [${variable}] insérée via setter dans ${targetId}`);
  };

  // Fonction pour uploader un logo
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
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

  const countEstimatedPages = (content, hasTitle = true, hasSignature = true) => {
    if (!content) return 1;
    const explicitBreaks = (content.match(/\[SAUT_DE_PAGE\]/g) || []).length;
    if (explicitBreaks > 0) {
      return explicitBreaks + 1;
    }
    const contentLength = content.length;
    let totalLength = contentLength;
    if (hasTitle) totalLength += 200;
    if (hasSignature) totalLength += 500;
    const estimatedPages = Math.max(1, Math.ceil(totalLength / 3000));
    return estimatedPages;
  };

  const editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['pagebreak'],
      ['link', 'clean']
    ],
    handlers: {
      'pagebreak': function() {
        const range = this.quill.getSelection(true);
        const position = range ? range.index : this.quill.getLength();
        this.quill.insertEmbed(position, 'pagebreak', true);
        this.quill.setSelection(position + 1);
      }
    }
  };

  return {
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
    titleCollapsed,
    headerCollapsed,
    footerCollapsed,
    signatureCollapsed,
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
    titleTemplate,
    setTitleTemplate,
    signatureTemplate,
    setSignatureTemplate,
    bodyVariables,
    headerFooterVariables,
    signatureVariables,
    templateTypes,
    insertVariable,
    handleLogoUpload,
    handleRemoveLogo,
    handleCancel,
    toggleCollapse,
    handleSave,
    countEstimatedPages,
    editorModules
  };
};

export default useContratTemplateEditor;