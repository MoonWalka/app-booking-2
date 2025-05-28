import { db, doc, deleteDoc } from '@/services/firebase-service';

export const handleDelete = async (collection, id, confirmMessage = 'Êtes-vous sûr de vouloir supprimer cet élément ?') => {
  if (window.confirm(confirmMessage)) {
    try {
      const docRef = doc(db, collection, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression dans ${collection}:`, error);
      return false;
    }
  }
  return false;
};
