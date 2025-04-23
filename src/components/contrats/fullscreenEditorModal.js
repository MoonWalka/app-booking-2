import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@styles/index.css';

const FullscreenEditorModal = ({ 
  isOpen, 
  onClose, 
  sectionTitle, 
  initialContent, 
  onSave 
}) => {
  const [content, setContent] = useState('');
  const editorRef = useRef(null);
  const modalRef = useRef(null);
  
  // Initialiser le contenu lorsque la modale s'ouvre ou que le contenu initial change
  useEffect(() => {
    if (isOpen && initialContent !== undefined) {
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);
  
  // Effet pour focus sur l'éditeur quand la modale s'ouvre
  useEffect(() => {
    if (isOpen && editorRef.current) {
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
  }, [isOpen]);
  
  // Gérer la fermeture lors d'un clic en dehors de la modale
  const handleBackdropClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h3>{sectionTitle ? `Édition de la section "${sectionTitle}"` : 'Édition de section'}</h3>
          <button 
            type="button"
            className="btn btn-sm btn-outline-secondary" 
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <ReactQuill
            ref={editorRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder="Commencez à rédiger le contenu de votre section ici..."
          />
        </div>
        
        <div className="modal-footer">
          <button 
            type="button"
            className="btn btn-outline-secondary" 
            onClick={onClose}
          >
            Annuler
          </button>
          <button 
            type="button"
            className="btn btn-primary" 
            onClick={() => {
              onSave(content);
              onClose();
            }}
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenEditorModal;