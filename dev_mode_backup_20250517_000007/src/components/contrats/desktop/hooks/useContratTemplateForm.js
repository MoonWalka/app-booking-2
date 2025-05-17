import { useState, useEffect, useRef } from 'react';

/**
 * Hook personnalisé pour gérer l'état du formulaire d'édition de modèle de contrat
 * @param {Object} initialData - Données initiales du modèle de contrat
 * @returns {Object} - État et méthodes pour manipuler le formulaire
 */
const useContratTemplateForm = (initialData = {}) => {
  // État général du modèle
  const [name, setName] = useState(initialData.name || '');
  const [type, setType] = useState(initialData.type || 'standard');
  const [description, setDescription] = useState(initialData.description || '');
  const [titleTemplate, setTitleTemplate] = useState(initialData.titleTemplate || '');
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl || '');

  // État pour l'en-tête
  const [headerContent, setHeaderContent] = useState(initialData.headerContent || '');
  const [headerHeight, setHeaderHeight] = useState(initialData.headerHeight || 25);
  const [headerBottomMargin, setHeaderBottomMargin] = useState(initialData.headerBottomMargin || 10);
  
  // État pour le corps du contrat
  const [bodyContent, setBodyContent] = useState(initialData.bodyContent || '');
  
  // État pour le pied de page
  const [footerContent, setFooterContent] = useState(initialData.footerContent || '');
  const [footerHeight, setFooterHeight] = useState(initialData.footerHeight || 20);
  const [footerTopMargin, setFooterTopMargin] = useState(initialData.footerTopMargin || 10);
  
  // État pour la section signature
  const [signatureTemplate, setSignatureTemplate] = useState(initialData.signatureTemplate || '');

  // État pour le contrôle des sections repliables
  const [collapsedSections, setCollapsedSections] = useState({
    info: false,
    title: false,
    header: false,
    footer: false,
    signature: false
  });

  // Méthode pour basculer l'état replié d'une section
  const toggleCollapse = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Méthode pour la gestion du téléchargement du logo
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Dans un environnement réel, on utiliserait un service de stockage de fichiers
    // Ici, nous utilisons un URL local temporaire pour la démonstration
    const fileUrl = URL.createObjectURL(file);
    setLogoUrl(fileUrl);
  };

  // Méthode pour supprimer le logo
  const handleRemoveLogo = () => {
    setLogoUrl('');
  };

  // Préparation des données pour la soumission
  const prepareFormData = () => {
    return {
      name,
      type,
      description,
      titleTemplate,
      logoUrl,
      headerContent,
      headerHeight,
      headerBottomMargin,
      bodyContent,
      footerContent,
      footerHeight,
      footerTopMargin,
      signatureTemplate,
      updatedAt: new Date()
    };
  };

  // Fonction de validation du formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) errors.name = "Le nom du modèle est requis";
    if (!type) errors.type = "Le type de modèle est requis";
    if (!bodyContent.trim()) errors.bodyContent = "Le contenu du contrat est requis";
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  return {
    // État du formulaire
    name, setName,
    type, setType,
    description, setDescription,
    titleTemplate, setTitleTemplate,
    logoUrl, setLogoUrl,
    headerContent, setHeaderContent,
    headerHeight, setHeaderHeight,
    headerBottomMargin, setHeaderBottomMargin,
    bodyContent, setBodyContent,
    footerContent, setFooterContent,
    footerHeight, setFooterHeight,
    footerTopMargin, setFooterTopMargin,
    signatureTemplate, setSignatureTemplate,
    
    // État des sections repliables
    collapsedSections,
    toggleCollapse,
    
    // Méthodes de gestion du logo
    handleLogoUpload,
    handleRemoveLogo,
    
    // Méthodes d'aide au formulaire
    prepareFormData,
    validateForm
  };
};

export default useContratTemplateForm;