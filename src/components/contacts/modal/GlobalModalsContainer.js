// src/components/contacts/modal/GlobalModalsContainer.js
import React from 'react';
import { useModals } from '@/context/ModalsContext';
import { useTabs } from '@/context/TabsContext';
import StructureCreationModal from './StructureCreationModal';

/**
 * Conteneur global pour toutes les modals de création de contacts
 * Centralisé pour être utilisé dans toute l'application
 */
function GlobalModalsContainer() {
  const { 
    activeModals, 
    closeStructureCreationModal,
    closePersonneCreationModal 
  } = useModals();
  
  const { openContactTab } = useTabs();

  // Callback pour la création de structure
  const handleStructureCreated = (newStructure) => {
    console.log('Structure créée depuis modal globale:', newStructure);
    // Ouvrir l'onglet de la nouvelle structure
    openContactTab(newStructure.id, newStructure.structureRaisonSociale);
    // Fermer la modal
    closeStructureCreationModal();
  };

  // Callback pour la création de personne (à implémenter plus tard)
  const handlePersonneCreated = (newPersonne) => {
    console.log('Personne créée depuis modal globale:', newPersonne);
    // Ouvrir l'onglet de la nouvelle personne
    openContactTab(newPersonne.id, `${newPersonne.prenom} ${newPersonne.nom}`);
    // Fermer la modal
    closePersonneCreationModal();
  };

  return (
    <>
      {/* Modal de création de structure */}
      <StructureCreationModal
        show={activeModals.structureCreation}
        onHide={closeStructureCreationModal}
        onCreated={handleStructureCreated}
      />
      
      {/* Modal de création de personne - à implémenter */}
      {activeModals.personneCreation && (
        <div>
          {/* PersonneCreationModal à créer plus tard */}
          <p>Modal de création de personne (à implémenter)</p>
        </div>
      )}
    </>
  );
}

export default GlobalModalsContainer;