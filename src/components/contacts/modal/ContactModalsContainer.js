// src/components/contacts/modal/ContactModalsContainer.js
import React from 'react';
import { useContactModals } from '@/context/ContactModalsContext';
import { useTabs } from '@/context/TabsContext';
import StructureCreationModal from './StructureCreationModal';
import PersonneCreationModal from './PersonneCreationModal';
import DateCreationModal from '@/components/common/modals/DateCreationModal';

/**
 * Conteneur global pour les modals de création de contacts et autres modales
 * Gère les modals de structure, personne et création de date de manière centralisée
 */
function ContactModalsContainer() {
  const { 
    showStructureModal, 
    showPersonneModal,
    showDateCreationModal,
    closeStructureModal,
    closePersonneModal,
    closeDateCreationModal
  } = useContactModals();
  
  const { openContactTab, openConcertsListTab } = useTabs();

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

  // Callback pour la création de date
  const handleDateCreated = (newDate) => {
    console.log('Date créée depuis modal globale:', newDate);
    // Ouvrir l'onglet des concerts pour voir la nouvelle date
    openConcertsListTab();
    // Fermer la modal
    closeDateCreationModal();
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

      {/* Modal de création de date */}
      <DateCreationModal
        show={showDateCreationModal}
        onHide={closeDateCreationModal}
        onCreated={handleDateCreated}
      />
    </>
  );
}

export default ContactModalsContainer;