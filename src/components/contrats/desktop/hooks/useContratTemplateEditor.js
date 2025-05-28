import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook personnalisé pour gérer l'état et la logique de l'éditeur de modèle de contrat
 */
export const useContratTemplateEditor = (template, onSave, isModalContext, onClose) => {
  const navigate = useNavigate();
  
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
  const [titleTemplate, setTitleTemplate] = useState(template?.titleTemplate || 'Contrat - {concert_titre}');
  const [signatureTemplate, setSignatureTemplate] = useState(template?.signatureTemplate || '');
  
  // Définition des types de modèles pour le select
  const templateTypes = [
    { value: 'session', label: 'Session standard' },
    { value: 'co-realisation', label: 'Co-réalisation' },
    { value: 'dates-multiples', label: 'Dates multiples' },
    { value: 'residence', label: 'Résidence artistique' },
    { value: 'atelier', label: 'Atelier / Workshop' }
  ];
  
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
      // Nouveaux champs pour les éléments précédemment hardcodés
      titleTemplate,
      signatureTemplate
    };
    
    console.log("Sauvegarde du modèle avec les données:", modelData);
    onSave(modelData);
  };
  
  // Synchronisation protégée des états locaux avec le template reçu
  useEffect(() => {
    console.log("🔁 Synchronisation des champs avec le template :", template);
    if (!template) return;
    if (typeof template.bodyContent !== 'undefined' && template.bodyContent !== bodyContent) setBodyContent(template.bodyContent);
    if (typeof template.headerContent !== 'undefined' && template.headerContent !== headerContent) setHeaderContent(template.headerContent);
    if (typeof template.headerHeight !== 'undefined' && template.headerHeight !== headerHeight) setHeaderHeight(template.headerHeight);
    if (typeof template.headerBottomMargin !== 'undefined' && template.headerBottomMargin !== headerBottomMargin) setHeaderBottomMargin(template.headerBottomMargin);
    if (typeof template.footerContent !== 'undefined' && template.footerContent !== footerContent) setFooterContent(template.footerContent);
    if (typeof template.footerHeight !== 'undefined' && template.footerHeight !== footerHeight) setFooterHeight(template.footerHeight);
    if (typeof template.footerTopMargin !== 'undefined' && template.footerTopMargin !== footerTopMargin) setFooterTopMargin(template.footerTopMargin);
    if (typeof template.logoUrl !== 'undefined' && template.logoUrl !== logoUrl) setLogoUrl(template.logoUrl);
    if (typeof template.titleTemplate !== 'undefined' && template.titleTemplate !== titleTemplate) setTitleTemplate(template.titleTemplate);
    if (typeof template.signatureTemplate !== 'undefined' && template.signatureTemplate !== signatureTemplate) setSignatureTemplate(template.signatureTemplate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);
  
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
    templateTypes,
    toggleCollapse,
    handleLogoUpload,
    handleRemoveLogo,
    handleCancel,
    handleSave
  };
};