import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase-service';

class ConcertService {
  /**
   * Récupère les concerts d'une structure
   * @param {string} organizationId - ID de l'organisation
   * @param {string} structureName - Nom de la structure
   * @returns {Promise<Array>} Liste des concerts
   */
  async getConcertsByStructure(organizationId, structureName) {
    try {
      const concertsQuery = query(
        collection(db, 'concerts'),
        where('organizationId', '==', organizationId),
        where('structureNom', '==', structureName)
      );
      
      const concertsSnapshot = await getDocs(concertsQuery);
      return concertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des concerts:', error);
      return [];
    }
  }
}

export const concertsService = new ConcertService();
export default concertsService;