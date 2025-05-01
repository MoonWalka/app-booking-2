import { useState } from 'react';
import firebase from '@/firebaseInit';

/**
 * Custom hook to handle the deletion of a lieu
 * @param {Function} onDeleteSuccess - Callback to execute after successful deletion
 * @returns {Object} State and methods for lieu deletion
 */
const useLieuDelete = (onDeleteSuccess) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteLieu = async (id, e) => {
    // Prevent propagation so the click doesn't navigate to the venue details
    if (e) {
      e.stopPropagation();
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      setIsDeleting(true);
      try {
        await firebase.deleteDoc(firebase.doc(firebase.db, 'lieux', id));
        
        // Execute success callback if provided
        if (typeof onDeleteSuccess === 'function') {
          onDeleteSuccess(id);
        }

      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        alert('Une erreur est survenue lors de la suppression du lieu');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return {
    isDeleting,
    handleDeleteLieu
  };
};

export default useLieuDelete;