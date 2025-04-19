import firebase from '../../../../firebase';

export const handleDelete = async (id) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programmateur ?')) {
    try {
      const docRef = firebase.doc(firebase.db, 'programmateurs', id);
      await firebase.deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du programmateur:', error);
      return false;
    }
  }
  return false;
};