import {  where  } from '@/firebaseInit';
// Mock de Firestore pour le développement local
// Simule les fonctionnalités de base de Firestore sans connexion à Firebase

// Stockage local des données
const localData = {
  concerts: {},
  lieux: {},
  programmateurs: {},
  forms: {},
  artistes: {},
  structures: {}
};

// Chargement des données depuis localStorage si disponible
const initializeLocalStorage = () => {
  try {
    const savedData = localStorage.getItem('firestore_mock_data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.assign(localData, parsedData);
      console.log('Données locales chargées depuis localStorage');
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données locales:', error);
  }
};

// Sauvegarde des données dans localStorage
const saveToLocalStorage = () => {
  try {
    localStorage.setItem('firestore_mock_data', JSON.stringify(localData));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données locales:', error);
  }
};

// Initialisation au démarrage
initializeLocalStorage();

// Génère un ID unique pour les documents
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Classe DocumentReference
class DocumentReference {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id;
  }

  async get() {
    const data = localData[this.collection]?.[this.id];
    return {
      exists: () => !!data,
      data: () => data || null,
      id: this.id
    };
  }

  async set(data, options = {}) {
    if (!localData[this.collection]) {
      localData[this.collection] = {};
    }
    
    if (options.merge) {
      localData[this.collection][this.id] = {
        ...localData[this.collection][this.id],
        ...data
      };
    } else {
      localData[this.collection][this.id] = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    console.log(`Document ajouté à ${this.collection}: ${JSON.stringify({id: this.id, ...data})}`);
    saveToLocalStorage();
    return { id: this.id };
  }

  async update(data) {
    if (!localData[this.collection]) {
      localData[this.collection] = {};
    }
    
    if (!localData[this.collection][this.id]) {
      localData[this.collection][this.id] = {};
    }
    
    localData[this.collection][this.id] = {
      ...localData[this.collection][this.id],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`Document mis à jour dans ${this.collection}: ${JSON.stringify({id: this.id, ...data})}`);
    saveToLocalStorage();
    return { id: this.id };
  }

  async delete() {
    if (localData[this.collection] && localData[this.collection][this.id]) {
      delete localData[this.collection][this.id];
      console.log(`Document supprimé de ${this.collection}: ${this.id}`);
      saveToLocalStorage();
    }
    return true;
  }
}

// Classe CollectionReference
class CollectionReference {
  constructor(name) {
    this.name = name;
    // Créer la collection si elle n'existe pas
    if (!localData[name]) {
      localData[name] = {};
    }
  }

  doc(id = generateId()) {
    return new DocumentReference(this.name, id);
  }

  async add(data) {
    const id = generateId();
    const docRef = this.doc(id);
    await docRef.set({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { 
      id, 
      get: async () => ({
        exists: () => true,
        data: () => localData[this.name][id],
        id
      }) 
    };
  }

  where(field, operator, value) {
    return new Query(this.name, [{ field, operator, value }]);
  }

  orderBy(field, direction = 'asc') {
    return new Query(this.name, [], [{ field, direction }]);
  }

  limit(limitCount) {
    return new Query(this.name, [], [], limitCount);
  }

  startAfter(snapshot) {
    return new Query(this.name, [], [], null, snapshot);
  }

  async get() {
    return await this.getDocs();
  }

  async getDocs() {
    const docs = Object.entries(localData[this.name] || {}).map(([id, data]) => ({
      id,
      data: () => data,
      exists: () => true
    }));
    return { docs, empty: docs.length === 0 };
  }
}

// Classe Query
class Query {
  constructor(collection, filters = [], orderBys = [], limitCount = null, startAfterDoc = null) {
    this.collection = collection;
    this.filters = filters;
    this.orderBys = orderBys;
    this.limitCount = limitCount;
    this.startAfterDoc = startAfterDoc;
  }

  where(field, operator, value) {
    return new Query(
      this.collection,
      [...this.filters, { field, operator, value }],
      this.orderBys,
      this.limitCount,
      this.startAfterDoc
    );
  }

  orderBy(field, direction = 'asc') {
    return new Query(
      this.collection,
      this.filters,
      [...this.orderBys, { field, direction }],
      this.limitCount,
      this.startAfterDoc
    );
  }

  limit(limitCount) {
    return new Query(
      this.collection,
      this.filters,
      this.orderBys,
      limitCount,
      this.startAfterDoc
    );
  }

  startAfter(snapshot) {
    return new Query(
      this.collection,
      this.filters,
      this.orderBys,
      this.limitCount,
      snapshot
    );
  }

  async get() {
    return await this.getDocs();
  }

  async getDocs() {
    // Filtrer les documents selon les critères
    let docs = Object.entries(localData[this.collection] || {})
      .filter(([id, data]) => {
        if (this.filters.length === 0) return true;
        
        return this.filters.every(filter => {
          const { field, operator, value } = filter;
          const fieldValue = data[field];
          
          switch (operator) {
            case '==': return fieldValue === value;
            case '!=': return fieldValue !== value;
            case '>': return fieldValue > value;
            case '>=': return fieldValue >= value;
            case '<': return fieldValue < value;
            case '<=': return fieldValue <= value;
            case 'array-contains': return Array.isArray(fieldValue) && fieldValue.includes(value);
            case 'array-contains-any': 
              return Array.isArray(fieldValue) && Array.isArray(value) && 
                     value.some(v => fieldValue.includes(v));
            case 'in': 
              return Array.isArray(value) && value.includes(fieldValue);
            case 'not-in': 
              return Array.isArray(value) && !value.includes(fieldValue);
            default: return true;
          }
        });
      })
      .map(([id, data]) => ({
        id,
        data: () => data,
        exists: () => true
      }));
    
    // Trier les documents si nécessaire
    if (this.orderBys.length > 0) {
      docs.sort((a, b) => {
        for (const { field, direction } of this.orderBys) {
          const aValue = a.data()[field];
          const bValue = b.data()[field];
          
          if (aValue === bValue) continue;
          
          const comparison = aValue < bValue ? -1 : 1;
          return direction === 'desc' ? -comparison : comparison;
        }
        return 0;
      });
    }
    
    // Appliquer le startAfter si nécessaire
    if (this.startAfterDoc) {
      const startAfterId = this.startAfterDoc.id;
      const startAfterIndex = docs.findIndex(doc => doc.id === startAfterId);
      if (startAfterIndex !== -1) {
        docs = docs.slice(startAfterIndex + 1);
      }
    }
    
    // Appliquer la limite si nécessaire
    if (this.limitCount !== null) {
      docs = docs.slice(0, this.limitCount);
    }
    
    return { docs, empty: docs.length === 0 };
  }
}

// Fonctions de timestamp
const serverTimestamp = () => new Date().toISOString();

const Timestamp = {
  now: () => ({
    toDate: () => new Date(),
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: (Date.now() % 1000) * 1000000
  }),
  fromDate: (date) => ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000
  })
};

// Fonction getDoc, getDocs, addDoc, etc.
const getDoc = async (docRef) => {
  return await docRef.get();
};

const getDocs = async (queryOrCollectionRef) => {
  return await queryOrCollectionRef.getDocs();
};

const setDoc = async (docRef, data, options) => {
  return await docRef.set(data, options || {});
};

const updateDoc = async (docRef, data) => {
  return await docRef.update(data);
};

const deleteDoc = async (docRef) => {
  return await docRef.delete();
};

const addDoc = async (collectionRef, data) => {
  return await collectionRef.add(data);
};

// Fonctions d'agrégation sur les tableaux
const arrayUnion = (...items) => ({
  type: 'arrayUnion',
  items,
  _apply: (existing) => {
    if (!Array.isArray(existing)) existing = [];
    const newItems = items.filter(item => !existing.includes(item));
    return [...existing, ...newItems];
  }
});

const arrayRemove = (...items) => ({
  type: 'arrayRemove',
  items,
  _apply: (existing) => {
    if (!Array.isArray(existing)) return [];
    return existing.filter(item => !items.includes(item));
  }
});

// Fonction pour créer une collection
const collection = (db, name) => {
  return new CollectionReference(name);
};

// Fonction pour créer une référence à un document
const doc = (dbOrCollectionRef, path, ...segments) => {
  if (path && typeof path === 'string') {
    // Si c'est une CollectionReference
    if (dbOrCollectionRef instanceof CollectionReference) {
      return dbOrCollectionRef.doc(path);
    }
    
    // Si c'est un chemin complet "collection/document"
    const pathParts = [path, ...segments].filter(Boolean);
    if (pathParts.length >= 2) {
      const collectionName = pathParts[0];
      const docId = pathParts[1];
      return new DocumentReference(collectionName, docId);
    }
    
    // Si c'est juste le nom d'une collection
    return new CollectionReference(path);
  }
  
  // Fallback
  return new DocumentReference('unknown', generateId());
};

// Fonction query
const query = (collectionRef, ...queryConstraints) => {
  let result = collectionRef;
  
  for (const constraint of queryConstraints) {
    if (typeof constraint === 'function') {
      result = constraint(result);
    }
  }
  
  return result;
};

// Exportation du mock Firestore et des fonctions API
export const localDB = {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy: (field, direction) => (ref) => ref.orderBy(field, direction),
  limit: (limitCount) => (ref) => ref.limit(limitCount),
  startAfter: (snapshot) => (ref) => ref.startAfter(snapshot),
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
};

// Fonction pour générer des données de test
export const seedLocalData = (resetData = false) => {
  if (resetData) {
    Object.keys(localData).forEach(key => {
      localData[key] = {};
    });
  }
  
  // Lieux
  const lieux = [
    { id: 'lieu1', nom: 'Salle des Fêtes', ville: 'Paris', capacite: 500, type: 'salle' },
    { id: 'lieu2', nom: 'Le Zénith', ville: 'Nantes', capacite: 3000, type: 'salle' },
    { id: 'lieu3', nom: 'Festival Ground', ville: 'Lyon', capacite: 5000, type: 'extérieur' }
  ];
  
  // Programmateurs
  const programmateurs = [
    { id: 'prog1', nom: 'Martin', prenom: 'Julie', email: 'julie@example.com', telephone: '0123456789' },
    { id: 'prog2', nom: 'Dubois', prenom: 'Philippe', email: 'philippe@example.com', telephone: '0987654321' }
  ];
  
  // Artistes
  const artistes = [
    { id: 'art1', nom: 'The Performers', style: 'Rock', origine: 'France' },
    { id: 'art2', nom: 'Jazz Trio', style: 'Jazz', origine: 'Belgique' }
  ];
  
  // Structures
  const structures = [
    { id: 'struct1', nom: 'Production Nord', ville: 'Lille', type: 'producteur' },
    { id: 'struct2', nom: 'Sud Organisation', ville: 'Marseille', type: 'organisateur' }
  ];
  
  // Concerts
  const concerts = [
    { 
      id: 'concert1', 
      titre: 'Concert Rock', 
      date: '2025-06-10', 
      statut: 'confirme', 
      montant: 1500,
      lieuId: 'lieu1',
      artisteId: 'art1',
      programmateurId: 'prog1',
      structureId: 'struct1'
    },
    { 
      id: 'concert2', 
      titre: 'Festival Jazz', 
      date: '2025-07-15', 
      statut: 'contact', 
      montant: 2500,
      lieuId: 'lieu3',
      artisteId: 'art2',
      programmateurId: 'prog2',
      structureId: 'struct2'
    }
  ];
  
  // Ajouter à la base locale
  lieux.forEach(lieu => {
    localData.lieux[lieu.id] = lieu;
  });
  
  programmateurs.forEach(prog => {
    localData.programmateurs[prog.id] = prog;
  });
  
  artistes.forEach(artiste => {
    localData.artistes[artiste.id] = artiste;
  });
  
  structures.forEach(structure => {
    localData.structures[structure.id] = structure;
  });
  
  concerts.forEach(concert => {
    localData.concerts[concert.id] = concert;
  });
  
  // Sauvegarder dans localStorage
  saveToLocalStorage();
  
  console.log('Données locales de démo initialisées');
  return { lieux, programmateurs, artistes, structures, concerts };
};

// Fonction pour réinitialiser la base de données locale
export const resetLocalData = () => {
  Object.keys(localData).forEach(key => {
    localData[key] = {};
  });
  saveToLocalStorage();
  console.log('Base de données locale réinitialisée');
};

// Export de la classe pour usage avancé
export { DocumentReference, CollectionReference, Query };

// Fonctions avancées pour mutations/testing
export const _getRawLocalData = () => ({ ...localData });
export const _importRawData = (data) => {
  Object.assign(localData, data);
  saveToLocalStorage();
};

// Initialiser automatiquement les données de démonstration en mode local
if (process.env.REACT_APP_MODE === 'local' || process.env.NODE_ENV === 'development') {
  console.log('Mode développement détecté - Initialisation des données de démonstration');
  // Vérifier si des données existent déjà
  const hasData = Object.values(localData).some(collection => Object.keys(collection).length > 0);
  if (!hasData) {
    seedLocalData(true);
  }
}
