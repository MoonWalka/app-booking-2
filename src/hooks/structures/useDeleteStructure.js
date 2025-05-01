import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook to handle structure deletion operations
 * 
 * @returns {Object} Structure deletion operations and state
 */
export const useDeleteStructure = () => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Handle structure deletion
  const handleDelete = async (structure) => {
    if (!structure || !structure.id) return;
    
    setDeleting(true);
    try {
      // Check if there are associations with programmateurs
      if (structure.programmateursAssocies?.length > 0) {
        // Update programmateurs to remove the reference to this structure
        for (const progId of structure.programmateursAssocies) {
          const progRef = doc(db, 'programmateurs', progId);
          const progDoc = await getDoc(progRef);
          
          if (progDoc.exists()) {
            const progData = progDoc.data();
            
            // If the programmateur has a structureId corresponding to this structure,
            // update to remove this reference
            if (progData.structureId === structure.id) {
              await updateDoc(progRef, {
                structureId: null,
                structureNom: null,
                updatedAt: new Date().toISOString()
              });
            }
          }
        }
      }
      
      // Delete the structure
      await deleteDoc(doc(db, 'structures', structure.id));
      navigate('/structures');
    } catch (error) {
      console.error('Erreur lors de la suppression de la structure:', error);
      alert('Une erreur est survenue lors de la suppression');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return {
    showDeleteModal,
    setShowDeleteModal,
    deleting,
    handleDelete
  };
};

export default useDeleteStructure;