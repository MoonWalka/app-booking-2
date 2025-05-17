import firebase from '../../../firebaseInit';

export const handleLoadMore = async (collectionName, lastDoc, pageSize = 10) => {
  try {
    const collectionRef = firebase.collection(firebase.db, collectionName);
    const q = firebase.query(
      collectionRef,
      firebase.startAfter(lastDoc),
      firebase.limit(pageSize)
    );

    const snapshot = await firebase.getDocs(q);
    const newItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      items: newItems,
      lastVisible: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    return {
      items: [],
      lastVisible: null,
      hasMore: false
    };
  }
};