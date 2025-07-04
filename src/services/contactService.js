/**
 * Service de contacts - WRAPPER DE COMPATIBILITÉ
 * Redirige vers le nouveau service relationnel (structures/personnes)
 * À SUPPRIMER une fois tous les composants migrés
 */
import contactServiceRelational from './contactServiceRelational';

const contactService = {
  async getContactsByOrganization(organizationId) {
    try {
      // Utiliser le nouveau service relationnel
      const results = await contactServiceRelational.getAllContacts(organizationId, {
        orderBy: 'nom',
        orderDirection: 'asc'
      });
      return results.all;
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts:', error);
      return [];
    }
  },

  async getContactsByStructure(structureId) {
    try {
      // Cette méthode n'est plus pertinente dans le nouveau système
      // Les personnes liées à une structure sont gérées par les liaisons
      console.warn('getContactsByStructure est obsolète - utiliser le système de liaisons');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts par structure:', error);
      return [];
    }
  },

  async getContactById(contactId) {
    try {
      return await contactServiceRelational.getContactById(contactId);
    } catch (error) {
      console.error('Erreur lors de la récupération du contact:', error);
      return null;
    }
  },

  async createContact(contactData) {
    try {
      // Déterminer le type en fonction des données
      const type = contactData.type || (contactData.structureRaisonSociale ? 'structure' : 'personne');
      const result = await contactServiceRelational.createContact(contactData, type);
      return result.id;
    } catch (error) {
      console.error('Erreur lors de la création du contact:', error);
      throw error;
    }
  },

  async updateContact(contactId, contactData) {
    try {
      // Récupérer d'abord le contact pour connaître son type
      const existingContact = await contactServiceRelational.getContactById(contactId);
      if (!existingContact) {
        throw new Error('Contact non trouvé');
      }
      
      await contactServiceRelational.updateContact(contactId, contactData, existingContact._type);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contact:', error);
      throw error;
    }
  },

  async deleteContact(contactId) {
    try {
      // Récupérer d'abord le contact pour connaître son type
      const existingContact = await contactServiceRelational.getContactById(contactId);
      if (!existingContact) {
        throw new Error('Contact non trouvé');
      }
      
      await contactServiceRelational.deleteContact(contactId, existingContact._type);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du contact:', error);
      throw error;
    }
  }
};

export default contactService;