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
  writeBatch, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import cacheService from './cacheService';

/**
 * Service pour interagir avec Firestore avec optimisation de performances
 */
class FirestoreService {
  /**
   * Récupère un document par ID avec gestion de cache
   * @param {string} collectionName - Nom de la collection
   * @param {string} documentId - ID du document
   * @param {Array} selectedFields - Liste des champs à récupérer (optionnel)
   * @returns {Promise<Object>} Document récupéré
   */
  async getDocument(collectionName, documentId, selectedFields = []) {
    try {
      // Vérifier si le document est dans le cache
      const cachedDocument = cacheService.getEntity(collectionName, documentId);
      if (cachedDocument) {
        // Si on a demandé des champs spécifiques, filtrer le document
        if (selectedFields && selectedFields.length > 0) {
          const filteredDoc = { id: cachedDocument.id };
          selectedFields.forEach(field => {
            if (cachedDocument[field] !== undefined) {
              filteredDoc[field] = cachedDocument[field];
            }
          });
          return filteredDoc;
        }
        return cachedDocument;
      }
      
      // Si pas en cache, aller chercher dans Firestore
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        
        // Mettre en cache pour les futures requêtes
        cacheService.setEntity(collectionName, documentId, data);
        
        // Filtrer les champs si nécessaire
        if (selectedFields && selectedFields.length > 0) {
          const filteredDoc = { id: data.id };
          selectedFields.forEach(field => {
            if (data[field] !== undefined) {
              filteredDoc[field] = data[field];
            }
          });
          return filteredDoc;
        }
        
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération du document ${documentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Récupère plusieurs documents avec filtrage et gestion de cache
   * @param {string} collectionName - Nom de la collection
   * @param {Object} queryOptions - Options de requête (filtres, tri, etc.)
   * @param {Array} selectedFields - Liste des champs à récupérer (optionnel)
   * @returns {Promise<Array<Object>>} Documents récupérés
   */
  async getDocuments(collectionName, queryOptions = {}, selectedFields = []) {
    try {
      // Construire une clé de cache unique pour cette requête
      const cacheKey = JSON.stringify({
        collection: collectionName,
        options: queryOptions,
        fields: selectedFields
      });
      
      // Vérifier si les résultats sont en cache
      const cachedResults = cacheService.getQueryResults(cacheKey);
      if (cachedResults) {
        return cachedResults;
      }
      
      let queryRef = collection(db, collectionName);
      
      // Construire la requête avec les filtres
      if (queryOptions) {
        const constraints = [];
        
        if (queryOptions.filters) {
          queryOptions.filters.forEach(filter => {
            constraints.push(where(filter.field, filter.operator, filter.value));
          });
        }
        
        if (queryOptions.orderBy) {
          constraints.push(orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
        }
        
        if (queryOptions.limit) {
          constraints.push(limit(queryOptions.limit));
        }
        
        queryRef = query(queryRef, ...constraints);
      }
      
      const querySnapshot = await getDocs(queryRef);
      
      const documents = [];
      querySnapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        
        // Mettre en cache chaque document individuellement
        cacheService.setEntity(collectionName, doc.id, data);
        
        // Filtrer les champs si nécessaire
        let documentToAdd = data;
        if (selectedFields && selectedFields.length > 0) {
          documentToAdd = { id: data.id };
          selectedFields.forEach(field => {
            if (data[field] !== undefined) {
              documentToAdd[field] = data[field];
            }
          });
        }
        
        documents.push(documentToAdd);
      });
      
      // Mettre en cache les résultats de la requête
      cacheService.setQueryResults(cacheKey, documents);
      
      return documents;
    } catch (error) {
      console.error(`Erreur lors de la récupération des documents de ${collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Récupère des documents par lot d'IDs
   * @param {string} collectionName - Nom de la collection
   * @param {Array<string>} ids - Liste des IDs à récupérer
   * @param {Array} selectedFields - Liste des champs à récupérer (optionnel)
   * @returns {Promise<Array<Object>>} Documents récupérés
   */
  async getDocumentsByIds(collectionName, ids, selectedFields = []) {
    if (!ids || ids.length === 0) return [];
    
    try {
      // Vérifier les documents déjà en cache
      const cachedDocs = [];
      const idsToFetch = [];
      
      for (const id of ids) {
        const cachedDoc = cacheService.getEntity(collectionName, id);
        if (cachedDoc) {
          if (selectedFields && selectedFields.length > 0) {
            const filteredDoc = { id: cachedDoc.id };
            selectedFields.forEach(field => {
              if (cachedDoc[field] !== undefined) {
                filteredDoc[field] = cachedDoc[field];
              }
            });
            cachedDocs.push(filteredDoc);
          } else {
            cachedDocs.push(cachedDoc);
          }
        } else {
          idsToFetch.push(id);
        }
      }
      
      // Si tous les documents sont en cache, retourner directement
      if (idsToFetch.length === 0) {
        return cachedDocs;
      }
      
      // Récupérer les documents manquants par lots de 10 (limitation Firebase)
      const fetchedDocs = [];
      
      for (let i = 0; i < idsToFetch.length; i += 10) {
        const batchIds = idsToFetch.slice(i, i + 10);
        
        // Firestore ne supporte pas directement le filtre "in" sur __name__
        // Il faut donc faire plusieurs requêtes
        const batchPromises = batchIds.map(id => this.getDocument(collectionName, id, selectedFields));
        
        const batchResults = await Promise.all(batchPromises);
        fetchedDocs.push(...batchResults.filter(Boolean)); // Filtrer les nulls
      }
      
      // Combiner les résultats du cache et ceux fraîchement récupérés
      return [...cachedDocs, ...fetchedDocs];
    } catch (error) {
      console.error(`Erreur lors de la récupération des documents par IDs dans ${collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Ajoute un nouveau document avec timestamps automatiques
   * @param {string} collectionName - Nom de la collection
   * @param {Object} data - Données du document
   * @returns {Promise<string>} ID du document créé
   */
  async addDocument(collectionName, data) {
    try {
      const collectionRef = collection(db, collectionName);
      
      // Ajouter des timestamps automatiques
      const documentData = {
        ...data,
        dateCreation: serverTimestamp(),
        dateModification: serverTimestamp()
      };
      
      const docRef = await addDoc(collectionRef, documentData);
      
      // Invalider le cache pour cette collection
      cacheService.invalidate(collectionName);
      
      return docRef.id;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'un document à ${collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Met à jour un document existant avec timestamp de modification
   * @param {string} collectionName - Nom de la collection
   * @param {string} documentId - ID du document
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<boolean>} true si succès
   */
  async updateDocument(collectionName, documentId, data) {
    try {
      const docRef = doc(db, collectionName, documentId);
      
      // Ajouter un timestamp de modification
      const updateData = {
        ...data,
        dateModification: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      
      // Invalider le cache pour ce document spécifique
      cacheService.invalidate(collectionName, documentId);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du document ${documentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Supprime un document
   * @param {string} collectionName - Nom de la collection
   * @param {string} documentId - ID du document
   * @returns {Promise<boolean>} true si succès
   */
  async deleteDocument(collectionName, documentId) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      
      // Invalider le cache pour ce document et la collection
      cacheService.invalidate(collectionName, documentId);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du document ${documentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Effectue plusieurs opérations dans une transaction batch
   * @param {Array<Object>} operations - Liste des opérations à effectuer
   * @returns {Promise<boolean>} true si succès
   */
  async batchUpdate(operations) {
    try {
      const batch = writeBatch(db);
      const affectedCollections = new Set();
      
      operations.forEach(operation => {
        const { type, collection: collectionName, id, data } = operation;
        const docRef = doc(db, collectionName, id);
        
        // Enregistrer la collection affectée pour invalider le cache plus tard
        affectedCollections.add(collectionName);
        
        switch (type) {
          case 'add':
            batch.set(docRef, {
              ...data,
              dateCreation: serverTimestamp(),
              dateModification: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...data,
              dateModification: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            throw new Error(`Type d'opération inconnu: ${type}`);
        }
      });
      
      await batch.commit();
      
      // Invalider le cache pour toutes les collections affectées
      affectedCollections.forEach(collectionName => {
        cacheService.invalidate(collectionName);
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'exécution du batch update:', error);
      throw error;
    }
  }
  
  /**
   * Observer les changements d'un document en temps réel
   * @param {string} collectionName - Nom de la collection 
   * @param {string} documentId - ID du document
   * @param {Function} callback - Fonction appelée à chaque changement
   * @param {Array} selectedFields - Champs à inclure dans le résultat
   * @returns {Function} Fonction pour arrêter l'observation
   */
  listenToDocument(collectionName, documentId, callback, selectedFields = []) {
    const docRef = doc(db, collectionName, documentId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        
        // Mettre en cache
        cacheService.setEntity(collectionName, documentId, data);
        
        // Filtrer les champs si demandé
        if (selectedFields && selectedFields.length > 0) {
          const filteredData = { id: data.id };
          selectedFields.forEach(field => {
            if (data[field] !== undefined) {
              filteredData[field] = data[field];
            }
          });
          callback(filteredData);
        } else {
          callback(data);
        }
      } else {
        callback(null);
      }
    }, error => {
      console.error(`Erreur lors de l'écoute du document ${documentId}:`, error);
      callback(null, error);
    });
    
    return unsubscribe;
  }
  
  /**
   * Observer les résultats d'une requête en temps réel
   * @param {string} collectionName - Nom de la collection
   * @param {Object} queryOptions - Options de requête
   * @param {Function} callback - Fonction appelée à chaque changement
   * @param {Array} selectedFields - Champs à inclure dans le résultat
   * @returns {Function} Fonction pour arrêter l'observation
   */
  listenToQuery(collectionName, queryOptions = {}, callback, selectedFields = []) {
    let queryRef = collection(db, collectionName);
    
    // Construire la requête avec les filtres
    if (queryOptions) {
      const constraints = [];
      
      if (queryOptions.filters) {
        queryOptions.filters.forEach(filter => {
          constraints.push(where(filter.field, filter.operator, filter.value));
        });
      }
      
      if (queryOptions.orderBy) {
        constraints.push(orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
      }
      
      if (queryOptions.limit) {
        constraints.push(limit(queryOptions.limit));
      }
      
      queryRef = query(queryRef, ...constraints);
    }
    
    const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        
        // Mettre en cache chaque document
        cacheService.setEntity(collectionName, doc.id, data);
        
        // Filtrer les champs si demandé
        if (selectedFields && selectedFields.length > 0) {
          const filteredData = { id: data.id };
          selectedFields.forEach(field => {
            if (data[field] !== undefined) {
              filteredData[field] = data[field];
            }
          });
          documents.push(filteredData);
        } else {
          documents.push(data);
        }
      });
      
      // Mettre en cache la requête
      const cacheKey = JSON.stringify({
        collection: collectionName,
        options: queryOptions,
        fields: selectedFields
      });
      cacheService.setQueryResults(cacheKey, documents);
      
      callback(documents);
    }, error => {
      console.error(`Erreur lors de l'écoute de la requête sur ${collectionName}:`, error);
      callback([], error);
    });
    
    return unsubscribe;
  }
  
  /**
   * Récupère les statistiques d'utilisation du cache
   * @returns {Object} Statistiques du cache
   */
  getCacheStats() {
    return cacheService.getStats();
  }
  
  /**
   * Réinitialise le cache
   */
  clearCache() {
    cacheService.clear();
  }
}

// Exporter une instance unique du service
const firestoreService = new FirestoreService();
export default firestoreService;
