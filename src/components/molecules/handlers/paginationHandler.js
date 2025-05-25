import { db, collection, query, startAfter, limit, getDocs } from '../../../services/firebase-service';

export const handleLoadMore = async (collectionName, lastDoc, pageSize = 10) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(
      collectionRef,
      startAfter(lastDoc),
      limit(pageSize)
    );

    const snapshot = await getDocs(q);
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