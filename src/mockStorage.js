// Mock de Firestore pour le développement local
// Simule les fonctionnalités de base de Firestore sans connexion à Firebase

// Stockage local des données
const localData = {
  concerts: {},
  lieux: {},
  programmateurs: {},
  forms: {}
};

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
    const data = localData[this.collection][this.id];
    return {
      exists: !!data,
      data: () => data,
      id: this.id
    };
  }

  async set(data, options = {}) {
    if (options.merge) {
      localData[this.collection][this.id] = {
        ...localData[this.collection][this.id],
        ...data
      };
    } else {
      localData[this.collection][this.id] = data;
    }
    console.log(`Document ajouté à ${this.collection}: ${JSON.stringify({id: this.id, ...data})}`);
    return { id: this.id };
  }

  async update(data) {
    if (!localData[this.collection][this.id]) {
      localData[this.collection][this.id] = {};
    }
    localData[this.collection][this.id] = {
      ...localData[this.collection][this.id],
      ...data
    };
    console.log(`Document mis à jour dans ${this.collection}: ${JSON.stringify({id: this.id, ...data})}`);
    return { id: this.id };
  }

  async delete() {
    delete localData[this.collection][this.id];
    console.log(`Document supprimé de ${this.collection}: ${this.id}`);
    return true;
  }
}

// Classe CollectionReference
class CollectionReference {
  constructor(name) {
    this.name = name;
  }

  doc(id = generateId()) {
    return new DocumentReference(this.name, id);
  }

  async add(data) {
    const id = generateId();
    const docRef = this.doc(id);
    await docRef.set(data);
    return { id, ...data };
  }

  where(field, operator, value) {
    return new Query(this.name, [{ field, operator, value }]);
  }

  orderBy(field, direction = 'asc') {
    return new Query(this.name, [], [{ field, direction }]);
  }

  async get() {
    const docs = Object.entries(localData[this.name] || {}).map(([id, data]) => ({
      id,
      data: () => data,
      exists: true
    }));
    return { docs, empty: docs.length === 0 };
  }
}

// Classe Query
class Query {
  constructor(collection, filters = [], orderBys = []) {
    this.collection = collection;
    this.filters = filters;
    this.orderBys = orderBys;
  }

  where(field, operator, value) {
    return new Query(
      this.collection,
      [...this.filters, { field, operator, value }],
      this.orderBys
    );
  }

  orderBy(field, direction = 'asc') {
    return new Query(
      this.collection,
      this.filters,
      [...this.orderBys, { field, direction }]
    );
  }

  async get() {
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
            default: return true;
          }
        });
      })
      .map(([id, data]) => ({
        id,
        data: () => data,
        exists: true
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
    
    return { docs, empty: docs.length === 0 };
  }
}

// Exportation du mock Firestore
export const mockFirestore = {
  collection: (name) => new CollectionReference(name)
};
