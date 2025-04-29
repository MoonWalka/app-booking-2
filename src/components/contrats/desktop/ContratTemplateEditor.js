// components/contrats/desktop/ContratTemplateEditor.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ContratVariable from '@/components/contrats/ContratVariable';
import ContratPDFWrapper from '@/components/contrats/ContratPDFWrapper.js';
import '@/styles/index.css';
// Import de la feuille de style spécifique pour l'impression des contrats
import '@/styles/components/contrat-print.css';
// Import des styles dédiés à l'éditeur de modèle de contrat
import '@/styles/components/contrat-editor.css';

const ContratTemplateEditor = ({ template, onSave, isModalContext, onClose }) => {
  console.log("============ CONTRAT TEMPLATE EDITOR CHARGÉ ============");
  console.log("Template reçu:", template);
  console.log("Est en contexte modal:", isModalContext);
  
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
  
  // Style CSS pour la modale
  useEffect(() => {
    if (!isModalContext) return;
    
    const style = document.createElement('style');
    style.innerHTML = `
      .tc-modal-fixed-header {
        position: sticky;
        top: 0;
        background-color: white;
        z-index: 1000;
        margin: -1px -1px 0 -1px;
        border-bottom: 1px solid #eee;
      }
      
      .tc-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
      }
      
      .tc-modal-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .tc-modal-close {
        background: transparent;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: #6c757d;
      }
      
      .tc-modal-close:hover {
        color: #dc3545;
      }
      
      .tc-modal-fixed-footer {
        position: sticky;
        bottom: 0;
        background-color: white;
        z-index: 1000;
        margin: 0 -1px -1px -1px;
        border-top: 1px solid #eee;
        box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .tc-modal-scrollable-content {
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
      }
      
      .template-editor-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: 100%;
        overflow: hidden;
      }
      
      .tc-modal-body {
        flex: 1;
        overflow: auto;
        padding: 0;
      }
      
      .content-textarea {
        width: 100%;
        min-height: 300px;
        padding: 10px;
        font-family: Arial, sans-serif;
        border: 1px solid #ccc;
        border-radius: 4px;
        line-height: 1.5;
      }
      
      .header-textarea, .footer-textarea {
        width: 100%;
        min-height: 100px;
        padding: 10px;
        font-family: Arial, sans-serif;
        border: 1px solid #ccc;
        border-radius: 4px;
        line-height: 1.5;
      }
      
      .variable-badge {
        display: inline-block;
        padding: 2px 5px;
        margin: 2px;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 3px;
        font-size: 12px;
        cursor: pointer;
      }
      
      .variables-guide {
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 10px;
      }
      
      .variables-guide h6 {
        margin-top: 0;
        margin-bottom: 5px;
      }
      
      .variables-badge-container {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      
      /* Style pour l'aperçu */
      .preview-container {
        border: 1px solid #ddd;
        background-color: white;
        border-radius: 4px;
        margin-bottom: 20px;
        width: 100%;
        min-height: 500px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      
      .preview-header {
        background-color: #f8f9fa;
        padding: 10px 15px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .preview-content {
        padding: 20px;
        min-height: 500px;
      }
      
      .a4-preview {
        width: 100%;
        max-width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        background: white;
        padding: 20mm;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isModalContext]);

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

  // Fonction pour insérer une variable dans un textarea
  const insertVariable = (variable, targetId) => {
    const textarea = document.getElementById(targetId);
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    let newValue;
    switch (targetId) {
      case 'bodyContent':
        newValue = bodyContent.substring(0, start) + `{${variable}}` + bodyContent.substring(end);
        setBodyContent(newValue);
        setBodyVarsOpen(false);
        break;
      case 'headerContent':
        newValue = headerContent.substring(0, start) + `{${variable}}` + headerContent.substring(end);
        setHeaderContent(newValue);
        setHeaderVarsOpen(false);
        break;
      case 'footerContent':
        newValue = footerContent.substring(0, start) + `{${variable}}` + footerContent.substring(end);
        setFooterContent(newValue);
        setFooterVarsOpen(false);
        break;
      case 'signatureTemplate':
        newValue = signatureTemplate.substring(0, start) + `{${variable}}` + signatureTemplate.substring(end);
        setSignatureTemplate(newValue);
        setSignatureVarsOpen(false);
        break;
      default:
        break;
    }
    
    // Remettre le focus et la position du curseur
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
    }, 50);
  };

  // Composant pour afficher les variables disponibles pour chaque section
  const VariablesDropdown = ({ isOpen, variables, targetId, buttonRef }) => (
    <div ref={buttonRef} className="dropdown-container" style={{ position: 'relative', marginBottom: '10px' }}>
      <button
        className="btn btn-outline-secondary"
        type="button"
        onClick={() => {
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
        }}
      >
        <i className="bi bi-braces me-1"></i>
        Insérer une variable
      </button>
      
      {isOpen && (
        <div 
          className="variables-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 1000,
            width: '280px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            padding: '10px',
            marginTop: '5px'
          }}
        >
          <h6 className="mb-2">Variables disponibles</h6>
          <div className="variables-badge-container">
            {variables.map((variable, index) => (
              <span 
                key={index} 
                className="variable-badge"
                style={{
                  cursor: 'pointer',
                  display: 'inline-block',
                  padding: '3px 8px',
                  margin: '2px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  fontSize: '0.85rem'
                }}
                onClick={() => insertVariable(variable, targetId)}
              >
                {`{${variable}}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Définition des variables disponibles
  const bodyVariables = [
    "programmateur_nom", "programmateur_structure", "programmateur_email", "programmateur_siret",
    "artiste_nom", "artiste_genre",
    "concert_titre", "concert_date", "concert_montant",
    "lieu_nom", "lieu_adresse", "lieu_code_postal", "lieu_ville", "lieu_capacite",
    "date_jour", "date_mois", "date_annee", "date_complete"
  ];

  const headerFooterVariables = [
    "programmateur_nom", "programmateur_structure", "programmateur_email", "programmateur_siret", "artiste_nom"
  ];

  const signatureVariables = [
    "programmateur_nom", "programmateur_structure", "artiste_nom", "lieu_ville",
    "date_jour", "date_mois", "date_annee", "date_complete"
  ];

  // Définition des types de modèles pour le select
  const templateTypes = [
    { value: 'session', label: 'Session standard' },
    { value: 'co-realisation', label: 'Co-réalisation' },
    { value: 'dates-multiples', label: 'Dates multiples' },
    { value: 'residence', label: 'Résidence artistique' },
    { value: 'atelier', label: 'Atelier / Workshop' }
  ];

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

  // Ajout d'une fonction pour générer dynamiquement l'aperçu avec plusieurs pages
  const generateMultiPagePreview = () => {
    // Nombre total de pages (au minimum 1)
    const totalPages = Math.max(1, countEstimatedPages(bodyContent));
    
    // Séparation du contenu en pages
    const contentByPage = bodyContent.split('[SAUT_DE_PAGE]');
    
    // Préparation des pages
    let pageElements = '';
    
    // Génération de chaque page
    for (let i = 0; i < totalPages; i++) {
      const isLastPage = i === totalPages - 1;
      const pageContent = contentByPage[i] || '';
      
      pageElements += `
        <div class="page">
          <div class="page-content">
            <div class="header">
              ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo" /></div>` : ''}
              ${headerContent.replace(/{programmateur_nom}/g, 'Jean Dupont')
                .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
                .replace(/{programmateur_siret}/g, '123 456 789 00012')}
            </div>
            
            ${i === 0 ? `
              <h1 style="text-align: center; margin-bottom: 20px;">
                ${titleTemplate.replace(/{concert_titre}/g, 'Concert de printemps')
                  .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')}
              </h1>
            ` : ''}
            
            <div>
              ${pageContent.replace(/{programmateur_nom}/g, 'Jean Dupont')
                .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
                .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
                .replace(/{artiste_genre}/g, 'Rock Alternatif')
                .replace(/{concert_titre}/g, 'Concert de printemps')
                .replace(/{concert_date}/g, '15/05/2025')
                .replace(/{concert_montant}/g, '800')
                .replace(/{lieu_nom}/g, 'Salle des fêtes')
                .replace(/{lieu_adresse}/g, '123 rue Principale')
                .replace(/{lieu_code_postal}/g, '75001')
                .replace(/{lieu_ville}/g, 'Paris')
                .replace(/{lieu_capacite}/g, '200')
                .replace(/{date_jour}/g, '30')
                .replace(/{date_mois}/g, '04')
                .replace(/{date_annee}/g, '2025')}
            </div>
            
            ${isLastPage ? `
              <div>
                ${signatureTemplate.replace(/{programmateur_nom}/g, 'Jean Dupont')
                  .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                  .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
                  .replace(/{lieu_ville}/g, 'Paris')
                  .replace(/{date_jour}/g, '30')
                  .replace(/{date_mois}/g, '04')
                  .replace(/{date_annee}/g, '2025')}
              </div>
            ` : ''}
            
            <div class="footer">
              ${footerContent.replace(/{programmateur_nom}/g, 'Jean Dupont')
                .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
                .replace(/{programmateur_siret}/g, '123 456 789 00012')}
            </div>
            
            <div class="page-number">${i + 1} / ${totalPages}</div>
          </div>
        </div>
      `;
    }
    
    return pageElements;
  };

  // Générer un aperçu avec des données fictives
  const getPreviewContent = () => {
    let content = `
      <style>
        .preview-container {
          font-family: Arial, sans-serif;
          font-size: 11px;
          position: relative;
        }
        .header {
          height: ${headerHeight}mm;
          margin-bottom: ${headerBottomMargin}mm;
          position: relative;
          border-bottom: 1px solid #eee;
        }
        .content {
          min-height: calc(100% - ${headerHeight}mm - ${footerHeight}mm - ${headerBottomMargin}mm - ${footerTopMargin}mm);
        }
        .footer {
          height: ${footerHeight}mm;
          margin-top: ${footerTopMargin}mm;
          position: relative;
          border-top: 1px solid #eee;
        }
        .logo-container {
          position: absolute;
          top: 0;
          left: 0;
          max-height: ${headerHeight}mm;
          max-width: 30%;
        }
        .logo-container img {
          max-height: 100%;
          max-width: 100%;
        }
        /* Style pour les sauts de page dans l'aperçu */
        .page-break {
          display: block;
          width: 100%;
          margin: 20px 0;
          padding: 10px 0;
          border-top: 2px dashed #999;
          border-bottom: 2px dashed #999;
          text-align: center;
          background-color: #f8f9fa;
        }
        .page-break::before {
          content: "⁂ SAUT DE PAGE ⁂";
          font-size: 12px;
          color: #666;
        }
      </style>
      <div class="preview-container">
    `;
    
    // Ajouter l'en-tête
    content += `<div class="header">`;
    if (logoUrl) {
      content += `
        <div class="logo-container">
          <img src="${logoUrl}" alt="Logo" />
        </div>
      `;
    }
    
    // Contenu de l'en-tête avec les variables remplacées
    let processedHeaderContent = headerContent
      .replace(/{programmateur_nom}/g, 'Jean Dupont')
      .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
      .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
      .replace(/{programmateur_siret}/g, '123 456 789 00012');
    
    content += processedHeaderContent;
    content += `</div>`;
    
    // Ajouter le corps
    content += `<div class="content">`;
    
    // Contenu principal avec les variables remplacées
    let processedBodyContent = bodyContent
      .replace(/{programmateur_nom}/g, 'Jean Dupont')
      .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
      .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
      .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
      .replace(/{artiste_genre}/g, 'Rock Alternatif')
      .replace(/{concert_titre}/g, 'Concert de printemps')
      .replace(/{concert_date}/g, '15/05/2025')
      .replace(/{concert_montant}/g, '800')
      .replace(/{lieu_nom}/g, 'Salle des fêtes')
      .replace(/{lieu_adresse}/g, '123 rue Principale')
      .replace(/{lieu_code_postal}/g, '75001')
      .replace(/{lieu_ville}/g, 'Paris')
      .replace(/{lieu_capacite}/g, '200')
      .replace(/{date_jour}/g, new Date().getDate().toString())
      .replace(/{date_mois}/g, (new Date().getMonth() + 1).toString())
      .replace(/{date_annee}/g, new Date().getFullYear().toString())
      // Remplacer les sauts de page par des visualisations
      .replace(/\[SAUT_DE_PAGE\]/g, '<div class="page-break"></div>');
    
    content += processedBodyContent;
    
    // Simuler la zone de signature
    let processedSignatureTemplate = signatureTemplate
      .replace(/{programmateur_nom}/g, 'Jean Dupont')
      .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
      .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
      .replace(/{lieu_ville}/g, 'Paris')
      .replace(/{date_jour}/g, new Date().getDate().toString())
      .replace(/{date_mois}/g, (new Date().getMonth() + 1).toString())
      .replace(/{date_annee}/g, new Date().getFullYear().toString());
    
    content += processedSignatureTemplate;
    content += `</div>`;
    
    // Ajouter le pied de page
    content += `<div class="footer">`;
    
    // Contenu du pied de page avec les variables remplacées
    let processedFooterContent = footerContent
      .replace(/{programmateur_nom}/g, 'Jean Dupont')
      .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
      .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
      .replace(/{programmateur_siret}/g, '123 456 789 00012');
    
    content += processedFooterContent;
    content += `</div>`;
    
    content += '</div>'; // Fermer .preview-container
    
    return content;
  };

  // Composant pour le guide d'utilisation avec fermeture unifiée
  const UserGuide = () => (
    <div className="user-guide" style={{
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      padding: '20px',
      border: '1px solid #e9ecef'
    }}>
      <div className="guide-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: 0, color: '#344767', fontWeight: 600 }}>Mode d'emploi de l'éditeur de modèles de contrat</h3>
        <button 
          className="btn btn-sm btn-outline-secondary" 
          onClick={() => setShowGuide(false)}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      
      <div className="guide-content">
        <div className="guide-section">
          <h4>1. Structure du modèle</h4>
          <p>Votre modèle de contrat est divisé en trois parties principales :</p>
          <ul>
            <li><strong>En-tête</strong> : Apparaît en haut de chaque page</li>
            <li><strong>Corps</strong> : Contenu principal du contrat</li>
            <li><strong>Pied de page</strong> : Apparaît en bas de chaque page</li>
          </ul>
        </div>
        
        <div className="guide-section">
          <h4>2. Type de modèle</h4>
          <p>Choisissez le type qui correspond le mieux à votre contrat :</p>
          <ul>
            <li><strong>Session standard</strong> : Pour un concert unique</li>
            <li><strong>Co-réalisation</strong> : Partage des recettes</li>
            <li><strong>Dates multiples</strong> : Plusieurs représentations</li>
            <li><strong>Résidence artistique</strong> : Pour les résidences</li>
            <li><strong>Atelier / Workshop</strong> : Pour les activités pédagogiques</li>
          </ul>
        </div>
        
        <div className="guide-section">
          <h4>3. Utiliser les variables</h4>
          <p>Les variables sont remplacées par les vraies données lors de la génération du contrat :</p>
          <ul>
            <li>Cliquez sur une variable dans la liste pour l'insérer à l'endroit du curseur</li>
            <li>Les variables sont indiquées entre accolades, par exemple {'{programmateur_nom}'}</li>
            <li>Lors de la génération, {'{programmateur_nom}'} sera remplacé par le nom du programmateur</li>
          </ul>
        </div>
        
        <div className="guide-section">
          <h4>4. Gestion des sauts de page</h4>
          <p>Pour éviter qu'un article soit coupé entre deux pages :</p>
          <ul>
            <li>Insérez la balise <strong>[SAUT_DE_PAGE]</strong> là où vous voulez forcer un saut de page</li>
            <li>Placez les sauts de page entre vos articles ou sections principales</li>
            <li>Vérifiez le rendu dans l'aperçu avant de finaliser votre modèle</li>
          </ul>
          <p><strong>Astuce</strong> : Dans l'aperçu, les sauts de page sont représentés par une ligne pointillée.</p>
        </div>
      </div>
    </div>
  );

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

  // Configuration des modules pour les éditeurs ReactQuill
  const editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],  // Options de taille standards
      [{ 'color': [] }, { 'background': [] }],  // Ajout des options de couleur
      [{ 'align': [] }],
      ['link', 'clean']
    ]
  };

  // Ajout de CSS personnalisé pour les classes de taille
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .ql-size-small { font-size: 10px; }
      .ql-size-large { font-size: 18px; }
      .ql-size-huge { font-size: 32px; }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Références pour les éditeurs quill
  const bodyEditorRef = useRef();
  const headerEditorRef = useRef();
  const footerEditorRef = useRef();

  return (
    <div className="template-editor-container">
      {!isModalContext ? (
        <div className="editor-header">
          <div className="breadcrumb-container">
            <span 
              className="breadcrumb-item" 
              onClick={() => navigate('/parametres/contrats')} 
              role="button"
              tabIndex={0}
            >Modèles de contrats</span>
            <i className="bi bi-chevron-right"></i>
            <span className="breadcrumb-item active">{template?.id ? name : 'Nouveau modèle'}</span>
          </div>
          <h2 className="editor-title">{template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}</h2>
          
          <div className="editor-actions">
            <button 
              className="btn btn-outline-info d-flex align-items-center gap-2"
              onClick={() => setShowGuide(!showGuide)}
            >
              <i className="bi bi-question-circle me-1"></i>
              {showGuide ? 'Masquer l\'aide' : 'Aide'}
            </button>
            <button 
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={handleCancel}
            >
              <i className="bi bi-x-circle me-1"></i>
              Annuler
            </button>
            <button 
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <i className={`bi bi-${previewMode ? 'pencil' : 'eye'} me-1`}></i>
              {previewMode ? 'Éditer' : 'Aperçu'}
            </button>
            <button 
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleSave}
            >
              <i className="bi bi-check-circle me-1"></i>
              Enregistrer
            </button>
          </div>
        </div>
      ) : (
        <div className="tc-modal-fixed-header">
          <div className="modal-header tc-modal-header">
            <h3 className="tc-modal-title">
              {template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
            </h3>
            <div className="tc-modal-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="btn btn-sm btn-outline-info" 
                onClick={() => setShowGuide(!showGuide)}
                style={{ padding: '0.375rem 0.75rem' }}
              >
                <i className="bi bi-question-circle me-1"></i>
                {showGuide ? 'Masquer l\'aide' : 'Aide'}
              </button>
              <button 
                className="tc-modal-close" 
                onClick={handleCancel}
                style={{ fontSize: '20px', padding: '0.25rem' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Corps principal */}
      <div className={isModalContext ? "tc-modal-body" : ""}>
        {/* Contenu défilable */}
        <div className={isModalContext ? "tc-modal-scrollable-content" : ""}>
          {/* Guide d'utilisation */}
          {showGuide && <UserGuide />}
          
          <div className="editor-content">
            {previewMode ? (
              <div className="template-preview">
                <div className="preview-header">
                  <h3>Aperçu du contrat</h3>
                  <small className="text-muted">Avec des données fictives d'exemple</small>
                </div>
                <div className="preview-content">
                  <div className="multi-page-preview-wrapper">
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <meta charset="utf-8">
                          <title>Aperçu du contrat</title>
                          <style>
                            @page {
                              size: A4;
                              margin: 0;
                            }
                            body {
                              margin: 0;
                              padding: 0;
                              background-color: #f5f5f5;
                              font-family: Arial, sans-serif;
                            }
                            .contrat-preview {
                              margin: 0 auto;
                              width: 100%;
                              max-width: 800px;
                              padding: 20px;
                            }
                            .page {
                              width: 100%;
                              height: 267mm; /* Taille A4 moins marges */
                              box-sizing: border-box;
                              background-color: #fff;
                              box-shadow: 0 1px 4px rgba(0,0,0,0.2);
                              margin-bottom: 20px;
                              position: relative;
                              overflow: hidden;
                              page-break-after: always;
                            }
                            .page:last-child {
                              page-break-after: avoid;
                            }
                            .page-content {
                              padding: 20mm;
                              position: relative;
                              height: 100%;
                            }
                            .header {
                              border-bottom: 1px solid #eee;
                              margin-bottom: ${headerBottomMargin}mm;
                              height: ${headerHeight}mm;
                              position: relative;
                            }
                            .footer {
                              border-top: 1px solid #eee;
                              margin-top: ${footerTopMargin}mm;
                              height: ${footerHeight}mm;
                              position: relative;
                            }
                            .logo-container {
                              position: absolute;
                              top: 0;
                              left: 0;
                              max-height: ${headerHeight}mm;
                              max-width: 30%;
                            }
                            .logo-container img {
                              max-height: 100%;
                              max-width: 100%;
                            }
                            .page-number {
                              position: absolute;
                              bottom: 5mm;
                              text-align: center;
                              width: 100%;
                              font-size: 10px;
                              color: #666;
                            }
                          </style>
                          <script>
                            // Cette fonction s'exécute au chargement de la page
                            window.onload = function() {
                              // Récupérer tous les éléments de page
                              const pages = document.querySelectorAll('.page');
                              const totalPages = pages.length;
                              
                              // Mettre à jour tous les numéros de page
                              pages.forEach((page, index) => {
                                const pageNumber = page.querySelector('.page-number');
                                if (pageNumber) {
                                  pageNumber.textContent = (index + 1) + ' / ' + totalPages;
                                }
                              });
                            }
                          </script>
                        </head>
                        <body>
                          <div class="contrat-preview">
                            ${(() => {
                              // Déterminer le nombre de pages nécessaires
                              let pageCount = 1;
                              const explicitBreaks = (bodyContent.match(/\[SAUT_DE_PAGE\]/g) || []).length;
                              if (explicitBreaks > 0) {
                                pageCount = explicitBreaks + 1;
                                
                                // Diviser le contenu par les sauts de page
                                const contentByPage = bodyContent.split('[SAUT_DE_PAGE]');
                                
                                // Générer le HTML pour chaque page
                                return contentByPage.map((pageContent, index) => {
                                  const isFirstPage = index === 0;
                                  const isLastPage = index === contentByPage.length - 1;
                                  
                                  return `
                                    <div class="page">
                                      <div class="page-content">
                                        <div class="header">
                                          ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo" /></div>` : ''}
                                          ${headerContent
                                            .replace(/{programmateur_nom}/g, 'Jean Dupont')
                                            .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                                            .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
                                            .replace(/{programmateur_siret}/g, '123 456 789 00012')}
                                        </div>
                                        
                                        ${isFirstPage ? `
                                          <h1 style="text-align: center; margin-bottom: 1.5em;">
                                            ${titleTemplate
                                              .replace(/{concert_titre}/g, 'Concert de printemps')
                                              .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')}
                                          </h1>
                                        ` : ''}
                                        
                                        <div>
                                          ${pageContent
                                            .replace(/{programmateur_nom}/g, 'Jean Dupont')
                                            .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                                            .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
                                            .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
                                            .replace(/{artiste_genre}/g, 'Rock Alternatif')
                                            .replace(/{concert_titre}/g, 'Concert de printemps')
                                            .replace(/{concert_date}/g, '15/05/2025')
                                            .replace(/{concert_montant}/g, '800')
                                            .replace(/{lieu_nom}/g, 'Salle des fêtes')
                                            .replace(/{lieu_adresse}/g, '123 rue Principale')
                                            .replace(/{lieu_code_postal}/g, '75001')
                                            .replace(/{lieu_ville}/g, 'Paris')
                                            .replace(/{lieu_capacite}/g, '200')
                                            .replace(/{date_jour}/g, '30')
                                            .replace(/{date_mois}/g, '04')
                                            .replace(/{date_annee}/g, '2025')}
                                        </div>
                                        
                                        ${isLastPage ? `
                                          <div class="signature-section">
                                            ${signatureTemplate
                                              .replace(/{programmateur_nom}/g, 'Jean Dupont')
                                              .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                                              .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
                                              .replace(/{lieu_ville}/g, 'Paris')
                                              .replace(/{date_jour}/g, '30')
                                              .replace(/{date_mois}/g, '04')
                                              .replace(/{date_annee}/g, '2025')}
                                          </div>
                                        ` : ''}
                                        
                                        <div class="footer">
                                          ${footerContent
                                            .replace(/{programmateur_nom}/g, 'Jean Dupont')
                                            .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                                            .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
                                            .replace(/{programmateur_siret}/g, '123 456 789 00012')}
                                        </div>
                                        
                                        <div class="page-number">${index + 1} / ${contentByPage.length}</div>
                                      </div>
                                    </div>
                                  `;
                                }).join('');
                              } else {
                                // Estimation du nombre de pages en l'absence de sauts de page explicites
                                const estimatedPages = countEstimatedPages(bodyContent);
                                
                                // Créer au moins une page, ou même plusieurs pages vides si nécessaire
                                let pagesHtml = '';
                                
                                for (let i = 0; i < estimatedPages; i++) {
                                  const isFirstPage = i === 0;
                                  const isLastPage = i === estimatedPages - 1;
                                  
                                  pagesHtml += `
                                    <div class="page">
                                      <div class="page-content">
                                        <div class="header">
                                          ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo" /></div>` : ''}
                                          ${headerContent
                                            .replace(/{programmateur_nom}/g, 'Jean Dupont')
                                            .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                                            .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
                                            .replace(/{programmateur_siret}/g, '123 456 789 00012')}
                                        </div>
                                        
                                        ${isFirstPage ? `
                                          <h1 style="text-align: center; margin-bottom: 1.5em;">
                                            ${titleTemplate
                                              .replace(/{concert_titre}/g, 'Concert de printemps')
                                              .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')}
                                          </h1>
                                          
                                          <div>
                                            ${bodyContent
                                              .replace(/{programmateur_nom}/g, 'Jean Dupont')
                                              .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                                              .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
                                              .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
                                              .replace(/{artiste_genre}/g, 'Rock Alternatif')
                                              .replace(/{concert_titre}/g, 'Concert de printemps')
                                              .replace(/{concert_date}/g, '15/05/2025')
                                              .replace(/{concert_montant}/g, '800')
                                              .replace(/{lieu_nom}/g, 'Salle des fêtes')
                                              .replace(/{lieu_adresse}/g, '123 rue Principale')
                                              .replace(/{lieu_code_postal}/g, '75001')
                                              .replace(/{lieu_ville}/g, 'Paris')
                                              .replace(/{lieu_capacite}/g, '200')
                                              .replace(/{date_jour}/g, '30')
                                              .replace(/{date_mois}/g, '04')
                                              .replace(/{date_annee}/g, '2025')}
                                          </div>
                                        ` : ''}
                                        
                                        ${isLastPage ? `
                                          <div class="signature-section">
                                            ${signatureTemplate
                                              .replace(/{programmateur_nom}/g, 'Jean Dupont')
                                              .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                                              .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
                                              .replace(/{lieu_ville}/g, 'Paris')
                                              .replace(/{date_jour}/g, '30')
                                              .replace(/{date_mois}/g, '04')
                                              .replace(/{date_annee}/g, '2025')}
                                          </div>
                                        ` : ''}
                                        
                                        <div class="footer">
                                          ${footerContent
                                            .replace(/{programmateur_nom}/g, 'Jean Dupont')
                                            .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
                                            .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
                                            .replace(/{programmateur_siret}/g, '123 456 789 00012')}
                                        </div>
                                        
                                        <div class="page-number">${i + 1} / ${estimatedPages}</div>
                                      </div>
                                    </div>
                                  `;
                                }
                                
                                return pagesHtml;
                              }
                            })()}
                          </div>
                        </body>
                        </html>
                      `}
                      title="Aperçu du contrat"
                      className="html-preview-frame"
                      style={{ 
                        width: '100%', 
                        minHeight: '700px',
                        border: 'none',
                        backgroundColor: 'transparent'
                      }}
                      scrolling="yes"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Informations générales */}
                <div className="template-info-card mb-4">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label htmlFor="templateName">Nom du modèle</label>
                        <input
                          type="text"
                          id="templateName"
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Contrat standard de prestation musicale"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label htmlFor="templateType">Type de modèle</label>
                        <select
                          id="templateType"
                          className="form-select"
                          value={templateType}
                          onChange={(e) => setTemplateType(e.target.value)}
                        >
                          {templateTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-check my-3">
                    <input
                      type="checkbox"
                      id="isDefault"
                      className="form-check-input"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="isDefault">
                      Utiliser comme modèle par défaut
                    </label>
                  </div>
                </div>
                
                {/* Titre du document */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title h5 mb-0">Titre du document</h3>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      onClick={() => toggleCollapse('title')}
                    >
                      <i className={`bi bi-chevron-${titleCollapsed ? 'up' : 'down'}`}></i>
                    </button>
                  </div>
                  {!titleCollapsed && (
                    <div className="card-body">
                      <div className="form-group">
                        <label htmlFor="titleTemplate">Format du titre</label>
                        <input
                          type="text"
                          id="titleTemplate"
                          className="form-control"
                          value={titleTemplate}
                          onChange={(e) => setTitleTemplate(e.target.value)}
                        />
                        <small className="text-muted">
                          Exemple: "Contrat - {'{concert_titre}'}" ou "Accord de {'{templateType}'} avec {'{artiste_nom}'}"
                        </small>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Corps du contrat */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="card-title h5 mb-0">Corps du contrat</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label>Contenu du contrat</label>
                      <VariablesDropdown isOpen={bodyVarsOpen} variables={bodyVariables} targetId="bodyContent" buttonRef={bodyVarsRef} />
                      <p className="text-muted mb-2">
                        Utilisez la syntaxe <strong>[SAUT_DE_PAGE]</strong> pour insérer un saut de page.
                      </p>
                      <ReactQuill 
                        ref={bodyEditorRef}
                        value={bodyContent}
                        onChange={setBodyContent}
                        modules={editorModules}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Zone de signature */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title h5 mb-0">Zone de signature</h3>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      onClick={() => toggleCollapse('signature')}
                    >
                      <i className={`bi bi-chevron-${signatureCollapsed ? 'up' : 'down'}`}></i>
                    </button>
                  </div>
                  {!signatureCollapsed && (
                    <div className="card-body">
                      <div className="form-group">
                        <label>Format de la zone de signature</label>
                        <VariablesDropdown isOpen={signatureVarsOpen} variables={signatureVariables} targetId="signatureTemplate" buttonRef={signatureVarsRef} />
                        <p className="text-muted mb-2">
                          Vous pouvez inclure la date et le lieu de signature directement dans cette zone.
                        </p>
                        <textarea
                          id="signatureTemplate"
                          className="content-textarea"
                          value={signatureTemplate}
                          onChange={(e) => setSignatureTemplate(e.target.value)}
                          rows={8}
                          style={{ fontFamily: 'monospace' }}
                        ></textarea>
                        <small className="text-muted">
                          Format HTML pour définir l'apparence de la zone de signature.
                        </small>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* En-tête du contrat */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title h5 mb-0">En-tête du contrat</h3>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      onClick={() => toggleCollapse('header')}
                    >
                      <i className={`bi bi-chevron-${headerCollapsed ? 'up' : 'down'}`}></i>
                    </button>
                  </div>
                  {!headerCollapsed && (
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="headerHeight">Hauteur de l'en-tête (mm)</label>
                            <input
                              type="number"
                              id="headerHeight"
                              className="form-control"
                              value={headerHeight}
                              onChange={(e) => setHeaderHeight(parseInt(e.target.value) || 0)}
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="headerBottomMargin">Marge basse de l'en-tête (mm)</label>
                            <input
                              type="number"
                              id="headerBottomMargin"
                              className="form-control"
                              value={headerBottomMargin}
                              onChange={(e) => setHeaderBottomMargin(parseInt(e.target.value) || 0)}
                              min="0"
                              max="50"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Logo upload */}
                      <div className="mb-3">
                        <label className="form-label">Logo</label>
                        <div className="d-flex align-items-center">
                          {logoUrl ? (
                            <div className="position-relative me-3">
                              <img 
                                src={logoUrl} 
                                alt="Logo" 
                                style={{ maxWidth: '100px', maxHeight: '60px' }} 
                                className="border rounded"
                              />
                              <button 
                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                onClick={handleRemoveLogo}
                                type="button"
                                style={{ transform: 'translate(50%, -50%)' }}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                          ) : (
                            <div 
                              className="border rounded d-flex align-items-center justify-content-center text-muted me-3"
                              style={{ width: '100px', height: '60px' }}
                            >
                              Pas de logo
                            </div>
                          )}
                          <div>
                            <label className="btn btn-outline-primary">
                              <i className="bi bi-upload me-1"></i>
                              Charger un logo
                              <input 
                                type="file" 
                                hidden 
                                accept="image/*" 
                                onChange={handleLogoUpload}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenu de l'en-tête */}
                      <div className="form-group">
                        <label>Contenu de l'en-tête</label>
                        <VariablesDropdown isOpen={headerVarsOpen} variables={headerFooterVariables} targetId="headerContent" buttonRef={headerVarsRef} />
                        <ReactQuill 
                          ref={headerEditorRef}
                          value={headerContent}
                          onChange={setHeaderContent}
                          modules={editorModules}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Pied de page du contrat */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title h5 mb-0">Pied de page du contrat</h3>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      onClick={() => toggleCollapse('footer')}
                    >
                      <i className={`bi bi-chevron-${footerCollapsed ? 'up' : 'down'}`}></i>
                    </button>
                  </div>
                  {!footerCollapsed && (
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="footerHeight">Hauteur du pied de page (mm)</label>
                            <input
                              type="number"
                              id="footerHeight"
                              className="form-control"
                              value={footerHeight}
                              onChange={(e) => setFooterHeight(parseInt(e.target.value) || 0)}
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="footerTopMargin">Marge haute du pied de page (mm)</label>
                            <input
                              type="number"
                              id="footerTopMargin"
                              className="form-control"
                              value={footerTopMargin}
                              onChange={(e) => setFooterTopMargin(parseInt(e.target.value) || 0)}
                              min="0"
                              max="50"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenu du pied de page */}
                      <div className="form-group">
                        <label>Contenu du pied de page</label>
                        <VariablesDropdown isOpen={footerVarsOpen} variables={headerFooterVariables} targetId="footerContent" buttonRef={footerVarsRef} />
                        <ReactQuill 
                          ref={footerEditorRef}
                          value={footerContent}
                          onChange={setFooterContent}
                          modules={editorModules}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Pied de page en mode modal */}
      {isModalContext && (
        <div className={isModalContext ? "tc-modal-footer" : ""}>
          <div className="modal-footer tc-modal-footer">
            <button 
              className="btn btn-outline-secondary" 
              onClick={handleCancel}
            >
              <i className="bi bi-x-circle me-2"></i>Annuler
            </button>
            <button 
              className="btn btn-outline-primary" 
              onClick={() => setPreviewMode(!previewMode)}
            >
              <i className={`bi bi-${previewMode ? 'pencil' : 'eye'} me-2`}></i>
              {previewMode ? 'Éditer' : 'Aperçu'}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
            >
              <i className="bi bi-check-circle me-2"></i>Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratTemplateEditor;
