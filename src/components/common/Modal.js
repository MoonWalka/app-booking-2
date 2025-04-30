// src/components/common/Modal.js
import React, { useEffect } from 'react';
import styles from './Modal.module.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  size = 'medium', // 'small', 'medium', 'large'
  children, 
  footer
}) => {
  console.log("Modal rendering with isOpen:", isOpen, "size:", size, "title:", title);
  
  // Empêcher le défilement du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Log pour déboguer le contenu de la modale
      console.log("Contenu de la modale :", children);
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, children]);
  
  if (!isOpen) return null;
  
  // Empêcher la propagation du clic dans le contenu de la modale
  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className={styles.modalOverlay}
      onClick={onClose} // Fermer la modale quand on clique sur l'overlay
    >
      <div 
        className={`${styles.modal} ${
          size === 'small' 
            ? styles.modalSmall 
            : size === 'large' 
            ? styles.modalLarge 
            : styles.modalMedium
        }`}
        onClick={handleContentClick} // Empêcher la propagation du clic
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button 
            className="tc-btn-light btn-sm"
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {children}
        </div>
        
        {footer && (
          <div className={styles.modalFooter}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;