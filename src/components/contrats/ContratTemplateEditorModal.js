// src/components/contrats/ContratTemplateEditorModal.js
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ContratVariable from './desktop/ContratVariable';
import '@styles/index.css';

const ContratTemplateEditorModal = ({ 
  isOpen, 
  onClose, 
  template, 
  onSave 
}) => {
  // États repris de l'implémentation desktop
  const [name, setName] = useState(template?.name || 'Nouveau modèle');
  const [sections, setSections] = useState(template?.sections || [{title: 'Section 1', content: ''}]);
  const [isDefault, setIsDefault] = useState(template?.isDefault || false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Référence pour l'éditeur
  const quillRef = useRef();
  
  // useEffect pour initialiser les sections si besoin
  useEffect(() => {
    if (sections.length === 0) {
      setSections([{
        title: 'Parties contractantes',
        content: '<p>Entre les soussignés:</p><p><strong>L\'Organisateur:</strong> {programmateur_nom}, {programmateur_structure}</p><p><strong>L\'Artiste:</strong> {artiste_nom}</p>'
      }]);
    }
  }, [sections.length]);
  
  // useEffect pour mettre à jour les états quand le template change
  useEffect(() => {
    if (template) {
      setName(template.name || 'Modèle sans nom');
      setSections(template.sections || [{title: 'Section 1', content: ''}]);
      setIsDefault(template.isDefault || false);
      setCurrentSectionIndex(0);
    } else {
      setName('Nouveau modèle');
      setSections([{title: 'Section 1', content: ''}]);
      setIsDefault(false);
      setCurrentSectionIndex(0);
    }
  }, [template]);
  
  // Fonctions reprises de l'implémentation desktop
  const handleAddSection = () => {
    const newSections = [...sections, { title: `Section ${sections.length + 1}`, content: '' }];
    setSections(newSections);
    setCurrentSectionIndex(newSections.length - 1);
  };
  
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
  
  const handleSectionTitleChange = (index, title) => {
    const newSections = [...sections];
    newSections[index].title = title;
    setSections(newSections);
  };
  
  const handleSectionContentChange = (index, content) => {
    const newSections = [...sections];
    newSections[index].content = content;
    setSections(newSections);
  };
  
  const handleInsertVariable = (variable) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor) {
        const range = editor.getSelection(true);
        if (range) {
          editor.insertText(range.index, `{${variable}}`, 'user');
        } else {
          const length = editor.getLength();
          editor.insertText(length - 1, `{${variable}}`, 'user');
        }
      }
    }
  };
  
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
        // Organisateur
        .replace(/{raison_sociale}/g, 'Association Culturelle XYZ')
        .replace(/{siret}/g, '123 456 789 00012')
        .replace(/{tva}/g, 'FR 12 123456789')
        .replace(/{adresse_organisateur}/g, '123 rue Principale, 75001 Paris')
        .replace(/{representant}/g, 'Jean Dupont')
        .replace(/{qualite_representant}/g, 'Président')
        .replace(/{programmateur_nom}/g, 'Jean Dupont')
        .replace(/{programmateur_structure}/g, 'Asso Culturelle XYZ')
        .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
        
        // Artiste
        .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
        .replace(/{artiste_genre}/g, 'Rock Alternatif')
        
        // Événement
        .replace(/{date_evenement}/g, '15/05/2025')
        .replace(/{adresse_evenement}/g, '123 rue Principale, 75001 Paris')
        .replace(/{concert_titre}/g, 'Concert de printemps')
        .replace(/{concert_date}/g, '15/05/2025')
        
        // Finances
        .replace(/{prix_vente}/g, '800')
        .replace(/{prix_lettres}/g, 'huit cents euros')
        .replace(/{concert_montant}/g, '800')
        
        // Lieu
        .replace(/{lieu_nom}/g, 'Salle des fêtes')
        .replace(/{lieu_adresse}/g, '123 rue Principale')
        .replace(/{lieu_code_postal}/g, '75001')
        .replace(/{lieu_ville}/g, 'Paris')
        .replace(/{lieu_capacite}/g, '200')
        
        // Signature
        .replace(/{lieu_signature}/g, 'Paris')
        .replace(/{date_signature}/g, '01/04/2025')
        
        // Date actuelle
        .replace(/{date_jour}/g, new Date().getDate().toString())
        .replace(/{date_mois}/g, (new Date().getMonth() + 1).toString())
        .replace(/{date_annee}/g, new Date().getFullYear().toString());
      
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
          {/* Contenu de l'éditeur - Repris de l'implémentation desktop */}
          <div className="template-editor-container">
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
                
                <div className="editor-two-columns" style={{
                  display: 'grid',
                  gridTemplateColumns: '220px 1fr 250px',
                  gap: '20px',
                  height: '100%',
                  minHeight: '400px'
                }}>
                  {/* Sidebar de sections */}
                  <div className="sections-sidebar" style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    padding: '15px',
                    height: '100%'
                  }}>
                    <div className="sections-header" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <h4>Sections</h4>
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={handleAddSection}
                      >
                        <i className="bi bi-plus-circle"></i>
                      </button>
                    </div>
                    <div className="sections-list" style={{
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {sections.map((section, index) => (
                        <div 
                          key={index} 
                          className={`section-item ${currentSectionIndex === index ? 'active' : ''}`}
                          onClick={() => setCurrentSectionIndex(index)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 10px',
                            marginBottom: '5px',
                            borderRadius: '4px',
                            backgroundColor: currentSectionIndex === index ? '#e7f1ff' : 'white',
                            borderLeft: currentSectionIndex === index ? '3px solid #0d6efd' : 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <div className="section-item-title" style={{
                            flex: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {section.title || `Section ${index + 1}`}
                          </div>
                          <button 
                            className="btn btn-sm btn-outline-danger section-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(index);
                            }}
                            style={{
                              padding: '0 5px',
                              fontSize: '12px',
                              opacity: 0.5
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Éditeur de section */}
                  <div className="section-editor" style={{
                    borderRadius: '8px',
                    padding: '15px',
                    border: '1px solid #ddd',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {sections.length > 0 && currentSectionIndex < sections.length ? (
                      <>
                        <div className="section-editor-header" style={{
                          marginBottom: '15px'
                        }}>
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
                        
                        <div className="section-editor-content" style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <label>Contenu</label>
                          <div style={{ minHeight: '300px', height: 'calc(100% - 30px)', marginBottom: '20px' }}>
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
                              style={{ height: '100%' }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="no-sections-message" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%'
                      }}>
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
                  
                  {/* Sidebar de variables */}
                  <div className="variables-sidebar" style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    padding: '15px',
                    height: '100%'
                  }}>
                    <h4>Variables disponibles</h4>
                    <div className="variables-list" style={{
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      <div className="variable-group" style={{
                        marginBottom: '20px'
                      }}>
                        <h5 style={{
                          fontSize: '14px',
                          marginBottom: '10px',
                          color: '#495057'
                        }}>Programmateur</h5>
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
                      
                      <div className="variable-group" style={{ marginBottom: '20px' }}>
                        <h5 style={{ fontSize: '14px', marginBottom: '10px', color: '#495057' }}>Artiste</h5>
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
                      
                      <div className="variable-group" style={{ marginBottom: '20px' }}>
                        <h5 style={{ fontSize: '14px', marginBottom: '10px', color: '#495057' }}>Concert</h5>
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
                      
                      <div className="variable-group" style={{ marginBottom: '20px' }}>
                        <h5 style={{ fontSize: '14px', marginBottom: '10px', color: '#495057' }}>Lieu</h5>
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
