import { db, doc, deleteDoc } from '@/services/firebase-service';

export const handleDelete = async (id) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
    try {
      const docRef = doc(db, 'artistes', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'artiste:', error);
      return false;
    }
  }
  return false;
};