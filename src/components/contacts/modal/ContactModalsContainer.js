// src/components/contacts/modal/ContactModalsContainer.js
import React from 'react';
import { useContactModals } from '@/context/ContactModalsContext';
import { useTabs } from '@/context/TabsContext';
import StructureCreationModal from './StructureCreationModal';
import PersonneCreationModal from './PersonneCreationModal';

/**
 * Conteneur global pour les modals de création de contacts
 * Gère les modals de structure et personne de manière centralisée
 */
function ContactModalsContainer() {
  const { 
    showStructureModal, 
    showPersonneModal,
    closeStructureModal,
    closePersonneModal 
  } = useContactModals();
  
  const { openContactTab } = useTabs();

  // Callback pour la création de structure
  const handleStructureCreated = (newStructure) => {
    console.log('Structure créée depuis modal globale:', newStructure);
    // Ouvrir l'onglet de la nouvelle structure
    openContactTab(newStructure.id, newStructure.structureRaisonSociale);
    // Fermer la modal
    closeStructureModal();
  };

  // Callback pour la création de personne
  const handlePersonneCreated = (newPersonne) => {
    console.log('Personne créée depuis modal globale:', newPersonne);
    // Ouvrir l'onglet de la nouvelle personne
    openContactTab(newPersonne.id, `${newPersonne.prenom} ${newPersonne.nom}`);
    // Fermer la modal
    closePersonneModal();
  };

  return (
    <>
      {/* Modal de création de structure */}
      <StructureCreationModal
        show={showStructureModal}
        onHide={closeStructureModal}
        onCreated={handleStructureCreated}
      />
      
      {/* Modal de création de personne */}
      <PersonneCreationModal
        show={showPersonneModal}
        onHide={closePersonneModal}
        onCreated={handlePersonneCreated}
      />
    </>
  );
}

export default ContactModalsContainer;