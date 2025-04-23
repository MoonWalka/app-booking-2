// src/components/common/Modal.js
import React, { useEffect } from 'react';
import '@styles/components/modals.css';

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
  
  // Déterminer la largeur maximale en fonction de la taille
  const maxWidth = size === 'large' ? '1200px' : size === 'small' ? '400px' : '800px';
  
  // Empêcher la propagation du clic dans le contenu de la modale
  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
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
        zIndex: 1050,
        opacity: 1, // Force l'opacité
        visibility: 'visible' // Force la visibilité
      }}
      onClick={onClose} // Fermer la modale quand on clique sur l'overlay
    >
      <div 
        className={`modal ${size === 'large' ? 'modal-large' : size === 'small' ? 'modal-small' : ''}`}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: maxWidth,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          transform: 'none', // Annule toute transformation
          opacity: 1 // Force l'opacité
        }}
        onClick={handleContentClick} // Empêcher la propagation du clic
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
          <h3 
            className="modal-title"
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              margin: 0
            }}
          >{title}</h3>
          <button 
            className="modal-close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#999'
            }}
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div 
          className="modal-body"
          style={{
            padding: '20px'
          }}
        >
          {children}
        </div>
        
        {footer && (
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
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;