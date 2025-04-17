import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ContratVariable from './ContratVariable';
import '../../style/contratTemplateEditor.css';

const ContratTemplateEditor = ({ template, onSave }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(template?.name || 'Nouveau modèle');
  const [sections, setSections] = useState(template?.sections || [{title: 'Section 1',content: ''}]);
  const [isDefault, setIsDefault] = useState(template?.isDefault || false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  // Référence pour le quill editor
  const quillRef = useRef();

  // useEffect pour initialiser les sections si besoin
  useEffect(() => {
    // Si c'est un nouveau modèle et qu'il n'y a pas encore de sections, en ajouter une par défaut
    if (sections.length === 0) {
      setSections([{
        title: 'Parties contractantes',
        content: '<p>Entre les soussignés:</p><p><strong>L\'Organisateur:</strong> {programmateur_nom}, {programmateur_structure}</p><p><strong>L\'Artiste:</strong> {artiste_nom}</p>'
      }]);
    }
  }, [sections.length]);

  // Fonction pour ajouter une section
  const handleAddSection = () => {
    const newSections = [...sections, { title: `Section ${sections.length + 1}`, content: '' }];
    setSections(newSections);
    setCurrentSectionIndex(newSections.length - 1); // Pointer vers la nouvelle section
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
      // Vérifiez si l'éditeur est initialisé et a une sélection
      if (editor) {
        const range = editor.getSelection(true); // 'true' pour forcer l'obtention de la dernière sélection connue
        if (range) {
          // Insérer la variable à la position actuelle du curseur
          editor.insertText(range.index, `{${variable}}`, 'user');
        } else {
          // Si aucune sélection n'est active, insérer à la fin du contenu
          const length = editor.getLength();
          editor.insertText(length - 1, `{${variable}}`, 'user');
        }
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
    let content = `
      <style>
        .preview-container {
          font-family: Arial, sans-serif;
          font-size: 9px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin-top: 15px;
          margin-bottom: 10px;
          background-color: #f5f5f5;
          padding: 5px;
        }
      </style>
      <div class="preview-container">
    `;
    
    // Simuler l'en-tête
    content += `
      <div style="text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; font-size: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <div>[LOGO]</div>
          <div style="text-align: right;">
            <div>Nom de l'entreprise</div>
            <div>Adresse de l'entreprise</div>
            <div>Code postal, Ville</div>
            <div>Tél: XX XX XX XX XX - Email: contact@example.com</div>
            <div>SIRET: XXX XXX XXX XXXXX - APE: XXXX</div>
          </div>
        </div>
      </div>
    `;
    
    // Titre du contrat
    content += `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 20px; font-weight: bold;">Contrat - Concert de printemps</h1>
        <div style="text-align: right; font-size: 12px; color: #777;">Fait à Paris, le 15 mai 2023</div>
      </div>
    `;
    
    // Contenu des sections
    sections.forEach(section => {
      content += `<div class="section-title">${section.title}</div>`;
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
    
    // Simuler le pied de page
    content += `
      <div style="text-align: center; font-size: 8px; color: #999; border-top: 1px solid #ccc; margin-top: 30px; padding-top: 10px;">
        <div>Nom de l'entreprise - Adresse, Code Postal Ville</div>
        <div>SIRET: XXX XXX XXX XXXXX - APE: XXXX</div>
        <div style="font-size: 7px; color: #999; margin-top: 5px;">Association loi 1901 non assujettie à la TVA</div>
        <div style="font-size: 7px; color: #999;">Document généré automatiquement par TourCraft le 15/05/2025</div>
      </div>
    `;
    
    content += '</div>'; // Fermer .preview-container
    
    return content;
  };

  // Composant pour le guide d'utilisation
  const UserGuide = () => (
    <div className="user-guide">
      <div className="guide-header">
        <h3>Mode d'emploi de l'éditeur de modèles de contrat</h3>
        <button 
          className="btn btn-sm btn-outline-secondary" 
          onClick={() => setShowGuide(false)}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      
      <div className="guide-content">
        <div className="guide-section">
          <h4>1. Créer un modèle de contrat</h4>
          <p>Les modèles de contrat vous permettent de générer rapidement des contrats professionnels pour vos concerts.</p>
          <ul>
            <li>Commencez par donner un nom à votre modèle</li>
            <li>Organisez votre contrat en sections thématiques (parties contractantes, objet, rémunération...)</li>
            <li>Cochez "Utiliser comme modèle par défaut" pour que ce modèle soit sélectionné automatiquement</li>
          </ul>
        </div>
        
        <div className="guide-section">
          <h4>2. Ajouter et organiser des sections</h4>
          <p>Un contrat est divisé en sections pour une meilleure organisation :</p>
          <ul>
            <li>Cliquez sur le bouton + dans la barre latérale pour ajouter une section</li>
            <li>Donnez un titre explicite à chaque section</li>
            <li>Utilisez l'éditeur de texte pour formater le contenu de chaque section</li>
            <li>Réorganisez les sections en fonction de vos besoins</li>
          </ul>
        </div>
        
        <div className="guide-section">
          <h4>3. Utiliser les variables dynamiques</h4>
          <p>Les variables permettent de personnaliser automatiquement chaque contrat :</p>
          <ul>
            <li>Cliquez sur une variable dans la barre latérale droite pour l'insérer à l'endroit du curseur</li>
            <li>Les variables sont remplacées par les informations réelles lors de la génération du contrat</li>
            <li>Par exemple, {'{programmateur_nom}'} sera remplacé par le nom du programmateur associé au concert</li>
            <li>Utilisez la fonction Aperçu pour voir comment le contrat apparaîtra avec des données d'exemple</li>
          </ul>
        </div>
        
        <div className="guide-section">
          <h4>4. Conseils pour créer un bon modèle</h4>
          <ul>
            <li>Incluez toujours les sections essentielles (parties contractantes, objet, rémunération, etc.)</li>
            <li>Utilisez une structure claire et cohérente</li>
            <li>Utilisez les variables pour toutes les informations qui changent d'un concert à l'autre</li>
            <li>Vérifiez l'aperçu avant d'enregistrer pour s'assurer que tout est correct</li>
            <li>Consultez un professionnel du droit pour valider vos modèles de contrats</li>
          </ul>
        </div>
      </div>
    </div>
  );

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
            className="btn btn-outline-info" 
            onClick={() => setShowGuide(!showGuide)}
          >
            <i className="bi bi-question-circle me-2"></i>
            {showGuide ? 'Masquer l\'aide' : 'Aide'}
          </button>
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
      
      {/* Guide d'utilisation */}
      {showGuide && <UserGuide />}
      
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
            {sections.length > 0 && currentSectionIndex < sections.length ? (
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
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                        [{ 'align': [] }],
                        ['clean']
                      ],
                    }}
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