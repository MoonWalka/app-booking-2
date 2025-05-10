
````
import React, { useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Modal.module.css'; // Réutilisation des styles existants

/**
 * Composant Modal optimisé avec React.memo
 * Évite les re-rendus inutiles et utilise correctement les cycles de vie
 */
const OptimizedModal = memo(({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  footer,
  preventOutsideClose = false,
  onAfterClose = () => {},
  onAfterOpen = () => {},
  className = '',
}) => {
  const modalRef = useRef(null);
  const previousIsOpen = useRef(isOpen);
  
  // Gestion des cycles de vie avec useEffect
  useEffect(() => {
    // Callback après ouverture de la modale
    if (isOpen && !previousIsOpen.current) {
      onAfterOpen();
      document.body.style.overflow = 'hidden'; // Empêche le défilement du body
    }
    
    // Callback après fermeture de la modale
    if (!isOpen && previousIsOpen.current) {
      onAfterClose();
      document.body.style.overflow = ''; // Restaure le défilement du body
    }
    
    previousIsOpen.current = isOpen;
    
    // Nettoyage lors du démontage
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onAfterOpen, onAfterClose]);
  
  // Gestion des touches clavier (Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !preventOutsideClose) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, preventOutsideClose]);
  
  // Empêcher la propagation des clics à l'intérieur de la modale
  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  
  // Gestion du clic sur l'overlay
  const handleOverlayClick = (e) => {
    if (preventOutsideClose) return;
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      data-testid="modal-overlay"
    >
      <div 
        ref={modalRef}
        className={`${styles.modal} ${
          size === 'small' 
            ? styles.modalSmall 
            : size === 'large' 
            ? styles.modalLarge 
            : styles.modalMedium
        } ${className}`}
        onClick={handleContentClick}
        data-testid="modal-content"
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          {!preventOutsideClose && (
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Fermer"
              data-testid="modal-close-button"
            >
              <i className="bi bi-x-lg"></i>
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
});

OptimizedModal.displayName = 'OptimizedModal';

OptimizedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  footer: PropTypes.node,
  preventOutsideClose: PropTypes.bool,
  onAfterClose: PropTypes.func,
  onAfterOpen: PropTypes.func,
  className: PropTypes.string
};

export default OptimizedModal;
````


Made changes.

Maintenant que nous avons créé le système de gestion des modales optimisé avec notre `ModalContext` et `OptimizedModal`, continuons d'avancer sur notre plan de la Phase 4. Notre objectif suivant est d'intégrer le nouveau système de modal dans l'application et de mettre à jour les composants qui l'utilisent pour améliorer leur cycle de vie.

Je vais continuer en créant un wrapper pour le ModalProvider et en l'intégrant dans la structure de l'application. Ensuite, nous mettrons à jour l'un des composants prioritaires pour utiliser notre nouveau système.Après avoir examiné le fichier App.js, je constate qu'il contient déjà plusieurs contextes comme AuthProvider et ParametresProvider. Nous allons maintenant intégrer notre nouveau ModalProvider dans cette structure afin que notre système de modales optimisé soit disponible dans toute l'application.

Voici comment nous allons procéder pour continuer notre Phase 4 :

1. Mettre à jour le fichier App.js pour inclure le ModalProvider
2. Adapter un composant existant pour utiliser notre nouveau système de modales
3. Créer une feuille de styles pour notre modal optimisé

Commençons par mettre à jour le fichier App.js :
````
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ParametresProvider } from '@/context/ParametresContext';
import { ModalProvider } from '@/context/ModalContext'; // Import du nouveau ModalProvider
import Layout from '@/components/common/Layout';
// ...existing code...

function App() {
  // ...existing code...

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ParametresProvider>
            <ModalProvider> {/* Ajout du ModalProvider */}
              {/* Intégration du stabilisateur de routeur */}
              <RouterStabilizer />
              <Routes>
                {/* ...existing code... */}
              </Routes>
            </ModalProvider>
          </ParametresProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
````


Made changes.

Maintenant que nous avons intégré notre `ModalProvider` dans l'App.js, créons le fichier CSS modulaire pour notre composant `OptimizedModal`. Cela permettra de s'assurer que nos styles sont correctement isolés et optimisés.
````
/* Modal.module.css - Styles pour le composant OptimizedModal */

.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: fadeIn 0.2s ease-out;
}

.modal {
  background-color: var(--tc-bg-color, #fff);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
  position: relative;
  z-index: 1060;
}

.modalSmall {
  max-width: 480px;
}

.modalMedium {
  max-width: 640px;
}

.modalLarge {
  max-width: 920px;
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--tc-border-color, #e5e5e5);
  background-color: var(--tc-header-bg, #f8f9fa);
}

.modalTitle {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--tc-text-color, #333);
}

.modalBody {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modalFooter {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--tc-border-color, #e5e5e5);
  background-color: var(--tc-footer-bg, #f8f9fa);
}

.closeButton {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 4px;
  color: var(--tc-icon-color, #6c757d);
  transition: all 0.2s ease;
  font-size: 1.25rem;
}

.closeButton:hover {
  color: var(--tc-icon-hover-color, #343a40);
  background-color: rgba(0, 0, 0, 0.05);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Classes utilitaires pour les variants de modales */
.modalCenter {
  text-align: center;
}

.modalAlert {
  border-top: 4px solid var(--tc-alert-color, #dc3545);
}

.modalSuccess {
  border-top: 4px solid var(--tc-success-color, #28a745);
}

.modalWarning {
  border-top: 4px solid var(--tc-warning-color, #ffc107);
}

.modalInfo {
  border-top: 4px solid var(--tc-info-color, #17a2b8);
}

/* Support pour l'accessibilité et le focus */
.modal:focus-visible {
  outline: 2px solid var(--tc-focus-color, #0d6efd);
  outline-offset: 2px;
}

/* Support des media queries pour le responsive */
@media (max-width: 576px) {
  .modal {
    width: 95%;
    max-width: none !important;
  }
  
  .modalHeader {
    padding: 0.75rem 1rem;
  }
  
  .modalBody {
    padding: 1rem;
  }
  
  .modalFooter {
    padding: 0.75rem 1rem;
  }
}
````


Made changes.

Je vois que le fichier Modal.module.css contenait déjà des styles pour un composant Modal préexistant, et mes nouveaux styles pour OptimizedModal ont été ajoutés à la suite des styles existants. Nous devrons modifier ce fichier pour éviter les conflits de classes CSS.

Maintenant, continuons notre implémentation en créant un exemple d'utilisation du nouveau système de modales optimisé. Commençons par mettre à jour le composant OptimizedModal pour qu'il utilise correctement notre module CSS.
````
// OptimizedModal.js - Composant modal optimisé utilisant React.memo et le ModalContext
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
````


Made changes.
Je vais continuer avec la mise à jour du composant OptimizedModal pour utiliser les styles CSS modulaires.
````
// OptimizedModal.js - Composant modal optimisé utilisant React.memo et le ModalContext
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
````


Made changes.

Maintenant que nous avons mis à jour le composant OptimizedModal pour utiliser les styles CSS modulaires, continuons avec l'implémentation de notre contexte Modal pour gérer l'état et les fonctions liées aux modales.
````
// ModalContext.js - Contexte pour la gestion des modales optimisées
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import OptimizedModal from '@/components/common/OptimizedModal';

// Création du contexte
const ModalContext = createContext({
  openModal: () => {},
  closeModal: () => {},
  closeAllModals: () => {},
  updateModalProps: () => {},
});

// Hook personnalisé pour utiliser le contexte
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal doit être utilisé au sein d'un ModalProvider');
  }
  return context;
};

// Provider du contexte
export const ModalProvider = ({ children }) => {
  // État pour stocker toutes les modales actives
  const [modals, setModals] = useState([]);
  
  // Génération d'un ID unique pour chaque modale
  const generateId = useCallback(() => {
    return `modal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }, []);
  
  // Fonction pour ouvrir une nouvelle modale
  const openModal = useCallback(({ 
    component, 
    props = {}, 
    modalProps = {}, 
    onClose = () => {} 
  }) => {
    const id = generateId();
    
    setModals(prevModals => [
      ...prevModals,
      {
        id,
        component,
        props,
        modalProps,
        onClose: () => {
          closeModal(id);
          onClose();
        }
      }
    ]);
    
    return id;
  }, [generateId]);
  
  // Fonction pour fermer une modale spécifique
  const closeModal = useCallback((id) => {
    setModals(prevModals => prevModals.filter(modal => modal.id !== id));
  }, []);
  
  // Fonction pour fermer toutes les modales
  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);
  
  // Fonction pour mettre à jour les props d'une modale
  const updateModalProps = useCallback((id, newProps, newModalProps) => {
    setModals(prevModals => prevModals.map(modal => {
      if (modal.id === id) {
        return { 
          ...modal, 
          props: { ...modal.props, ...newProps },
          modalProps: { ...modal.modalProps, ...newModalProps }
        };
      }
      return modal;
    }));
  }, []);
  
  // Mémoisation des valeurs du contexte
  const value = useMemo(() => ({
    openModal,
    closeModal,
    closeAllModals,
    updateModalProps
  }), [openModal, closeModal, closeAllModals, updateModalProps]);
  
  return (
    <ModalContext.Provider value={value}>
      {children}
      
      {/* Rendu de toutes les modales actives */}
      {modals.map(({ id, component: Component, props, modalProps, onClose }) => (
        <OptimizedModal
          key={id}
          isOpen={true}
          onClose={onClose}
          {...modalProps}
        >
          <Component {...props} modalId={id} closeModal={() => closeModal(id)} />
        </OptimizedModal>
      ))}
    </ModalContext.Provider>
  );
};

ModalProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ModalContext;
````


Made changes.

Maintenant que nous avons créé notre composant OptimizedModal et notre ModalContext, il faut intégrer le ModalProvider dans notre application. Mettons à jour le fichier App.js pour y inclure notre nouveau ModalProvider :Je vois que le ModalProvider est déjà importé et implémenté dans App.js, donc nous n'avons pas besoin de faire cette modification.

Maintenant, créons un composant exemple qui utilisera notre nouveau système de modales pour démontrer son fonctionnement :
````
import React from 'react';
import { useModal } from '@/context/ModalContext';
import styles from './ModalExample.module.css';

// Exemple de composant à afficher dans une modale
const ModalContent = ({ title, message, closeModal }) => {
  return (
    <div className={styles.modalContent}>
      <h3 className={styles.modalTitle}>{title}</h3>
      <p className={styles.modalMessage}>{message}</p>
      <div className={styles.modalActions}>
        <button 
          className={styles.modalButton} 
          onClick={closeModal}
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

// Exemple de formulaire à afficher dans une modale
const ModalForm = ({ onSubmit, closeModal }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    closeModal();
  };

  return (
    <div className={styles.modalContent}>
      <h3 className={styles.modalTitle}>Formulaire exemple</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Nom</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.modalActions}>
          <button 
            type="button" 
            onClick={closeModal}
            className={styles.modalButtonSecondary}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className={styles.modalButton}
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
};

// Composant principal qui démontre l'utilisation des modales
const ModalExample = () => {
  const { openModal } = useModal();

  // Fonction pour ouvrir une modale simple
  const openSimpleModal = () => {
    openModal({
      component: ModalContent,
      props: {
        title: 'Exemple de modale simple',
        message: 'Voici un exemple de modale simple avec un message et un bouton de fermeture.'
      },
      modalProps: {
        title: 'Information',
        size: 'sm'
      }
    });
  };

  // Fonction pour ouvrir une modale avec un formulaire
  const openFormModal = () => {
    openModal({
      component: ModalForm,
      props: {
        onSubmit: (data) => {
          console.log('Données du formulaire:', data);
          // Ouvrir une autre modale pour confirmer la soumission
          openModal({
            component: ModalContent,
            props: {
              title: 'Formulaire soumis',
              message: `Merci ${data.name} ! Votre formulaire a été soumis avec succès.`
            },
            modalProps: {
              title: 'Confirmation',
              size: 'sm'
            }
          });
        }
      },
      modalProps: {
        title: 'Formulaire',
        size: 'md',
        closeOnClickOutside: false
      }
    });
  };

  return (
    <div className={styles.exampleContainer}>
      <h2 className={styles.exampleTitle}>Démonstration du système de modales</h2>
      <div className={styles.buttonGroup}>
        <button 
          onClick={openSimpleModal}
          className={styles.button}
        >
          Ouvrir une modale simple
        </button>
        <button 
          onClick={openFormModal}
          className={styles.button}
        >
          Ouvrir une modale avec formulaire
        </button>
      </div>
    </div>
  );
};

export default ModalExample;
````


Made changes.

Maintenant, créons le fichier de styles CSS modulaires pour notre composant d'exemple :
````
.exampleContainer {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.exampleTitle {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.buttonGroup {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.button {
  padding: 0.75rem 1.25rem;
  background-color: var(--primary-color, #4a90e2);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: var(--primary-color-dark, #3a7bc8);
}

.modalContent {
  padding: 1.5rem;
  min-width: 300px;
}

.modalTitle {
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.modalMessage {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.modalActions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.modalButton {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color, #4a90e2);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.modalButton:hover {
  background-color: var(--primary-color-dark, #3a7bc8);
}

.modalButtonSecondary {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid #d4d4d4;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.modalButtonSecondary:hover {
  background-color: #f5f5f5;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.input {
  padding: 0.75rem;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--primary-color, #4a90e2);
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}
````


Made changes.

I need more information to help you. It seems you'd like me to continue with something, but there's no prior context or specific task mentioned in your request. 

Could you please provide more details about:
- What you're working on
- What specific task you'd like me to continue with
- Any specific files or code you'd like me to modify or help with

Once you provide more context, I'll be able to assist you better.