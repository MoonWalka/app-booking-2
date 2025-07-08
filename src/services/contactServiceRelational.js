/**
 * Service helper pour le système relationnel de contacts
 * Facilite la recherche dans les collections structures ET personnes
 * NE PAS CONFONDRE avec l'ancien système unifié !
 */
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase-service';

class ContactServiceRelational {
  /**
   * Recherche unifiée dans structures et personnes
   */
  async searchContacts(searchTerm, entrepriseId, options = {}) {
    const results = {
      structures: [],
      personnes: [],
      all: []
    };

    if (!searchTerm || !entrepriseId) return results;

    const searchLower = searchTerm.toLowerCase();

    try {
      // Recherche dans les structures
      const structuresQuery = query(
        collection(db, 'structures'),
        where('entrepriseId', '==', entrepriseId)
      );
      const structuresSnap = await getDocs(structuresQuery);
      
      structuresSnap.forEach(doc => {
        const data = { id: doc.id, ...doc.data(), _type: 'structure' };
        const nom = data.raisonSociale || data.nom || '';
        if (nom.toLowerCase().includes(searchLower)) {
          results.structures.push(data);
          results.all.push(data);
        }
      });

      // Recherche dans les personnes
      const personnesQuery = query(
        collection(db, 'personnes'),
        where('entrepriseId', '==', entrepriseId)
      );
      const personnesSnap = await getDocs(personnesQuery);
      
      personnesSnap.forEach(doc => {
        const data = { id: doc.id, ...doc.data(), _type: 'personne' };
        const fullName = `${data.prenom || ''} ${data.nom || ''}`.toLowerCase();
        if (fullName.includes(searchLower)) {
          results.personnes.push(data);
          results.all.push(data);
        }
      });

      // Trier les résultats
      if (options.sortBy) {
        results.all.sort((a, b) => {
          const aVal = a[options.sortBy] || '';
          const bVal = b[options.sortBy] || '';
          return options.sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
        });
      }

      // Limiter les résultats
      if (options.limit) {
        results.all = results.all.slice(0, options.limit);
        results.structures = results.structures.slice(0, options.limit);
        results.personnes = results.personnes.slice(0, options.limit);
      }

      return results;
    } catch (error) {
      console.error('Erreur recherche contacts unifiée:', error);
      return results;
    }
  }

