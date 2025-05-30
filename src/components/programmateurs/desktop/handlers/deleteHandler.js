import { db, doc, deleteDoc } from '@/services/firebase-service';

export const handleDelete = async (id) => {
  try {
    const docRef = doc(db, 'programmateurs', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du programmateur:', error);
    return false;
  }
};