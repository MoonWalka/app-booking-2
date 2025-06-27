import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

const contactService = {
  async getContactsByOrganization(organizationId) {
    try {
      const contactsRef = collection(db, 'contacts');
      const q = query(
        contactsRef, 
        where('organizationId', '==', organizationId),
        orderBy('nom', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts:', error);
      return [];
    }
  },

  async getContactsByStructure(structureId) {
    try {
      const contactsRef = collection(db, 'contacts');
      const q = query(
        contactsRef, 
        where('structureId', '==', structureId),
        orderBy('nom', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts par structure:', error);
      return [];
    }
  },

  async getContactById(contactId) {
    try {
      const contactDoc = await getDoc(doc(db, 'contacts', contactId));
      if (contactDoc.exists()) {
        return {
          id: contactDoc.id,
          ...contactDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du contact:', error);
      return null;
    }
  },

  async createContact(contactData) {
    try {
      const docRef = await addDoc(collection(db, 'contacts'), {
        ...contactData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du contact:', error);
      throw error;
    }
  },

  async updateContact(contactId, contactData) {
    try {
      await updateDoc(doc(db, 'contacts', contactId), {
        ...contactData,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contact:', error);
      throw error;
    }
  },

  async deleteContact(contactId) {
    try {
      await deleteDoc(doc(db, 'contacts', contactId));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du contact:', error);
      throw error;
    }
  }
};

export default contactService;