  /**
   * Récupère un contact par ID (structure ou personne)
   */
  async getContactById(contactId, type = null) {
    if (!contactId) return null;

    try {
      // Si on connaît le type, chercher directement
      if (type === 'structure') {
        const structureDoc = await getDoc(doc(db, 'structures', contactId));
        if (structureDoc.exists()) {
          return { id: structureDoc.id, ...structureDoc.data(), _type: 'structure' };
        }
      } else if (type === 'personne') {
        const personneDoc = await getDoc(doc(db, 'personnes', contactId));
        if (personneDoc.exists()) {
          return { id: personneDoc.id, ...personneDoc.data(), _type: 'personne' };
        }
      } else {
        // Type inconnu, chercher dans les deux collections
        const structureDoc = await getDoc(doc(db, 'structures', contactId));
        if (structureDoc.exists()) {
          return { id: structureDoc.id, ...structureDoc.data(), _type: 'structure' };
        }

        const personneDoc = await getDoc(doc(db, 'personnes', contactId));
        if (personneDoc.exists()) {
          return { id: personneDoc.id, ...personneDoc.data(), _type: 'personne' };
        }

        // Dernière tentative : chercher dans l'ancienne collection contacts
        const oldContactDoc = await getDoc(doc(db, 'contacts', contactId));
        if (oldContactDoc.exists()) {
          const data = oldContactDoc.data();
          return { 
            id: oldContactDoc.id, 
            ...data, 
            _type: data.type || 'unknown',
            _legacy: true 
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur getContactById:', error);
      return null;
    }
  }

  /**
   * Récupère tous les contacts d'une organisation
   */
  async getAllContacts(entrepriseId, options = {}) {
    const results = {
      structures: [],
      personnes: [],
      all: []
    };

    if (!entrepriseId) return results;

    try {
      // Récupérer les structures
      let structuresQuery = query(
        collection(db, 'structures'),
        where('entrepriseId', '==', entrepriseId)
      );

      if (options.orderBy) {
        structuresQuery = query(structuresQuery, orderBy(options.orderBy, options.orderDirection || 'asc'));
      }

      const structuresSnap = await getDocs(structuresQuery);
      structuresSnap.forEach(doc => {
        const data = { id: doc.id, ...doc.data(), _type: 'structure' };
        results.structures.push(data);
        results.all.push(data);
      });

      // Récupérer les personnes
      let personnesQuery = query(
        collection(db, 'personnes'),
        where('entrepriseId', '==', entrepriseId)
      );

      if (options.orderBy) {
        personnesQuery = query(personnesQuery, orderBy(options.orderBy, options.orderDirection || 'asc'));
      }

      const personnesSnap = await getDocs(personnesQuery);
      personnesSnap.forEach(doc => {
        const data = { id: doc.id, ...doc.data(), _type: 'personne' };
        results.personnes.push(data);
        results.all.push(data);
      });

      return results;
    } catch (error) {
      console.error('Erreur getAllContacts:', error);
      return results;
    }
  }

  /**
   * Récupère un contact par son ID (essaie d'abord structures puis personnes)
   */
  async getContactById(contactId, type = null) {
    if (!contactId) {
      throw new Error('ID requis pour récupérer un contact');
    }

    try {
      // Si le type est fourni, on sait directement où chercher
      if (type) {
        const collectionName = type === 'structure' ? 'structures' : 'personnes';
        const docSnap = await getDoc(doc(db, collectionName, contactId));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data(), _type: type };
        }
        return null;
      }

      // Sinon, on essaie d'abord dans structures
      const structureDoc = await getDoc(doc(db, 'structures', contactId));
      if (structureDoc.exists()) {
        return { id: structureDoc.id, ...structureDoc.data(), _type: 'structure' };
      }

      // Puis dans personnes
      const personneDoc = await getDoc(doc(db, 'personnes', contactId));
      if (personneDoc.exists()) {
        return { id: personneDoc.id, ...personneDoc.data(), _type: 'personne' };
      }

      // Si toujours pas trouvé, essayer l'ancienne collection contacts pour la rétrocompatibilité
      const contactDoc = await getDoc(doc(db, 'contacts', contactId));
      if (contactDoc.exists()) {
        const data = contactDoc.data();
        // Déterminer le type basé sur les données
        const isStructure = data.type === 'structure' || data.siret || data.raisonSociale;
        return { 
          id: contactDoc.id, 
          ...data, 
          _type: isStructure ? 'structure' : 'personne',
          _legacy: true 
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur getContactById:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau contact (structure ou personne)
   */
  async createContact(contactData, type) {
    if (!contactData || !type) {
      throw new Error('Données et type requis pour créer un contact');
    }

    const collectionName = type === 'structure' ? 'structures' : 'personnes';
    
    const dataToSave = {
      ...contactData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, collectionName), dataToSave);
      return { id: docRef.id, ...dataToSave, _type: type };
    } catch (error) {
      console.error('Erreur création contact:', error);
      throw error;
    }
  }

  /**
   * Met à jour un contact
   */
  async updateContact(contactId, updates, type) {
    if (!contactId || !updates || !type) {
      throw new Error('ID, données et type requis pour mettre à jour un contact');
    }

    const collectionName = type === 'structure' ? 'structures' : 'personnes';
    
    const dataToUpdate = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    try {
      await updateDoc(doc(db, collectionName, contactId), dataToUpdate);
      return { id: contactId, ...dataToUpdate, _type: type };
    } catch (error) {
      console.error('Erreur mise à jour contact:', error);
      throw error;
    }
  }

  /**
   * Supprime un contact
   */
  async deleteContact(contactId, type) {
    if (!contactId || !type) {
      throw new Error('ID et type requis pour supprimer un contact');
    }

    const collectionName = type === 'structure' ? 'structures' : 'personnes';

    try {
      await deleteDoc(doc(db, collectionName, contactId));
      return true;
    } catch (error) {
      console.error('Erreur suppression contact:', error);
      throw error;
    }
  }

  /**
   * Méthode de compatibilité : recherche comme l'ancien système
   */
  async searchContactsLegacy(searchTerm, entrepriseId) {
    const results = await this.searchContacts(searchTerm, entrepriseId);
    // Retourner dans le format attendu par les anciens composants
    return results.all.map(contact => ({
      ...contact,
      // Mapper les champs pour la compatibilité
      nom: contact._type === 'structure' ? (contact.raisonSociale || contact.nom) : contact.nom,
      displayName: contact._type === 'structure' 
        ? (contact.raisonSociale || contact.nom)
        : `${contact.prenom || ''} ${contact.nom || ''}`.trim(),
      type: contact._type
    }));
  }
}

// Export d'une instance unique
const contactServiceRelational = new ContactServiceRelational();

// Export des méthodes pour la compatibilité
export const searchContacts = (term, orgId) => contactServiceRelational.searchContactsLegacy(term, orgId);
export const getContactById = (id, type) => contactServiceRelational.getContactById(id, type);
export const getAllContacts = (orgId, options) => contactServiceRelational.getAllContacts(orgId, options);
export const createContact = (data, type) => contactServiceRelational.createContact(data, type);
export const updateContact = (id, updates, type) => contactServiceRelational.updateContact(id, updates, type);
export const deleteContact = (id, type) => contactServiceRelational.deleteContact(id, type);

export default contactServiceRelational;