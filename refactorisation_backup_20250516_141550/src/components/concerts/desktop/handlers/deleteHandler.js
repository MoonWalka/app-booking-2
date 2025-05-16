import firebase from '../../../../firebaseInit';

export const handleDelete = async (id) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer ce concert ?')) {
    try {
      const docRef = firebase.doc(firebase.db, 'concerts', id);
      await firebase.deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du concert:', error);
      return false;
    }
  }
  return false;
};