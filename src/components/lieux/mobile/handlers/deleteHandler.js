import { db, doc, deleteDoc } from '../../../../firebaseInit';

export const handleDelete = async (id) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
    try {
      const docRef = doc(db, 'lieux', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du lieu:', error);
      return false;
    }
  }
  return false;
};