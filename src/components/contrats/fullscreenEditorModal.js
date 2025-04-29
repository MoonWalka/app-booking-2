import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// Modifié l'ordre d'importation pour que les styles de Quill aient priorité
import '@/styles/index.css';
import '@/styles/components/contrat-print.css';

// Ajout d'un style spécifique pour protéger la toolbar de Quill
const editorStyles = {
  quillContainer: {
    height: 'calc(60vh - 50px)',
    marginBottom: '40px', // Espace pour la toolbar
  },
  // Style qui garantit que la toolbar reste visible
  quillToolbar: {
    '& .ql-toolbar': {
      display: 'flex !important',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      background: '#fff',
      borderRadius: '3px',
      border: '1px solid #ccc',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      zIndex: 10,
    }
  }
};

const FullscreenEditorModal = ({ 
  isOpen, 
  onClose, 
  sectionTitle, 
  initialContent, 
  onSave 
}) => {
  console.log("============ FULLSCREEN EDITOR MODAL CHARGÉE ============");
  console.log("Section titre:", sectionTitle);
  console.log("Contenu initial reçu:", initialContent);
  
  const [content, setContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const editorRef = useRef(null);
  const modalRef = useRef(null);
  
  // Initialiser le contenu lorsque la modale s'ouvre ou que le contenu initial change
  useEffect(() => {
    if (isOpen && initialContent !== undefined) {
      console.log("Initialisation du contenu dans l'éditeur:", initialContent);
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);
  
  // Effet pour focus sur l'éditeur quand la modale s'ouvre
  useEffect(() => {
    if (isOpen && editorRef.current && !isPreviewMode) {
      // On utilise un timeout pour s'assurer que le DOM est complètement rendu
      const timer = setTimeout(() => {
        try {
          const editor = editorRef.current.getEditor();
          if (editor) {
            editor.focus();
            // Placer le curseur à la fin du contenu
            const length = editor.getLength();
            editor.setSelection(length, length);
          }
        } catch (e) {
          console.error("Erreur lors de la mise au focus de l'éditeur:", e);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isPreviewMode]);
  
  // Gérer la fermeture lors d'un clic en dehors de la modale
  const handleBackdropClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };
  
  // Fonction de sauvegarde avec log
  const handleSave = () => {
    console.log("Sauvegarde du contenu:", content);
    onSave(content);
    onClose();
  };

  const handlePreviewClick = () => {
    setIsPreviewMode(!isPreviewMode);
  };
  
  if (!isOpen) return null;
  
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ],
  };

  return (
    <div className="tc-modal-overlay" onClick={handleBackdropClick} role="button" tabIndex={0}>
      <div className="tc-modal-content fullscreen-editor-modal" ref={modalRef}>
        <div className="tc-modal-header">
          <h3>{sectionTitle ? `Édition de la section "${sectionTitle}"` : 'Édition de section'}</h3>
          <button
            type="button"
            className="tc-btn tc-btn-sm tc-btn-outline-primary"
            onClick={handlePreviewClick}
          >
            {isPreviewMode ? 'Retour édition' : 'Aperçu'}
          </button>
          <button 
            type="button"
            className="tc-btn tc-btn-sm tc-btn-outline-secondary" 
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="tc-modal-body">
          {!isPreviewMode ? (
            <div className="quill-editor-container" style={editorStyles.quillContainer}>
              <ReactQuill
                ref={editorRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Commencez à rédiger le contenu de votre section ici..."
              />
            </div>
          ) : (
            <div className="preview-container contrat-print-mode">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}
        </div>

        <div className="tc-modal-footer">
          <button 
            type="button"
            className="tc-btn tc-btn-outline-secondary" 
            onClick={onClose}
          >
            Annuler
          </button>
          <button 
            type="button"
            className="tc-btn tc-btn-primary" 
            onClick={handleSave}
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenEditorModal;