import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer la logique principale de l'éditeur de modèle de contrat
 * 
 * @param {Object} initialTemplate - Le modèle de contrat initial
 * @param {Function} onSave - Fonction appelée lors de la sauvegarde
 */
const useTemplateEditor = (initialTemplate, onSave) => {
  // États pour les différentes sections du modèle de contrat
  const [title, setTitle] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [footerContent, setFooterContent] = useState('');
  const [signatureContent, setSignatureContent] = useState('');
  const [paperSize, setPaperSize] = useState('a4');
  const [margins, setMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 });
  const [isLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // État pour suivre les sections dépliées/repliées
  const [expandedSections, setExpandedSections] = useState({
    title: true,
    header: true,
    body: true,
    footer: true,
    signature: true,
    preview: false,
  });

  // Initialisation du modèle
  useEffect(() => {
    if (initialTemplate) {
      setTitle(initialTemplate.title || '');
      setHeaderContent(initialTemplate.header || '');
      setBodyContent(initialTemplate.body || '');
      setFooterContent(initialTemplate.footer || '');
      setSignatureContent(initialTemplate.signature || '');
      setPaperSize(initialTemplate.paperSize || 'a4');
      setMargins(initialTemplate.margins || { top: 20, right: 20, bottom: 20, left: 20 });
    }
  }, [initialTemplate]);

  // Fonction pour basculer l'état déplié/replié d'une section
  const toggleSection = useCallback((sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  }, []);

  // Fonction pour mettre à jour les marges
  const updateMargin = useCallback((direction, value) => {
    setMargins(prevMargins => ({
      ...prevMargins,
      [direction]: parseInt(value) || 0
    }));
  }, []);

  // Fonction pour sauvegarder le modèle
  const saveTemplate = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const templateData = {
        title,
        header: headerContent,
        body: bodyContent,
        footer: footerContent,
        signature: signatureContent,
        paperSize,
        margins,
        updatedAt: new Date()
      };
      
      await onSave(templateData);
      
      setIsSaveSuccess(true);
      setTimeout(() => setIsSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }, [title, headerContent, bodyContent, footerContent, signatureContent, paperSize, margins, onSave]);

  // Fonction pour obtenir un aperçu HTML
  const generatePreviewHtml = useCallback(() => {
    // Fonction pour remplacer les variables par des valeurs d'exemple
    const replaceVarsWithExamples = (text) => {
      if (!text) return '';
      
      // Exemples de valeurs pour les variables courantes
      const exampleValues = {
        artiste_nom: 'Les Fabuleux Troubadours',
        programmateur_nom: 'Jean Dupont',
        structure_nom: 'Salle de Concert Le Zénith',
        concert_date: '15/06/2025',
        concert_heure: '20h30',
        lieu_nom: 'Le Zénith',
        lieu_adresse: '12 avenue des Arts, 75000 Paris',
        montant_cache: '1500€',
        // Ajoutez d'autres variables au besoin
      };
      
      // Remplace toutes les variables {nom_variable} par leurs valeurs d'exemple
      return text.replace(/{([^{}]*)}/g, (match, varName) => {
        return exampleValues[varName] || `{${varName}}`;
      });
    };
    
    // Création du HTML pour l'aperçu
    return `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.5;
          }
          .page {
            box-sizing: border-box;
            padding: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
            width: 210mm; /* A4 width */
            min-height: 297mm; /* A4 height */
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin: 0 auto;
            overflow: hidden;
          }
          .title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .header {
            margin-bottom: 20px;
            font-size: 10pt;
          }
          .body {
            margin-bottom: 20px;
            font-size: 11pt;
          }
          .footer {
            margin-bottom: 30px;
            font-size: 10pt;
          }
          .signature {
            margin-top: 40px;
            font-size: 11pt;
          }
          pre {
            white-space: pre-wrap;
            margin: 0;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${title ? `<div class="title">${replaceVarsWithExamples(title)}</div>` : ''}
          
          ${headerContent ? `<div class="header"><pre>${replaceVarsWithExamples(headerContent)}</pre></div>` : ''}
          
          ${bodyContent ? `<div class="body"><pre>${replaceVarsWithExamples(bodyContent)}</pre></div>` : ''}
          
          ${footerContent ? `<div class="footer"><pre>${replaceVarsWithExamples(footerContent)}</pre></div>` : ''}
          
          ${signatureContent ? `<div class="signature"><pre>${replaceVarsWithExamples(signatureContent)}</pre></div>` : ''}
        </div>
      </body>
      </html>
    `;
  }, [title, headerContent, bodyContent, footerContent, signatureContent, margins]);

  return {
    // États
    title,
    headerContent,
    bodyContent,
    footerContent,
    signatureContent,
    paperSize,
    margins,
    expandedSections,
    isLoading,
    isSaving,
    isSaveSuccess,
    error,
    
    // Setters
    setTitle,
    setHeaderContent,
    setBodyContent,
    setFooterContent,
    setSignatureContent,
    setPaperSize,
    setMargins,
    
    // Méthodes
    toggleSection,
    updateMargin,
    saveTemplate,
    generatePreviewHtml
  };
};

export default useTemplateEditor;