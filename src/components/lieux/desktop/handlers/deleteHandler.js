import firebase from '../../../../firebase';

export const handleDelete = async (id) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
    try {
      const docRef = firebase.doc(firebase.db, 'lieux', id);
      await firebase.deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du lieu:', error);
      return false;
    }
  }
  return false;
};