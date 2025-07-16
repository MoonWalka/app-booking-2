// src/components/contacts/modal/ContactModalsContainer.js
import React from 'react';
import { useContactModals } from '@/context/ContactModalsContext';
import { useTabs } from '@/context/TabsContext';
import StructureCreationModal from './StructureCreationModal';
import PersonneCreationModal from './PersonneCreationModal';
import CommentModal from '@/components/common/modals/CommentModal';

/**
 * Conteneur global pour les modals de création de contacts
 * Gère les modals de structure et personne de manière centralisée
 */
function ContactModalsContainer() {
  const { 
    showStructureModal, 
    showPersonneModal,
    showCommentModal,
    commentModalData,
    personneModalData,
    structureModalData,
    closeStructureModal,
    closePersonneModal,
    closeCommentModal
  } = useContactModals();
  
  const { openContactTab } = useTabs();

  // Callback pour la création de structure
  const handleStructureCreated = (newStructure) => {
    console.log('Structure créée depuis modal globale:', newStructure);
    // Ouvrir l'onglet de la nouvelle structure avec le viewType structure
    const displayName = newStructure.raisonSociale || newStructure.structureRaisonSociale || 'Nouvelle structure';
    openContactTab(newStructure.id, displayName, 'structure');
    // Fermer la modal
    closeStructureModal();
  };

  // Callback pour la création de personne
  const handlePersonneCreated = (newPersonne) => {
    console.log('Personne créée depuis modal globale:', newPersonne);
    
    // Si la personne a été créée avec une liaison vers une structure, déclencher un événement de rafraîchissement
    if (newPersonne.structureId || personneModalData?.structureId) {
      const structureId = newPersonne.structureId || personneModalData?.structureId;
      console.log('🔄 Déclenchement du rafraîchissement de la structure:', structureId);
      
      // Déclencher un événement personnalisé pour rafraîchir la structure
      window.dispatchEvent(new CustomEvent('refresh-structure', { 
        detail: { structureId } 
      }));
    }
    
    // Ouvrir l'onglet de la nouvelle personne avec le viewType approprié
    const displayName = `${newPersonne.prenom || ''} ${newPersonne.nom || ''}`.trim() || 'Nouvelle personne';
    const viewType = 'personne';
    openContactTab(newPersonne.id, displayName, viewType);
    // Fermer la modal
    closePersonneModal();
  };

  // Callback pour la sauvegarde d'un commentaire
  const handleCommentSave = async (content, commentId) => {
    // Pour l'instant, juste logger - la logique de sauvegarde sera implémentée dans le composant parent
    console.log('Sauvegarde commentaire:', { content, commentId, data: commentModalData });
    
    // Le parent devra passer une fonction de sauvegarde via commentModalData.onSave
    if (commentModalData?.onSave) {
      await commentModalData.onSave(content, commentId);
    }
  };

  return (
    <>
      {/* Modal de création/édition de structure */}
      <StructureCreationModal
        show={showStructureModal}
        onHide={closeStructureModal}
        onCreated={handleStructureCreated}
        editMode={structureModalData?.editMode || false}
        initialData={structureModalData?.initialData || null}
      />
      
      {/* Modal de création/édition de personne */}
      <PersonneCreationModal
        show={showPersonneModal}
        onHide={closePersonneModal}
        onCreated={handlePersonneCreated}
        structureId={personneModalData?.structureId}
        editMode={personneModalData?.editMode || false}
        initialData={personneModalData?.initialData || null}
      />

      {/* Modal de création/édition de commentaire */}
      <CommentModal
        show={showCommentModal}
        onHide={closeCommentModal}
        onSave={handleCommentSave}
        comment={commentModalData?.comment}
        title={commentModalData?.title}
      />
    </>
  );
}

export default ContactModalsContainer;