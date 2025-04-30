import { collection, query, orderBy, startAfter, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseInit';

export const handleLoadMore = async (collectionName, lastDoc, orderByField = 'nom', pageSize = 10) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(
      collectionRef,
      orderBy(orderByField),
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
    console.error(`Erreur lors du chargement de ${collectionName}:`, error);
    return { newDocs: [], lastVisible: null, hasMore: false };
  }
};


