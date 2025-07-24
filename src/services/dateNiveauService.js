import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Service pour gérer les changements automatiques de niveau des dates
 */
const dateNiveauService = {
  /**
   * Met à jour le niveau d'une date si nécessaire
   * @param {string} dateId - ID de la date
   * @param {string} nouveauNiveau - Nouveau niveau à appliquer
   * @param {string} niveauActuel - Niveau actuel (optionnel, pour éviter les régressions)
   */
  async updateNiveau(dateId, nouveauNiveau, niveauActuel = null) {
    try {
      // Hiérarchie des niveaux pour éviter les régressions
      const hierarchie = {
        'incomplete': 1,
        'interet': 2,
        'option': 3,
        'confirme': 4,
        'annule': 5,
        'reporte': 5
      };

      // Si on connait le niveau actuel, on évite les régressions
      if (niveauActuel && hierarchie[niveauActuel] >= hierarchie[nouveauNiveau]) {
        console.log(`[DateNiveauService] Niveau actuel (${niveauActuel}) >= nouveau niveau (${nouveauNiveau}), pas de mise à jour`);
        return false;
      }

      // Mettre à jour le niveau
      await updateDoc(doc(db, 'dates', dateId), {
        niveau: nouveauNiveau,
        updatedAt: new Date()
      });

      console.log(`[DateNiveauService] Niveau mis à jour: ${dateId} -> ${nouveauNiveau}`);
      return true;
    } catch (error) {
      console.error('[DateNiveauService] Erreur lors de la mise à jour du niveau:', error);
      return false;
    }
  },

  /**
   * Vérifie et met à jour le niveau lors de la création d'un devis
   * interet -> option
   */
  async onDevisCreated(dateId, niveauActuel = null) {
    return this.updateNiveau(dateId, 'option', niveauActuel);
  },

  /**
   * Vérifie et met à jour le niveau lors de la création d'un pré-contrat
   * interet -> option
   */
  async onPreContratCreated(dateId, niveauActuel = null) {
    return this.updateNiveau(dateId, 'option', niveauActuel);
  },

  /**
   * Vérifie et met à jour le niveau lors de l'envoi d'un pré-contrat
   * option -> confirme
   */
  async onPreContratEnvoye(dateId, niveauActuel = null) {
    return this.updateNiveau(dateId, 'confirme', niveauActuel);
  }
};

export default dateNiveauService;