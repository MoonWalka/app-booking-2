// src/context/ModalsContext.js
import React, { createContext, useContext, useState } from 'react';

const ModalsContext = createContext();

export const useModals = () => {
  const context = useContext(ModalsContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalsProvider');
  }
  return context;
};

export const ModalsProvider = ({ children }) => {
  const [activeModals, setActiveModals] = useState({
    structureCreation: false,
    personneCreation: false
  });

  const openStructureCreationModal = () => {
    setActiveModals(prev => ({ ...prev, structureCreation: true }));
  };

  const closeStructureCreationModal = () => {
    setActiveModals(prev => ({ ...prev, structureCreation: false }));
  };

  const openPersonneCreationModal = () => {
    setActiveModals(prev => ({ ...prev, personneCreation: true }));
  };

  const closePersonneCreationModal = () => {
    setActiveModals(prev => ({ ...prev, personneCreation: false }));
  };

  const value = {
    activeModals,
    openStructureCreationModal,
    closeStructureCreationModal,
    openPersonneCreationModal,
    closePersonneCreationModal
  };

  return (
    <ModalsContext.Provider value={value}>
      {children}
    </ModalsContext.Provider>
  );
};

export default ModalsContext;