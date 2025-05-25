// src/hooks/artistes/useHandleDeleteArtist.js
import { doc, deleteDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Custom hook to handle artist deletion
 * @param {Function} setArtistes - State setter for artistes list
 * @param {Function} setStats - State setter for statistics
 * @returns {Object} - Delete handler function
 */
export const useHandleDeleteArtist = (setArtistes, setStats) => {
  /**
   * Delete an artist and update the UI
   * @param {string} id - Artist ID to delete
   * @param {Event} event - Click event (optional)
   */
  const handleDelete = async (id, event) => {
    if (event) {
      event.stopPropagation(); // Prevent event propagation
      event.preventDefault(); // Prevent navigation
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      try {
        await deleteDoc(doc(db, 'artistes', id));
        
        // Update the UI
        setArtistes(prevArtistes => {
          const deletedArtiste = prevArtistes.find(artiste => artiste.id === id);
          const hasAssociatedConcerts = deletedArtiste?.concertsAssocies?.length > 0;
          
          // Update statistics if needed
          setStats(prev => ({
            total: Math.max(0, prev.total - 1),
            avecConcerts: hasAssociatedConcerts ? Math.max(0, prev.avecConcerts - 1) : prev.avecConcerts,
            sansConcerts: !hasAssociatedConcerts ? Math.max(0, prev.sansConcerts - 1) : prev.sansConcerts,
          }));
          
          return prevArtistes.filter(artiste => artiste.id !== id);
        });
      } catch (error) {
        console.error('Error deleting artist:', error);
        alert('Une erreur est survenue lors de la suppression de l\'artiste');
      }
    }
  };

  return { handleDelete };
};

export default useHandleDeleteArtist;