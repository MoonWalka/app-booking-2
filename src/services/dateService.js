import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase-service';

class DateService {
  /**
   * Récupère les dates d'une structure par son ID
   * @param {string} organizationId - ID de l'organisation
   * @param {string} structureId - ID de la structure
   * @returns {Promise<Array>} Liste des dates
   */
  async getDatesByStructureId(organizationId, structureId) {
    try {
      console.log('🔍 [DateService] getDatesByStructureId appelé avec:', {
        organizationId,
        structureId
      });
      
      // Recherche par structureId d'abord
      console.log('  📋 Requête 1: where organizationId ==', organizationId, 'AND structureId ==', structureId);
      let datesQuery = query(
        collection(db, 'dates'),
        where('organizationId', '==', organizationId),
        where('structureId', '==', structureId)
      );
      
      let datesSnapshot = await getDocs(datesQuery);
      let dates = datesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`  ✅ Résultat requête 1: ${dates.length} dates trouvés avec structureId`);
      if (dates.length > 0) {
        console.log('  📄 Premier date trouvé:', {
          id: dates[0].id,
          structureId: dates[0].structureId,
          structureNom: dates[0].structureNom,
          organisateurId: dates[0].organisateurId,
          organisateurNom: dates[0].organisateurNom
        });
      }
      
      // Si pas de résultats, essayer avec organisateurId (ancienne nomenclature)
      if (dates.length === 0) {
        console.log('  📋 Requête 2: where organizationId ==', organizationId, 'AND organisateurId ==', structureId);
        datesQuery = query(
          collection(db, 'dates'),
          where('organizationId', '==', organizationId),
          where('organisateurId', '==', structureId)
        );
        
        datesSnapshot = await getDocs(datesQuery);
        dates = datesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`  ✅ Résultat requête 2: ${dates.length} dates trouvés avec organisateurId`);
        if (dates.length > 0) {
          console.log('  📄 Premier date trouvé:', {
            id: dates[0].id,
            structureId: dates[0].structureId,
            structureNom: dates[0].structureNom,
            organisateurId: dates[0].organisateurId,
            organisateurNom: dates[0].organisateurNom
          });
        }
      }
      
      console.log(`🏁 [DateService] Retour final: ${dates.length} dates`);
      return dates;
    } catch (error) {
      console.error('Erreur lors du chargement des dates par structureId:', error);
      return [];
    }
  }
  /**
   * R�cup�re les dates d'une structure
   * @param {string} organizationId - ID de l'organisation
   * @param {string} structureName - Nom de la structure
   * @returns {Promise<Array>} Liste des dates
   */
  async getDatesByStructure(organizationId, structureName) {
    try {
      console.log('[DateService] Recherche des dates pour:', { organizationId, structureName });
      
      // Recherche par structureNom d'abord
      let datesQuery = query(
        collection(db, 'dates'),
        where('organizationId', '==', organizationId),
        where('structureNom', '==', structureName)
      );
      
      let datesSnapshot = await getDocs(datesQuery);
      let dates = datesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`[DateService] Trouvé ${dates.length} dates avec structureNom`);
      
      // Si aucun résultat, essayer avec organisateurNom (ancienne nomenclature)
      if (dates.length === 0) {
        console.log('[DateService] Aucun date trouvé avec structureNom, essai avec organisateurNom');
        datesQuery = query(
          collection(db, 'dates'),
          where('organizationId', '==', organizationId),
          where('organisateurNom', '==', structureName)
        );
        
        datesSnapshot = await getDocs(datesQuery);
        dates = datesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`[DateService] Trouvé ${dates.length} dates avec organisateurNom`);
      }
      
      // Si toujours aucun résultat, essayer avec structureRaisonSociale
      if (dates.length === 0) {
        console.log('[DateService] Aucun date trouvé avec organisateurNom, essai avec structureRaisonSociale');
        datesQuery = query(
          collection(db, 'dates'),
          where('organizationId', '==', organizationId),
          where('structureRaisonSociale', '==', structureName)
        );
        
        datesSnapshot = await getDocs(datesQuery);
        dates = datesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`[DateService] Trouvé ${dates.length} dates avec structureRaisonSociale`);
      }
      
      // Si toujours aucun résultat, essayer avec structure.raisonSociale (format imbriqué)
      if (dates.length === 0) {
        console.log('[DateService] Aucun date trouvé, essai avec structure.raisonSociale');
        datesQuery = query(
          collection(db, 'dates'),
          where('organizationId', '==', organizationId),
          where('structure.raisonSociale', '==', structureName)
        );
        
        datesSnapshot = await getDocs(datesQuery);
        dates = datesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`[DateService] Trouvé ${dates.length} dates avec structure.raisonSociale`);
      }
      
      return dates;
    } catch (error) {
      console.error('Erreur lors du chargement des dates:', error);
      return [];
    }
  }
}

export const datesService = new DateService();
export default datesService;