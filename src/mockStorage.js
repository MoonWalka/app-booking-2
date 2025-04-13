// Implémentation d'un stockage local simulant Firestore
// Utilisé en développement local uniquement

// Stockage en mémoire pour les collections
const collections = {
  lieux: {},
  programmateurs: {},
  concerts: {},
  forms: {}
};

// Génère un ID aléatoire pour les documents
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Implémentation de l'interface Firestore
export const mockFirestore = {
  collection: (collectionName) => {
    // Crée la collection si elle n'existe pas
    if (!collections[collectionName]) {
      collections[collectionName] = {};
    }

    return {
      doc: (id) => {
        const docId = id || generateId();
        
        return {
          id: docId,
          get: async () => {
            const data = collections[collectionName][docId];
            return {
              id: docId,
              exists: !!data,
              data: () => data || null
            };
          },
          set: async (data, options) => {
            const merge = options && options.merge;
            if (merge && collections[collectionName][docId]) {
              collections[collectionName][docId] = {
                ...collections[collectionName][docId],
                ...data
              };
            } else {
              collections[collectionName][docId] = data;
            }
            console.log(`Document ${merge ? 'mis à jour' : 'ajouté'} à ${collectionName}: ${JSON.stringify({id: docId, ...data})}`);
            return { id: docId };
          },
          update: async (data) => {
            if (collections[collectionName][docId]) {
              collections[collectionName][docId] = {
                ...collections[collectionName][docId],
                ...data
              };
              console.log(`Document mis à jour dans ${collectionName}: ${JSON.stringify({id: docId, ...data})}`);
            } else {
              console.error(`Tentative de mise à jour d'un document inexistant dans ${collectionName}`);
            }
            return { id: docId };
          },
          delete: async () => {
            if (collections[collectionName][docId]) {
              delete collections[collectionName][docId];
              console.log(`Document supprimé de ${collectionName}: ${docId}`);
            }
            return true;
          }
        };
      },
      add: async (data) => {
        const docId = generateId();
        collections[collectionName][docId] = data;
        console.log(`Document ajouté à ${collectionName}: ${JSON.stringify({id: docId, ...data})}`);
        return { id: docId };
      },
      where: (field, operator, value) => {
        return {
          get: async () => {
            const results = Object.entries(collections[collectionName])
              .filter(([_, data]) => {
                if (operator === '==') {
                  return data[field] === value;
                } else if (operator === '!=') {
                  return data[field] !== value;
                } else if (operator === '>') {
                  return data[field] > value;
                } else if (operator === '>=') {
                  return data[field] >= value;
                } else if (operator === '<') {
                  return data[field] < value;
                } else if (operator === '<=') {
                  return data[field] <= value;
                }
                return false;
              })
              .map(([id, data]) => ({
                id,
                data: () => data
              }));
            
            return {
              docs: results,
              empty: results.length === 0,
              size: results.length
            };
          }
        };
      },
      orderBy: (field, direction = 'asc') => {
        return {
          get: async () => {
            const results = Object.entries(collections[collectionName])
              .map(([id, data]) => ({
                id,
                data: () => data,
                sortValue: data[field]
              }))
              .sort((a, b) => {
                if (direction === 'asc') {
                  return a.sortValue > b.sortValue ? 1 : -1;
                } else {
                  return a.sortValue < b.sortValue ? 1 : -1;
                }
              })
              .map(({ id, data }) => ({
                id,
                data
              }));
            
            return {
              docs: results,
              empty: results.length === 0,
              size: results.length
            };
          },
          where: (field, operator, value) => {
            // Support chaîné pour orderBy().where()
            return mockFirestore.collection(collectionName).where(field, operator, value);
          }
        };
      },
      get: async () => {
        const results = Object.entries(collections[collectionName])
          .map(([id, data]) => ({
            id,
            data: () => data
          }));
        
        return {
          docs: results,
          empty: results.length === 0,
          size: results.length
        };
      }
    };
  }
};
