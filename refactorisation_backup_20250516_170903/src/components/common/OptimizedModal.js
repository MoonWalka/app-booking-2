import React, { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styles from './Modal.module.css';

// Utilisation de React.memo pour éviter les rendus inutiles
const OptimizedModal = React.memo(({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'medium',
  variant = '',
  showCloseButton = true,
  closeOnEsc = true,
  closeOnOverlayClick = true,
  ariaLabelledBy = 'modal-title',
  autoFocus = true,
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  
  // Récupération des classes CSS selon les props
  const modalSizeClass = styles[`modal${size.charAt(0).toUpperCase() + size.slice(1)}`] || styles.modalMedium;
  const modalVariantClass = variant ? styles[`modal${variant.charAt(0).toUpperCase() + variant.slice(1)}`] : '';
  
  // Gestion de la touche Escape
  const handleKeyDown = useCallback((e) => {
    if (closeOnEsc && e.key === 'Escape') {
      onClose();
    }
  }, [closeOnEsc, onClose]);
  
  // Focus trap pour l'accessibilité
  const handleFocusTrap = useCallback((e) => {
    if (!modalRef.current || !modalRef.current.contains(e.target)) {
      return;
    }
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && e.key === 'Tab') {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else if (!e.shiftKey && e.key === 'Tab') {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }, []);
  
  // Configuration des gestionnaires d'événements au montage du composant
  useEffect(() => {
    if (isOpen) {
      // Sauvegarde de l'élément actif avant l'ouverture de la modale
      previousActiveElement.current = document.activeElement;
      
      // Ajout des écouteurs d'événements
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleFocusTrap);
      
      // Focus automatique sur la modale
      if (autoFocus && modalRef.current) {
        modalRef.current.focus();
      }
      
      // Empêcher le défilement du body
      document.body.style.overflow = 'hidden';
    }
    
    // Nettoyage au démontage
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTrap);
      
      if (isOpen) {
        // Restaurer le défilement du body
        document.body.style.overflow = '';
        
        // Restaurer le focus sur l'élément précédemment actif
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }
    };
  }, [isOpen, handleKeyDown, handleFocusTrap, autoFocus]);
  
  // Si la modale n'est pas ouverte, ne rien rendre
  if (!isOpen) return null;
  
  // Définir le contenu de la modale
  const modalContent = (
    <div 
      className={styles.modalOverlay} 
      onClick={closeOnOverlayClick ? onClose : undefined}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`${styles.modal} ${modalSizeClass} ${modalVariantClass}`}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex="-1"
        aria-labelledby={ariaLabelledBy}
      >
        <div className={styles.modalHeader}>
          <h2 id={ariaLabelledBy} className={styles.modalTitle}>{title}</h2>
          {showCloseButton && (
            <button 
              className={styles.closeButton} 
              aria-label="Fermer"
              onClick={onClose}
            >
              ×
            </button>
          )}
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
  
  // Utiliser createPortal pour rendre la modale en dehors de la hiérarchie du DOM parent
  return createPortal(
    modalContent,
    document.body
  );
});

OptimizedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['', 'center', 'alert', 'success', 'warning', 'info']),
  showCloseButton: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  ariaLabelledBy: PropTypes.string,
  autoFocus: PropTypes.bool,
};

// Utilisation d'un displayName explicite pour faciliter le débogage
OptimizedModal.displayName = 'OptimizedModal';

export default OptimizedModal;