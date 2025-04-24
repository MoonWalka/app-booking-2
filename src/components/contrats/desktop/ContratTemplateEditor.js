// components/contrats/desktop/ContratTemplateEditor.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ContratVariable from '@/components/contrats/ContratVariable';
import '@/styles/index.css';

const ContratTemplateEditorContent = ({ template, onSave, isModalContext, onClose }) => {
  console.log("============ CONTRAT TEMPLATE EDITOR CONTENT CHARGÉ ============");
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
  
  // Référence pour les éditeurs quill
  const bodyEditorRef = useRef();
  const headerEditorRef = useRef();
  const footerEditorRef = useRef();

  // Module personnalisé pour les sauts de page
  const PageBreak = () => {
    const Quill = ReactQuill.Quill;
    const BlockEmbed = Quill.import('blots/block/embed');

    class PageBreakBlot extends BlockEmbed {
      static create(value) {
        const node = super.create();
        node.setAttribute('class', 'page-break');
        return node;
      }
    }

    PageBreakBlot.blotName = 'pageBreak';
    PageBreakBlot.tagName = 'hr'; // Utilise une balise HR pour représenter visuellement

    Quill.register(PageBreakBlot);
    
    // Ajouter le style CSS pour les sauts de page
    useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        .page-break {
          display: block;
          width: 100%;
          margin: 10px 0;
          border: none;
          height: 5px;
          background: repeating-linear-gradient(
            to right,
            #ccc,
            #ccc 5px,
            transparent 5px,
            transparent 10px
          );
          position: relative;
        }
        .page-break::after {
          content: "SAUT DE PAGE";
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0 10px;
          font-size: 10px;
          color: #666;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }, []);

    return null;
  };

  // Appeler le composant PageBreak
  PageBreak();

  // Créer un module personnalisé pour Quill avec gestion des encadrés uniquement
  useEffect(() => {
    // Créer le bouton et l'icône d'encadrés
    const createCustomButtons = () => {
      // S'assurer que nous ne créons les boutons qu'une seule fois
      if (document.querySelector('.ql-box')) return;
      
      // Trouver la barre d'outils de chaque éditeur Quill
      document.querySelectorAll('.ql-toolbar').forEach(toolbar => {
        // Vérifier si la barre d'outils a déjà le bouton
        if (toolbar.querySelector('.ql-box')) return;
        
        // Trouver le groupe de boutons où ajouter notre bouton (avant 'clean')
        const cleanButton = toolbar.querySelector('.ql-clean');
        if (cleanButton && cleanButton.parentNode) {
          // Créer le bouton d'encadré
          const boxButton = document.createElement('button');
          boxButton.className = 'ql-box';
          boxButton.type = 'button';
          boxButton.title = 'Insérer un encadré';
          
          // Créer le dropdown pour les styles d'encadrés
          const boxDropdown = document.createElement('div');
          boxDropdown.className = 'box-style-dropdown';
          
          // Ajouter les options d'encadrés
          boxDropdown.innerHTML = `
            <div class="box-style-item" data-style="standard" data-type="inline">
              <div class="box-style-color standard"></div>
              Encadré standard (sélection)
            </div>
            <div class="box-style-item" data-style="standard-line" data-type="block">
              <div class="box-style-color standard-line"></div>
              Encadré standard (ligne complète)
            </div>
            <div class="box-style-item" data-style="success" data-type="inline">
              <div class="box-style-color success"></div>
              Information (vert)
            </div>
            <div class="box-style-item" data-style="danger" data-type="inline">
              <div class="box-style-color danger"></div>
              Danger (rouge)
            </div>
            <div class="box-style-options" id="block-box-options" style="display:none;">
              <div class="box-style-option">
                <input type="checkbox" id="box-centered" />
                <label for="box-centered">Centrer le texte</label>
              </div>
            </div>
          `;
          
          // Insérer le bouton avant le bouton clean
          cleanButton.parentNode.insertBefore(boxButton, cleanButton);
          
          // Ajouter le dropdown au body
          document.body.appendChild(boxDropdown);
          
          // Ajouter l'écouteur d'événement pour ouvrir/fermer le dropdown des encadrés
          boxButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Positionner le dropdown par rapport au bouton
            const rect = boxButton.getBoundingClientRect();
            boxDropdown.style.top = `${rect.bottom + window.scrollY}px`;
            boxDropdown.style.left = `${rect.left + window.scrollX}px`;
            
            // Afficher/masquer le dropdown
            boxDropdown.classList.toggle('show');
          });
          
          // Gérer les clics sur les options du dropdown
          boxDropdown.querySelectorAll('.box-style-item').forEach(item => {
            item.addEventListener('click', () => {
              const style = item.getAttribute('data-style');
              const type = item.getAttribute('data-type');
              
              // Trouver l'éditeur Quill associé
              const editorContainer = toolbar.closest('.quill');
              if (!editorContainer) return;
              
              // Déterminer quel éditeur utiliser
              let editor;
              if (editorContainer.classList.contains('body-editor')) {
                editor = bodyEditorRef.current?.getEditor();
              } else if (editorContainer.classList.contains('header-editor')) {
                editor = headerEditorRef.current?.getEditor();
              } else if (editorContainer.classList.contains('footer-editor')) {
                editor = footerEditorRef.current?.getEditor();
              }
              
              if (editor) {
                const range = editor.getSelection(true);
                
                // Afficher/masquer les options supplémentaires pour les encadrés en bloc
                const blockOptions = document.getElementById('block-box-options');
                if (type === 'block') {
                  blockOptions.style.display = 'block';
                  
                  // Obtenir l'état du checkbox
                  const isCentered = document.getElementById('box-centered').checked;
                  
                  // Créer un encadré en bloc
                  editor.insertEmbed(range.index, 'customBox', {
                    style: style,
                    centered: isCentered,
                    content: '<p>Votre texte ici</p>'
                  }, 'user');
                  
                  // Mettre le focus dans le contenu de l'encadré
                  setTimeout(() => {
                    const boxContent = editorContainer.querySelector('.box-content');
                    if (boxContent) {
                      boxContent.focus();
                      // Sélectionner tout le contenu
                      const selection = window.getSelection();
                      const range = document.createRange();
                      range.selectNodeContents(boxContent);
                      selection.removeAllRanges();
                      selection.addRange(range);
                    }
                  }, 10);
                } else {
                  blockOptions.style.display = 'none';
                  
                  // Appliquer un encadré en ligne au texte sélectionné
                  if (range.length > 0) {
                    editor.formatText(range.index, range.length, 'inlineBox', { style: style }, 'user');
                  } else {
                    // Si aucun texte n'est sélectionné, insérer un espace avec le format
                    editor.insertText(range.index, ' ', { 'inlineBox': { style: style } }, 'user');
                    editor.setSelection(range.index + 1, 0);
                  }
                }
                
                // Fermer le dropdown
                boxDropdown.classList.remove('show');
              }
            });
          });
          
          // Fermer le dropdown au clic à l'extérieur
          document.addEventListener('click', (e) => {
            if (!boxButton.contains(e.target) && !boxDropdown.contains(e.target)) {
              boxDropdown.classList.remove('show');
            }
          });
        }
      });
    };
    
    // Observer les changements dans le DOM pour détecter quand les éditeurs sont chargés
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          // Vérifier si les éditeurs sont prêts
          if (document.querySelector('.ql-toolbar')) {
            createCustomButtons();
          }
        }
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Essayer de créer les boutons immédiatement si les éditeurs sont déjà chargés
    setTimeout(createCustomButtons, 500);
    
    return () => {
      observer.disconnect();
      // Supprimer le dropdown lors du démontage du composant
      const dropdown = document.querySelector('.box-style-dropdown');
      if (dropdown) {
        dropdown.remove();
      }
    };
  }, []);

  // Ajout d'un style pour les menus déroulants
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .variables-dropdown {
        position: absolute;
        z-index: 1000;
        display: block;
        min-width: 10rem;
        margin: 0.125rem 0 0;
        color: #212529;
        text-align: left;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 0.25rem;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .variables-dropdown .dropdown-item {
        display: block;
        width: 100%;
        padding: 0.25rem 1.5rem;
        clear: both;
        font-weight: 400;
        color: #212529;
        text-align: inherit;
        white-space: nowrap;
        background-color: transparent;
        border: 0;
        cursor: pointer;
      }
      
      .variables-dropdown .dropdown-item:hover,
      .variables-dropdown .dropdown-item:focus {
        color: #16181b;
        text-decoration: none;
        background-color: #f8f9fa;
      }
      
      .variables-dropdown .dropdown-header {
        display: block;
        padding: 0.5rem 1.5rem;
        margin-bottom: 0;
        font-size: 0.875rem;
        color: #6c757d;
        white-space: nowrap;
      }
      
      .variables-dropdown .dropdown-divider {
        height: 0;
        margin: 0.5rem 0;
        overflow: hidden;
        border-top: 1px solid #e9ecef;
      }
      
      .variables-button-container {
        position: relative;
      }
      
      /* Masquer les boutons de saut de page dans la barre d'outils */
      .ql-pagebreak {
        display: none !important;
      }
      
      /* Style pour le bouton d'encadré */
      .ql-box {
        position: relative;
        display: inline-block;
        width: 18px;
        height: 18px;
      }
      
      .ql-box:before {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        right: 3px;
        bottom: 3px;
        border: 1px solid #444;
        border-radius: 2px;
      }
      
      /* Centrer le contenu dans le bouton d'alignement */
      .ql-align {
        text-align: center !important;
      }
      
      /* Style pour le dropdown des encadrés */
      .box-style-dropdown {
        display: none;
        position: absolute;
        z-index: 1001;
        background: white;
        border: 1px solid #ddd;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        border-radius: 4px;
        padding: 8px 0;
        min-width: 180px;
      }
      
      .box-style-dropdown.show {
        display: block;
      }
      
      .box-style-item {
        padding: 6px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        font-size: 14px;
      }
      
      .box-style-item:hover {
        background-color: #f5f5f5;
      }
      
      .box-style-color {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        border-radius: 2px;
        border: 1px solid #ddd;
      }
      
      .box-style-color.standard {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
      }
      
      .box-style-color.standard-line {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
      }
      
      .box-style-color.success {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
      }
      
      .box-style-color.danger {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Ajout d'un style pour la fenêtre modale avec en-tête et pied de page fixes
  useEffect(() => {
    if (!isModalContext) return;
    
    const style = document.createElement('style');
    style.innerHTML = `
      .modal-fixed-header {
        position: sticky;
        top: 0;
        background-color: white;
        z-index: 10;
        margin: -1px -1px 0 -1px; /* Pour éviter les espaces */
        border-bottom: 1px solid #eee;
      }
      
      .modal-fixed-footer {
        position: sticky;
        bottom: 0;
        background-color: white;
        z-index: 10;
        margin: 0 -1px -1px -1px; /* Pour éviter les espaces */
        border-top: 1px solid #eee;
        box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .modal-scrollable-content {
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
      }
      
      /* Pour s'assurer que le contenu ne passe pas sous le pied de page */
      .template-editor-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: 100%;
        overflow: hidden;
      }
      
      /* Pour que le contenu principal prenne l'espace disponible et soit défilable */
      .modal-body {
        flex: 1;
        overflow: auto;
        padding: 0 !important;
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

  // Fonction pour insérer une variable dans un éditeur spécifique
  const handleInsertVariable = (variable, targetEditor) => {
    let editor;
    
    switch (targetEditor) {
      case 'header':
        editor = headerEditorRef.current?.getEditor();
        setHeaderVarsOpen(false);
        break;
      case 'footer':
        editor = footerEditorRef.current?.getEditor();
        setFooterVarsOpen(false);
        break;
      case 'signature':
        setSignatureVarsOpen(false);
        // Pour le champ signature (textarea)
        const textArea = document.querySelector('textarea[value="' + signatureTemplate + '"]');
        if (textArea) {
          const start = textArea.selectionStart;
          const end = textArea.selectionEnd;
          const newValue = signatureTemplate.substring(0, start) + 
                          `{${variable}}` + 
                          signatureTemplate.substring(end);
          setSignatureTemplate(newValue);
          // Remettre le focus et la position du curseur
          setTimeout(() => {
            textArea.focus();
            textArea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
          }, 50);
          return;
        }
        break;
      case 'body':
      default:
        editor = bodyEditorRef.current?.getEditor();
        setBodyVarsOpen(false);
    }
    
    if (editor) {
      const range = editor.getSelection(true);
      if (range) {
        editor.insertText(range.index, `{${variable}}`, 'user');
      } else {
        const length = editor.getLength();
        editor.insertText(length - 1, `{${variable}}`, 'user');
      }
    }
  };

  // Version améliorée du menu déroulant des variables
  const VariablesDropdown = ({ isOpen, targetEditor, variables }) => {
    if (!isOpen) return null;
    
    return (
      <div className="variables-dropdown" style={{ 
        position: 'absolute', 
        top: '100%', 
        right: '0',
        zIndex: 1000
      }}>
        {variables.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {group.header && <h6 className="dropdown-header">{group.header}</h6>}
            {group.items.map((item, itemIndex) => (
              <button 
                key={itemIndex}
                className="dropdown-item" 
                onClick={() => handleInsertVariable(item.value, targetEditor)}
              >
                {item.label || item.value}
              </button>
            ))}
            {groupIndex < variables.length - 1 && <div className="dropdown-divider"></div>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Définition des variables disponibles
  const bodyVariables = [
    {
      header: "Programmateur",
      items: [
        { value: "programmateur_nom" },
        { value: "programmateur_structure" }, 
        { value: "programmateur_email" },
        { value: "programmateur_siret" }
      ]
    },
    {
      header: "Artiste",
      items: [
        { value: "artiste_nom" },
        { value: "artiste_genre" }
      ]
    },
    {
      header: "Concert",
      items: [
        { value: "concert_titre" },
        { value: "concert_date" },
        { value: "concert_montant" }
      ]
    },
    {
      header: "Lieu",
      items: [
        { value: "lieu_nom" },
        { value: "lieu_adresse" },
        { value: "lieu_code_postal" },
        { value: "lieu_ville" },
        { value: "lieu_capacite" }
      ]
    },
    {
      header: "Date",
      items: [
        { value: "date_jour" },
        { value: "date_mois" },
        { value: "date_annee" },
        { value: "date_complete" }
      ]
    }
  ];

  const headerFooterVariables = [
    {
      items: [
        { value: "programmateur_nom" },
        { value: "programmateur_structure" },
        { value: "programmateur_email" },
        { value: "programmateur_siret" },
        { value: "artiste_nom" }
      ]
    }
  ];

  const signatureVariables = [
    {
      items: [
        { value: "programmateur_nom" },
        { value: "programmateur_structure" },
        { value: "artiste_nom" },
        { value: "lieu_ville" },
        { value: "date_jour" },
        { value: "date_mois" },
        { value: "date_annee" },
        { value: "date_complete" }
      ]
    }
  ];

  // Définition des types de modèles pour le select
  const templateTypes = [
    { value: 'session', label: 'Session standard' },
    { value: 'co-realisation', label: 'Co-réalisation' },
    { value: 'dates-multiples', label: 'Dates multiples' },
    { value: 'residence', label: 'Résidence artistique' },
    { value: 'atelier', label: 'Atelier / Workshop' }
  ];
  
  // Configuration des modules pour les éditeurs ReactQuill
  const editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'clean']
    ]
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
      .replace(/<hr\s+class=["|']page-break["|'][^>]*>/gi, 
        '<div class="page-break"></div>');
    
    content += processedBodyContent;
    
    // Simuler la zone de signature
    content += `
      <div style="display: flex; justify-content: space-between; margin-top: 30px;">
        <div style="width: 45%;">
          <div style="margin-bottom: 50px;"><strong>Pour l'Organisateur:</strong></div>
          <div>Jean Dupont</div>
          <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
        </div>
        <div style="width: 45%;">
          <div style="margin-bottom: 50px;"><strong>Pour l'Artiste:</strong></div>
          <div>Les Rockeurs du Dimanche</div>
          <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
        </div>
      </div>
    `;
    
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
            <li>Cliquez sur le menu "Variables" pour voir celles disponibles</li>
            <li>Sélectionnez une variable pour l'insérer à l'endroit du curseur</li>
            <li>Par exemple, {'{programmateur_nom}'} sera remplacé par le nom du programmateur</li>
          </ul>
        </div>
        
        <div className="guide-section">
          <h4>4. Gestion des sauts de page</h4>
          <p>Pour éviter qu'un article soit coupé entre deux pages :</p>
          <ul>
            <li>Utilisez le bouton <strong>Saut de page</strong> pour forcer un changement de page</li>
            <li>Placez les sauts de page entre vos articles ou sections principales</li>
            <li>Vérifiez le rendu dans l'aperçu avant de finaliser votre modèle</li>
            <li>Pour les articles courts, regroupez-les sur une même page</li>
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

  return (
    <div className="template-editor-container">
      {!isModalContext ? (
        <div className="editor-header">
          <div className="breadcrumb-container">
            <span className="breadcrumb-item" onClick={() => navigate('/parametres/contrats')}>Modèles de contrats</span>
            <i className="bi bi-chevron-right"></i>
            <span className="breadcrumb-item active">{template?.id ? name : 'Nouveau modèle'}</span>
          </div>
          <h2 className="editor-title">{template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}</h2>
          
          <div className="editor-actions">
            <button 
              className="btn btn-outline-info" 
              onClick={() => setShowGuide(!showGuide)}
            >
              <i className="bi bi-question-circle me-2"></i>
              {showGuide ? 'Masquer l\'aide' : 'Aide'}
            </button>
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
      ) : (
        <div className="modal-fixed-header">
          <div 
            className="modal-header" 
            style={{
              padding: '15px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ margin: 0 }}>
              {template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-sm btn-outline-info" 
                onClick={() => setShowGuide(!showGuide)}
              >
                <i className="bi bi-question-circle me-1"></i>
                {showGuide ? 'Masquer l\'aide' : 'Aide'}
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Corps principal */}
      <div className={isModalContext ? "modal-body" : ""}>
        {/* Contenu défilable */}
        <div className={isModalContext ? "modal-scrollable-content" : ""}>
          {/* Guide d'utilisation */}
          {showGuide && <UserGuide />}
          
          <div className="editor-content">
            {previewMode ? (
              <div className="template-preview">
                <div className="preview-header">
                  <h3>Aperçu du contrat</h3>
                  <small className="text-muted">Avec des données fictives d'exemple</small>
                </div>
                <div 
                  className="preview-content" 
                  dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                />
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
                
                {/* Titre du document - Avec gestion du collapse */}
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
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label>Contenu du contrat</label>
                        <div className="d-flex">
                          <button 
                            className="btn btn-sm btn-outline-secondary me-2" 
                            type="button"
                            onClick={() => {
                              const editor = bodyEditorRef.current?.getEditor();
                              if (editor) {
                                const range = editor.getSelection(true);
                                editor.insertEmbed(range.index, 'pageBreak', true, 'user');
                                editor.setSelection(range.index + 1, 0);
                              }
                            }}
                            title="Insérer un saut de page"
                          >
                            <i className="bi bi-file-break"></i>
                            Saut de page
                          </button>
                          <div className="variables-button-container" ref={bodyVarsRef}>
                            <button 
                              className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                              type="button"
                              onClick={() => setBodyVarsOpen(!bodyVarsOpen)}
                            >
                              <i className="bi bi-code-square me-1"></i>
                              Variables
                            </button>
                            <VariablesDropdown 
                              isOpen={bodyVarsOpen} 
                              targetEditor="body" 
                              variables={bodyVariables} 
                            />
                          </div>
                        </div>
                      </div>
                      <ReactQuill
                        ref={bodyEditorRef}
                        theme="snow"
                        value={bodyContent}
                        onChange={setBodyContent}
                        modules={editorModules}
                        style={{ height: '400px', marginBottom: '50px' }}
                        className="body-editor"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Zone de signature - Avec gestion du collapse */}
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
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label>Format de la zone de signature</label>
                          <div className="variables-button-container" ref={signatureVarsRef}>
                            <button 
                              className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                              type="button"
                              onClick={() => setSignatureVarsOpen(!signatureVarsOpen)}
                            >
                              <i className="bi bi-code-square me-1"></i>
                              Variables
                            </button>
                            <VariablesDropdown 
                              isOpen={signatureVarsOpen} 
                              targetEditor="signature" 
                              variables={signatureVariables} 
                            />
                          </div>
                        </div>
                        <p className="text-muted mb-2">
                          Vous pouvez inclure la date et le lieu de signature directement dans cette zone.
                        </p>
                        <textarea
                          className="form-control"
                          rows="6"
                          value={signatureTemplate}
                          onChange={(e) => setSignatureTemplate(e.target.value)}
                          style={{ fontFamily: 'monospace' }}
                        />
                        <small className="text-muted">
                          Format HTML pour définir l'apparence de la zone de signature.
                        </small>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* En-tête du contrat - Avec gestion du collapse - Déplacé entre zone de signature et pied de page */}
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
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label>Contenu de l'en-tête</label>
                          <div className="variables-button-container" ref={headerVarsRef}>
                            <button 
                              className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                              type="button"
                              onClick={() => setHeaderVarsOpen(!headerVarsOpen)}
                            >
                              <i className="bi bi-code-square me-1"></i>
                              Variables
                            </button>
                            <VariablesDropdown 
                              isOpen={headerVarsOpen} 
                              targetEditor="header" 
                              variables={headerFooterVariables} 
                            />
                          </div>
                        </div>
                        <ReactQuill
                          ref={headerEditorRef}
                          theme="snow"
                          value={headerContent}
                          onChange={setHeaderContent}
                          modules={editorModules}
                          style={{ height: '150px', marginBottom: '50px' }}
                          className="header-editor"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Pied de page du contrat - Avec gestion du collapse */}
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
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label>Contenu du pied de page</label>
                          <div className="variables-button-container" ref={footerVarsRef}>
                            <button 
                              className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                              type="button"
                              onClick={() => setFooterVarsOpen(!footerVarsOpen)}
                            >
                              <i className="bi bi-code-square me-1"></i>
                              Variables
                            </button>
                            <VariablesDropdown 
                              isOpen={footerVarsOpen} 
                              targetEditor="footer" 
                              variables={headerFooterVariables} 
                            />
                          </div>
                        </div>
                        <ReactQuill
                          ref={footerEditorRef}
                          theme="snow"
                          value={footerContent}
                          onChange={setFooterContent}
                          modules={editorModules}
                          style={{ height: '150px', marginBottom: '50px' }}
                          className="footer-editor"
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
        <div className="modal-fixed-footer">
          <div 
            className="modal-footer" 
            style={{
              padding: '15px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
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

export default ContratTemplateEditorContent;
