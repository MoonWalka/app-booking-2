// src/services/firebaseService.js
import { db, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter } from '../firebase';

// Service pour les concerts
export const concertService = {
  getAll: async (limit = 100, startAfter = null, orderByField = 'date', orderDirection = 'desc') => {
    try {
      let q;
      if (startAfter) {
        q = query(collection(db, 'concerts'), orderBy(orderByField, orderDirection), startAfter(startAfter), limit(limit));
      } else {
        q = query(collection(db, 'concerts'), orderBy(orderByField, orderDirection), limit(limit));
      }
      
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        items,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error getting concerts:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const docRef = doc(db, 'concerts', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting concert:', error);
      throw error;
    }
  },
  
  create: async (data) => {
    try {
      const docRef = doc(collection(db, 'concerts'));
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: docRef.id,
        ...data
      };
    } catch (error) {
      console.error('Error creating concert:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      const docRef = doc(db, 'concerts', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      return {
        id,
        ...data
      };
    } catch (error) {
      console.error('Error updating concert:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'concerts', id));
      return true;
    } catch (error) {
      console.error('Error deleting concert:', error);
      throw error;
    }
  },
  
  search: async (field, value, operator = '==') => {
    try {
      const q = query(collection(db, 'concerts'), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error searching concerts:', error);
      throw error;
    }
  }
};

// Service pour les lieux (structure similaire)
export const lieuService = {
  // Méthodes similaires à concertService
  getAll: async (limit = 100) => {
    try {
      const q = query(collection(db, 'lieux'), orderBy('nom'), limit(limit));
      const querySnapshot = await getDocs(q);
      
      return {
        items: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error('Error getting lieux:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const docRef = doc(db, 'lieux', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting lieu:', error);
      throw error;
    }
  }
  // Autres méthodes si nécessaire...
};

// Service pour les programmateurs (structure similaire)
export const programmateurService = {
  // Méthodes similaires à concertService
  getAll: async (limit = 100) => {
    try {
      const q = query(collection(db, 'programmateurs'), orderBy('nom'), limit(limit));
      const querySnapshot = await getDocs(q);
      
      return {
        items: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error('Error getting programmateurs:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const docRef = doc(db, 'programmateurs', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting programmateur:', error);
      throw error;
    }
  }
  // Autres méthodes si nécessaire...
};
