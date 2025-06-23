import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase-service';

class ConcertService {
  /**
   * Récupère les concerts d'une structure par son ID
   * @param {string} organizationId - ID de l'organisation
   * @param {string} structureId - ID de la structure
   * @returns {Promise<Array>} Liste des concerts
   */
  async getConcertsByStructureId(organizationId, structureId) {
    try {
      console.log('[ConcertService] Recherche des concerts par structureId:', { organizationId, structureId });
      
      const concertsQuery = query(
        collection(db, 'concerts'),
        where('organizationId', '==', organizationId),
        where('structureId', '==', structureId)
      );
      
      const concertsSnapshot = await getDocs(concertsQuery);
      const concerts = concertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`[ConcertService] Trouvé ${concerts.length} concerts pour structureId: ${structureId}`);
      return concerts;
    } catch (error) {
      console.error('Erreur lors du chargement des concerts par structureId:', error);
      return [];
    }
  }
  /**
   * R�cup�re les concerts d'une structure
   * @param {string} organizationId - ID de l'organisation
   * @param {string} structureName - Nom de la structure
   * @returns {Promise<Array>} Liste des concerts
   */
  async getConcertsByStructure(organizationId, structureName) {
    try {
      console.log('[ConcertService] Recherche des concerts pour:', { organizationId, structureName });
      
      // Recherche par structureNom d'abord
      let concertsQuery = query(
        collection(db, 'concerts'),
        where('organizationId', '==', organizationId),
        where('structureNom', '==', structureName)
      );
      
      let concertsSnapshot = await getDocs(concertsQuery);
      let concerts = concertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`[ConcertService] Trouvé ${concerts.length} concerts avec structureNom`);
      
      // Si aucun résultat, essayer avec structureRaisonSociale
      if (concerts.length === 0) {
        console.log('[ConcertService] Aucun concert trouvé avec structureNom, essai avec structureRaisonSociale');
        concertsQuery = query(
          collection(db, 'concerts'),
          where('organizationId', '==', organizationId),
          where('structureRaisonSociale', '==', structureName)
        );
        
        concertsSnapshot = await getDocs(concertsQuery);
        concerts = concertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`[ConcertService] Trouvé ${concerts.length} concerts avec structureRaisonSociale`);
      }
      
      // Si toujours aucun résultat, essayer avec structure.raisonSociale (format imbriqué)
      if (concerts.length === 0) {
        console.log('[ConcertService] Aucun concert trouvé, essai avec structure.raisonSociale');
        concertsQuery = query(
          collection(db, 'concerts'),
          where('organizationId', '==', organizationId),
          where('structure.raisonSociale', '==', structureName)
        );
        
        concertsSnapshot = await getDocs(concertsQuery);
        concerts = concertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`[ConcertService] Trouvé ${concerts.length} concerts avec structure.raisonSociale`);
      }
      
      return concerts;
    } catch (error) {
      console.error('Erreur lors du chargement des concerts:', error);
      return [];
    }
  }
}

export const concertsService = new ConcertService();
export default concertsService;