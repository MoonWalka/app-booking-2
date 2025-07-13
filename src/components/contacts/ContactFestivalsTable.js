import React, { useState } from 'react';
import FestivalsTableView from '../festivals/FestivalsTableView';
import FestivalCreationModal from './FestivalCreationModal';
import { useContactFestivals } from '@/hooks/contacts/useContactFestivals';

/**
 * Composant wrapper pour afficher les festivals d'un contact dans l'onglet festival
 */
const ContactFestivalsTable = ({ contactId, contactName }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null);
  
  console.log('[ContactFestivalsTable] Props reçues:', { contactId, contactName });
  
  const { festivals, loading } = useContactFestivals(contactId);
  
  console.log('[ContactFestivalsTable] Festivals récupérés:', festivals.length, 'festivals');

  const handleEdit = (festival) => {
    // TODO: Implémenter la modification d'un festival
    console.log('Éditer le festival:', festival);
    // Pour l'instant, on peut réutiliser le modal de création en mode édition
    setEditingFestival(festival);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingFestival(null);
  };

  return (
    <>
      <FestivalsTableView 
        festivals={festivals}
        loading={loading}
        onEdit={handleEdit}
      />

      {showCreateModal && (
        <FestivalCreationModal
          show={showCreateModal}
          onHide={handleCloseModal}
          contactId={contactId}
          contactName={contactName}
          editingFestival={editingFestival}
        />
      )}
    </>
  );
};

export default ContactFestivalsTable;