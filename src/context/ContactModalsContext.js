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
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentModalData, setCommentModalData] = useState(null);
  const [personneModalData, setPersonneModalData] = useState(null);
  const [structureModalData, setStructureModalData] = useState(null);

  const openStructureModal = (data = null) => {
    setStructureModalData(data);
    setShowStructureModal(true);
  };

  const closeStructureModal = () => {
    setShowStructureModal(false);
    setStructureModalData(null);
  };

  const openPersonneModal = (data = null) => {
    setPersonneModalData(data);
    setShowPersonneModal(true);
  };

  const closePersonneModal = () => {
    setShowPersonneModal(false);
    setPersonneModalData(null);
  };

  const openCommentModal = (data = null) => {
    setCommentModalData(data);
    setShowCommentModal(true);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCommentModalData(null);
  };

  const value = {
    showStructureModal,
    showPersonneModal,
    showCommentModal,
    commentModalData,
    personneModalData,
    structureModalData,
    openStructureModal,
    closeStructureModal,
    openPersonneModal,
    closePersonneModal,
    openCommentModal,
    closeCommentModal
  };

  return (
    <ContactModalsContext.Provider value={value}>
      {children}
    </ContactModalsContext.Provider>
  );
};

export default ContactModalsContext;