import firebase from '@/firebaseInit';

export const handleDelete = async (id) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
    try {
      const docRef = firebase.doc(firebase.db, 'artistes', id);
      await firebase.deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'artiste:', error);
      return false;
    }
  }
  return false;
};