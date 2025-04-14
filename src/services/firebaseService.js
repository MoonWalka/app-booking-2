import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  serverTimestamp 
} from 'firebase/firestore';

// Service générique pour les opérations Firebase
const createService = (collectionName) => {
  return {
    // Récupérer tous les éléments avec pagination
    getAll: async (pageSize = 10, lastVisible = null, orderByField = 'updatedAt', orderDirection = 'desc') => {
      try {
        let q;
        if (lastVisible) {
          q = query(
            collection(db, collectionName),
            orderBy(orderByField, orderDirection),
            startAfter(lastVisible),
            limit(pageSize)
          );
        } else {
          q = query(
            collection(db, collectionName),
            orderBy(orderByField, orderDirection),
            limit(pageSize)
          );
        }
        
        const snapshot = await getDocs(q);
        const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
        
        return {
          items: snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })),
          lastVisible: lastVisibleDoc
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération des ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Récupérer un élément par ID
    getById: async (id) => {
      try {
        const docRef = doc(db, collectionName, id);
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
        console.error(`Erreur lors de la récupération du ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Créer un nouvel élément
    create: async (data) => {
      try {
        const timestamp = serverTimestamp();
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: timestamp,
          updatedAt: timestamp
        });
        
        return {
          id: docRef.id,
          ...data
        };
      } catch (error) {
        console.error(`Erreur lors de la création du ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Mettre à jour un élément
    update: async (id, data) => {
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        
        return {
          id,
          ...data
        };
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Supprimer un élément
    delete: async (id) => {
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        console.error(`Erreur lors de la suppression du ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Rechercher des éléments
    search: async (field, value, operator = '==') => {
      try {
        const q = query(
          collection(db, collectionName),
          where(field, operator, value)
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error(`Erreur lors de la recherche dans ${collectionName}:`, error);
        throw error;
      }
    }
  };
};

// Création des services spécifiques
export const concertService = createService('concerts');
export const programmateurService = createService('programmateurs');
export const lieuService = createService('lieux');
export const formLinkService = createService('formLinks');
