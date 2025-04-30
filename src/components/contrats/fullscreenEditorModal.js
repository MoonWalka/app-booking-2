import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// Modifié l'ordre d'importation pour que les styles de Quill aient priorité
import styles from './FullscreenEditorModal.module.css';

const FullscreenEditorModal = ({ 
  isOpen, 
  onClose, 
  sectionTitle, 
  initialContent, 
  onSave 
}) => {
  
  const [content, setContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
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
  
  // Fonction de sauvegarde
  const handleSave = () => {
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
    <div className={styles.modalOverlay} onClick={handleBackdropClick} role="button" tabIndex={0}>
      <div className={styles.modalContent} ref={modalRef}>
        <div className={styles.modalHeader}>
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

        <div className={styles.modalBody}>
          {!isPreviewMode ? (
            <div className={styles.quillEditorWrapper}>
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
            <div className={styles.quillPreview}>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
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