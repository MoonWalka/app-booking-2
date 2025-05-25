import { db, collection, query, orderBy, startAfter, limit, getDocs } from '@/firebaseInit';

export const handleLoadMore = async (lastDoc, pageSize = 10) => {
  try {
    const collectionRef = collection(db, 'artistes');
    const q = query(
      collectionRef,
      orderBy('nom'),
      startAfter(lastDoc),
      limit(pageSize)
    );
    
    const snapshot = await getDocs(q);
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