import React from 'react';
import { useNavigate } from 'react-router-dom';
import GenericDetailView from '../common/GenericDetailView';
import ConfirmationModal from '../ui/ConfirmationModal';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase-service';
import { useState } from 'react';

/**
 * Version refactorisée d'ArtisteDetail utilisant GenericDetailView
 * Démontre la simplicité de la nouvelle approche
 */
const ArtisteDetailRefactored = () => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [artisteToDelete, setArtisteToDelete] = useState(null);
  
  const handleEdit = (artiste) => {
    navigate(`/artistes/${artiste.id}/edit`);
  };
  
  const handleDelete = (artiste) => {
    setArtisteToDelete(artiste);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!artisteToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'artistes', artisteToDelete.id));
      navigate('/artistes');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'artiste');
    } finally {
      setShowDeleteModal(false);
      setArtisteToDelete(null);
    }
  };
  
  return (
    <>
      <GenericDetailView
        entityType="artiste"
        onEdit={handleEdit}
        onDelete={handleDelete}
        depth={1}
      />
      
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Supprimer l'artiste"
          message={`Êtes-vous sûr de vouloir supprimer ${artisteToDelete?.nom || 'cet artiste'} ?`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
        />
      )}
    </>
  );
};

export default ArtisteDetailRefactored;