// src/components/contrats/ContratTemplateEditorModal.js
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ContratVariable from '@/components/contrats/desktop/ContratVariable';
import '@/styles/index.css';

const ContratTemplateEditorModal = ({ 
  isOpen, 
  onClose, 
  template, 
  onSave 
}) => {
  console.log("============ MODALE CONTRAT TEMPLATE EDITOR CHARGÉE ============");
  console.log("Template reçu:", template);
  
  // États pour le modèle
  const [name, setName] = useState(template?.name || 'Nouveau modèle');
  const [isDefault, setIsDefault] = useState(template?.isDefault || false);
  const [templateType, setTemplateType] = useState(template?.type || 'session');
  const [previewMode, setPreviewMode] = useState(false);
  
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
  const [dateTemplate, setDateTemplate] = useState(template?.dateTemplate || 'Fait à {lieu_ville}, le {date_complete}');
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
  
  // Effet pour mettre à jour les états quand le template change
  useEffect(() => {
    if (template) {
      console.log("Mise à jour des états depuis le template:", template);
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
      setDateTemplate(template.dateTemplate || 'Fait à {lieu_ville}, le {date_complete}');
      setSignatureTemplate(template.signatureTemplate || `<div style="display: flex; justify-content: space-between; margin-top: 30px;">
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
      </div>`);
    }
  }, [template]);
  
  // Référence pour les éditeurs quill
  const bodyEditorRef = useRef();
  const headerEditorRef = useRef();
  const footerEditorRef = useRef();

  // Types de modèles disponibles
  const templateTypes = [
    { value: 'session', label: 'Session standard' },
    { value: 'co-realisation', label: 'Co-réalisation' },
    { value: 'date-multiple', label: 'Dates multiples' },
    { value: 'residency', label: 'Résidence artistique' },
    { value: 'workshop', label: 'Atelier / Workshop' },
    { value: 'custom', label: 'Personnalisé' }
  ];
  
  // Configuration de l'éditeur
  const editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  // Conversion depuis l'ancien format si besoin
  useEffect(() => {
    // Si le modèle utilise l'ancien format avec des sections
    if (template && template.sections && Array.isArray(template.sections) && !template.bodyContent) {
      // Convertir les sections en contenu principal
      const convertedContent = template.sections.map(section => 
        `<h3>${section.title}</h3>${section.content}`
      ).join('<br/>');
      
      setBodyContent(convertedContent);
    }
  }, [template]);

  // Fonction pour insérer une variable dans un éditeur spécifique
  const handleInsertVariable = (variable, targetEditor) => {
    let editor;
    
    switch (targetEditor) {
      case 'header':
        editor = headerEditorRef.current?.getEditor();
        break;
      case 'footer':
        editor = footerEditorRef.current?.getEditor();
        break;
      case 'body':
      default:
        editor = bodyEditorRef.current?.getEditor();
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

  // Fonction pour enregistrer le modèle
  const handleSave = () => {
    if (!name.trim()) {
      alert('Veuillez donner un nom à votre modèle.');
      return;
    }
    
    // Préparer les données dans le nouveau format
    const modelData = {
      // Si le modèle a un ID, l'inclure dans les données
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
      dateTemplate,
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
      .replace(/{date_annee}/g, new Date().getFullYear().toString());
    
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

  // Si la modale n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  // Utiliser createPortal pour rendre la modale directement dans le body
  return ReactDOM.createPortal(
    <div 
      className="modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050
      }}
    >
      <div 
        className="modal-content template-editor-modal" 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="modal-header" 
          style={{
            padding: '15px 20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 style={{ margin: 0 }}>
            {template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
          </h3>
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={onClose}
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
        
        <div className="modal-body" style={{ padding: '20px' }}>
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
                
                {/* En-tête du contrat */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title h5 mb-0">En-tête du contrat</h3>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#headerCollapse"
                      aria-expanded="true"
                    >
                      <i className="bi bi-chevron-down"></i>
                    </button>
                  </div>
                  <div className="collapse show" id="headerCollapse">
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
                          <div className="dropdown">
                            <button 
                              className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                              type="button" 
                              data-bs-toggle="dropdown"
                            >
                              <i className="bi bi-code-square me-1"></i>
                              Variables
                            </button>
                            <ul className="dropdown-menu">
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_nom', 'header')}>programmateur_nom</button></li>
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_structure', 'header')}>programmateur_structure</button></li>
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_email', 'header')}>programmateur_email</button></li>
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_siret', 'header')}>programmateur_siret</button></li>
                            </ul>
                          </div>
                        </div>
                        <ReactQuill
                          ref={headerEditorRef}
                          theme="snow"
                          value={headerContent}
                          onChange={setHeaderContent}
                          modules={editorModules}
                          style={{ height: '150px', marginBottom: '50px' }}
                        />
                      </div>
                    </div>
                  </div>
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
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                            type="button" 
                            data-bs-toggle="dropdown"
                          >
                            <i className="bi bi-code-square me-1"></i>
                            Variables
                          </button>
                          <ul className="dropdown-menu">
                            <li><h6 className="dropdown-header">Programmateur</h6></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_nom', 'body')}>programmateur_nom</button></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_structure', 'body')}>programmateur_structure</button></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_email', 'body')}>programmateur_email</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><h6 className="dropdown-header">Artiste</h6></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('artiste_nom', 'body')}>artiste_nom</button></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('artiste_genre', 'body')}>artiste_genre</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><h6 className="dropdown-header">Concert</h6></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('concert_titre', 'body')}>concert_titre</button></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('concert_date', 'body')}>concert_date</button></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('concert_montant', 'body')}>concert_montant</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><h6 className="dropdown-header">Lieu</h6></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('lieu_nom', 'body')}>lieu_nom</button></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('lieu_adresse', 'body')}>lieu_adresse</button></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('lieu_code_postal', 'body')}>lieu_code_postal</button></li>
                            <li><button className="dropdown-item" onClick={() => handleInsertVariable('lieu_ville', 'body')}>lieu_ville</button></li>
                          </ul>
                        </div>
                      </div>
                      <ReactQuill
                        ref={bodyEditorRef}
                        theme="snow"
                        value={bodyContent}
                        onChange={setBodyContent}
                        modules={editorModules}
                        style={{ height: '400px', marginBottom: '50px' }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Pied de page du contrat */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title h5 mb-0">Pied de page du contrat</h3>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#footerCollapse"
                      aria-expanded="true"
                    >
                      <i className="bi bi-chevron-down"></i>
                    </button>
                  </div>
                  <div className="collapse show" id="footerCollapse">
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
                          <div className="dropdown">
                            <button 
                              className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                              type="button" 
                              data-bs-toggle="dropdown"
                            >
                              <i className="bi bi-code-square me-1"></i>
                              Variables
                            </button>
                            <ul className="dropdown-menu">
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_nom', 'footer')}>programmateur_nom</button></li>
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_structure', 'footer')}>programmateur_structure</button></li>
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_email', 'footer')}>programmateur_email</button></li>
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_siret', 'footer')}>programmateur_siret</button></li>
                            </ul>
                          </div>
                        </div>
                        <ReactQuill
                          ref={footerEditorRef}
                          theme="snow"
                          value={footerContent}
                          onChange={setFooterContent}
                          modules={editorModules}
                          style={{ height: '150px', marginBottom: '50px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Titre du document */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title h5 mb-0">Titre du document</h3>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#titleCollapse"
                      aria-expanded="true"
                    >
                      <i className="bi bi-chevron-down"></i>
                    </button>
                  </div>
                  <div className="collapse show" id="titleCollapse">
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
                  </div>
                </div>
                
                {/* Ligne de date */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title h5 mb-0">Ligne de date</h3>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#dateCollapse"
                      aria-expanded="true"
                    >
                      <i className="bi bi-chevron-down"></i>
                    </button>
                  </div>
                  <div className="collapse show" id="dateCollapse">
                    <div className="card-body">
                      <div className="form-group">
                        <label htmlFor="dateTemplate">Format de la date</label>
                        <input
                          type="text"
                          id="dateTemplate"
                          className="form-control"
                          value={dateTemplate}
                          onChange={(e) => setDateTemplate(e.target.value)}
                        />
                        <small className="text-muted">
                          Exemple: "Fait à {'{lieu_ville}'}, le {'{date_complete}'}"
                        </small>
                      </div>
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
                      data-bs-toggle="collapse"
                      data-bs-target="#signatureCollapse"
                      aria-expanded="true"
                    >
                      <i className="bi bi-chevron-down"></i>
                    </button>
                  </div>
                  <div className="collapse show" id="signatureCollapse">
                    <div className="card-body">
                      <div className="form-group">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label>Format de la zone de signature</label>
                          <div className="dropdown">
                            <button 
                              className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                              type="button" 
                              data-bs-toggle="dropdown"
                            >
                              <i className="bi bi-code-square me-1"></i>
                              Variables
                            </button>
                            <ul className="dropdown-menu">
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_nom', 'signature')}>programmateur_nom</button></li>
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('programmateur_structure', 'signature')}>programmateur_structure</button></li>
                              <li><button className="dropdown-item" onClick={() => handleInsertVariable('artiste_nom', 'signature')}>artiste_nom</button></li>
                            </ul>
                          </div>
                        </div>
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
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div 
          className="modal-footer" 
          style={{
            padding: '15px 20px',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button 
            className="btn btn-outline-secondary" 
            onClick={onClose}
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
    </div>,
    document.body
  );
};

export default ContratTemplateEditorModal;
