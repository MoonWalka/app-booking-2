import firebase from '@/firebaseInit';

export const handleLoadMore = async (lastDoc, pageSize = 10) => {
  try {
    const collectionRef = firebase.collection(firebase.db, 'artistes');
    const q = firebase.query(
      collectionRef,
      firebase.orderBy('nom'),
      firebase.startAfter(lastDoc),
      firebase.limit(pageSize)
    );
    
    const snapshot = await firebase.getDocs(q);
    const newDocs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = snapshot.docs.length === pageSize;
    
    return { newDocs, lastVisible, hasMore };
  } catch (error) {
    console.error('Erreur lors du chargement des artistes:', error);
    return { newDocs: [], lastVisible: null, hasMore: false };
  }
};