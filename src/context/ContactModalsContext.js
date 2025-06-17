// src/context/ContactModalsContext.js
import React, { createContext, useContext, useState } from 'react';

const ContactModalsContext = createContext();

export const useContactModals = () => {
  const context = useContext(ContactModalsContext);
  if (!context) {
    throw new Error('useContactModals must be used within a ContactModalsProvider');
  }
  return context;
};

export const ContactModalsProvider = ({ children }) => {
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showPersonneModal, setShowPersonneModal] = useState(false);
  const [showDateCreationModal, setShowDateCreationModal] = useState(false);

  const openStructureModal = () => {
    setShowStructureModal(true);
  };

  const closeStructureModal = () => {
    setShowStructureModal(false);
  };

  const openPersonneModal = () => {
    setShowPersonneModal(true);
  };

  const closePersonneModal = () => {
    setShowPersonneModal(false);
  };

  const openDateCreationModal = () => {
    setShowDateCreationModal(true);
  };

  const closeDateCreationModal = () => {
    setShowDateCreationModal(false);
  };

  const value = {
    showStructureModal,
    showPersonneModal,
    showDateCreationModal,
    openStructureModal,
    closeStructureModal,
    openPersonneModal,
    closePersonneModal,
    openDateCreationModal,
    closeDateCreationModal
  };

  return (
    <ContactModalsContext.Provider value={value}>
      {children}
    </ContactModalsContext.Provider>
  );
};

export default ContactModalsContext;