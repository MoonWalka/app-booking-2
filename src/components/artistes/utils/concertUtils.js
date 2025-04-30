import firebase from '../../../firebaseInit';

export const getNbConcerts = async (artisteId) => {
  try {
    const q = firebase.query(
      firebase.collection(firebase.db, 'concerts'),
      firebase.where('artisteId', '==', artisteId)
    );
    const querySnapshot = await firebase.getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Erreur lors du comptage des concerts:', error);
    return 0;
  }
};

export const filteredArtistes = (artistes, searchTerm) => {
  if (!searchTerm) return artistes;
  
  const term = searchTerm.toLowerCase();
  return artistes.filter(artiste => 
    artiste.nom?.toLowerCase().includes(term) ||
    artiste.genre?.toLowerCase().includes(term) ||
    artiste.ville?.toLowerCase().includes(term)
  );
};