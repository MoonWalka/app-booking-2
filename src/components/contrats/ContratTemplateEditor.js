import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ContratVariable from './ContratVariable';
import '../../style/contratTemplateEditor.css';

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'indent',
  'align'
];

const ContratTemplateEditor = ({ template, onSave }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(template?.name || 'Nouveau modèle');
  const [sections, setSections] = useState(template?.sections || []);
  const [isDefault, setIsDefault] = useState(template?.isDefault || false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Référence pour le quill editor
  const quillRef = useRef();

  // Fonction pour ajouter une section
  const handleAddSection = () => {
    setSections([...sections, { title: `Section ${sections.length + 1}`, content: '' }]);
    setCurrentSectionIndex(sections.length);
  };

  // Fonction pour supprimer une section
  const handleDeleteSection = (index) => {
    if (sections.length <= 1) {
      alert('Vous devez avoir au moins une section dans votre modèle.');
      return;
    }
    
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
    
    if (currentSectionIndex >= newSections.length) {
      setCurrentSectionIndex(newSections.length - 1);
    }
  };

  // Fonction pour mettre à jour le titre d'une section
  const handleSectionTitleChange = (index, title) => {
    const newSections = [...sections];
    newSections[index].title = title;
    setSections(newSections);
  };

  // Fonction pour mettre à jour le contenu d'une section
  const handleSectionContentChange = (index, content) => {
    const newSections = [...sections];
    newSections[index].content = content;
    setSections(newSections);
  };

  // Fonction pour insérer une variable
  const handleInsertVariable = (variable) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      if (range) {
        editor.insertText(range.index, `{${variable}}`, 'user');
      }
    }
  };

  // Fonction pour enregistrer le modèle
  const handleSave = () => {
    if (!name.trim()) {
      alert('Veuillez donner un nom à votre modèle.');
      return;
    }
    
    if (sections.some(section => !section.title.trim())) {
      alert('Toutes les sections doivent avoir un titre.');
      return;
    }
    
    onSave({
      name,
      sections,
      isDefault
    });
  };

  // Générer un aperçu avec des données fictives
  const getPreviewContent = () => {
    let content = '';
    
    sections.forEach(section => {
      content += `<h3>${section.title}</h3>`;
      let sectionContent = section.content;
      
      // Remplacer les variables par des exemples
      sectionContent = sectionContent
        .replace(/{programmateur_nom}/g, 'Jean Dupont')
        .replace(/{programmateur_structure}/g, 'Asso Culturelle XYZ')
        .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
        .replace(/{concert_titre}/g, 'Concert de printemps')
        .replace(/{concert_date}/g, '15/05/2025')
        .replace(/{concert_montant}/g, '800')
        .replace(/{lieu_nom}/g, 'Salle des fêtes')
        .replace(/{lieu_adresse}/g, '123 rue Principale')
        .replace(/{lieu_code_postal}/g, '75001')
        .replace(/{lieu_ville}/g, 'Paris');
      
      content += sectionContent;
    });
    
    return content;
  };

  return (
    <div className="template-editor-container">
      <div className="editor-header">
        <div className="breadcrumb-container">
          <span className="breadcrumb-item" onClick={() => navigate('/parametres/contrats')}>Modèles de contrats</span>
          <i className="bi bi-chevron-right"></i>
          <span className="breadcrumb-item active">{template?.id ? name : 'Nouveau modèle'}</span>
        </div>
        <h2 className="editor-title">{template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}</h2>
        
        <div className="editor-actions">
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => navigate('/parametres/contrats')}
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
        <div className="editor-content">
          <div className="template-info-card">
            <div className="form-group">
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
          
          <div className="editor-two-columns">
            <div className="sections-sidebar">
              <div className="sections-header">
                <h4>Sections</h4>
                <button 
                  className="btn btn-sm btn-outline-primary" 
                  onClick={handleAddSection}
                >
                  <i className="bi bi-plus-circle"></i>
                </button>
              </div>
              <div className="sections-list">
                {sections.map((section, index) => (
                  <div 
                    key={index} 
                    className={`section-item ${currentSectionIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentSectionIndex(index)}
                  >
                    <div className="section-item-title">
                      {section.title || `Section ${index + 1}`}
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-danger section-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(index);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="section-editor">
              {sections.length > 0 ? (
                <>
                  <div className="section-editor-header">
                    <div className="form-group">
                      <label htmlFor="sectionTitle">Titre de la section</label>
                      <input
                        type="text"
                        id="sectionTitle"
                        className="form-control"
                        value={sections[currentSectionIndex].title}
                        onChange={(e) => handleSectionTitleChange(currentSectionIndex, e.target.value)}
                        placeholder="Ex: Parties contractantes"
                      />
                    </div>
                  </div>
                  
                  <div className="section-editor-content">
                    <label>Contenu</label>
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={sections[currentSectionIndex].content}
                      onChange={(content) => handleSectionContentChange(currentSectionIndex, content)}
                      modules={quillModules}
                      formats={quillFormats}
                    />
                  </div>
                </>
              ) : (
                <div className="no-sections-message">
                  <p>Aucune section n'a été créée.</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleAddSection}
                  >
                    Ajouter une section
                  </button>
                </div>
              )}
            </div>
            
            <div className="variables-sidebar">
              <h4>Variables disponibles</h4>
              <div className="variables-list">
                <div className="variable-group">
                  <h5>Programmateur</h5>
                  <ContratVariable 
                    name="programmateur_nom" 
                    description="Nom du programmateur"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="programmateur_structure" 
                    description="Structure du programmateur"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="programmateur_email" 
                    description="Email du programmateur"
                    onInsert={handleInsertVariable}
                  />
                </div>
                
                <div className="variable-group">
                  <h5>Artiste</h5>
                  <ContratVariable 
                    name="artiste_nom" 
                    description="Nom de l'artiste"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="artiste_genre" 
                    description="Genre musical"
                    onInsert={handleInsertVariable}
                  />
                </div>
                
                <div className="variable-group">
                  <h5>Concert</h5>
                  <ContratVariable 
                    name="concert_titre" 
                    description="Titre du concert"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="concert_date" 
                    description="Date du concert"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="concert_montant" 
                    description="Montant du concert (€)"
                    onInsert={handleInsertVariable}
                  />
                </div>
                
                <div className="variable-group">
                  <h5>Lieu</h5>
                  <ContratVariable 
                    name="lieu_nom" 
                    description="Nom du lieu"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="lieu_adresse" 
                    description="Adresse du lieu"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="lieu_code_postal" 
                    description="Code postal"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="lieu_ville" 
                    description="Ville"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="lieu_capacite" 
                    description="Capacité du lieu"
                    onInsert={handleInsertVariable}
                  />
                </div>
                
                <div className="variable-group">
                  <h5>Date</h5>
                  <ContratVariable 
                    name="date_jour" 
                    description="Jour actuel"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="date_mois" 
                    description="Mois actuel"
                    onInsert={handleInsertVariable}
                  />
                  <ContratVariable 
                    name="date_annee" 
                    description="Année actuelle"
                    onInsert={handleInsertVariable}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratTemplateEditor;
