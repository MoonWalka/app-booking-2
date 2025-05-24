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
    throw new Error('useModal doit être utilisé au sein d\'un ModalProvider');
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
  
  // Fonction pour fermer une modale spécifique
  const closeModal = useCallback((id) => {
    setModals(prevModals => prevModals.filter(modal => modal.id !== id));
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
  }, [generateId, closeModal]);
  
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