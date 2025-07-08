import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase-service';
import tachesService from '@/services/tachesService';

/**
 * Service de gestion des contrats
 */
const contratService = {
  /**
   * Sauvegarde ou met à jour un contrat
   * @param {string} dateId - ID du date
   * @param {Object} contratData - Données du contrat
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Object>} Le contrat sauvegardé
   */
  async saveContrat(dateId, contratData, organizationId) {
    try {
      console.log('[ContratService] Sauvegarde du contrat pour date:', dateId);
      
      // Préparer les données du contrat
      const contratToSave = {
        ...contratData,
        dateId,
        organizationId,
        updatedAt: serverTimestamp(),
        // Si c'est une nouvelle création, ajouter createdAt
        ...(contratData.createdAt ? {} : { createdAt: serverTimestamp() }),
        // Statut par défaut si non défini
        status: contratData.status || 'draft',
        // Ajouter les montants au niveau racine pour faciliter l'accès
        montantHT: contratData.negociation?.montantNet || contratData.montantHT || 0,
        montantTTC: contratData.negociation?.montantTTC || contratData.montantTTC || 0,
        // S'assurer que l'entrepriseCode est défini
        entrepriseCode: contratData.entrepriseCode || 'MR' // Utiliser 'MR' pour Meltin Recordz par défaut
      };

      // Utiliser l'ID du date comme ID du contrat pour maintenir la relation 1:1
      const contratRef = doc(db, 'contrats', dateId);
      await setDoc(contratRef, contratToSave, { merge: true });

      console.log('[ContratService] Contrat sauvegardé avec succès');
      
      // Si c'est une nouvelle création de contrat, créer une tâche automatique
      if (!contratData.createdAt && contratData.status === 'draft') {
        try {
          const dateDoc = await getDoc(doc(db, 'dates', dateId));
          const dateData = dateDoc.exists() ? dateDoc.data() : {};
          
          await tachesService.creerTache({
            titre: `Envoyer le contrat à ${contratData.organisateur?.raisonSociale || 'l\'organisateur'}`,
            description: `Le contrat pour ${dateData.titre || 'le date'} a été créé. Il faut maintenant l'envoyer pour signature.`,
            type: 'envoi_document',
            priorite: 'haute',
            dateEcheance: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours
            organizationId,
            dateId,
            contactId: contratData.organisateur?.contactId || null,
            entityType: 'contrat',
            entityId: dateId,
            automatique: true,
            createdBy: contratData.createdBy || null
          });
          console.log('[ContratService] Tâche automatique créée pour l\'envoi du contrat');
        } catch (error) {
          console.error('[ContratService] Erreur création tâche automatique:', error);
        }
      }
      
      // Retourner le contrat sauvegardé avec son ID
      return {
        id: dateId,
        ...contratToSave,
        updatedAt: new Date(),
        createdAt: contratData.createdAt || new Date()
      };
    } catch (error) {
      console.error('[ContratService] Erreur lors de la sauvegarde du contrat:', error);
      throw error;
    }
  },

  /**
   * Récupère un contrat par l'ID du date
   * @param {string} dateId - ID du date
   * @returns {Promise<Object|null>} Le contrat ou null
   */
  async getContratByDate(dateId) {
    try {
      console.log('[ContratService] Récupération du contrat pour date:', dateId);
      
      const contratRef = doc(db, 'contrats', dateId);
      const contratDoc = await getDoc(contratRef);
      
      if (contratDoc.exists()) {
        const contratData = {
          id: contratDoc.id,
          ...contratDoc.data()
        };
        console.log('[ContratService] Contrat trouvé:', contratData);
        return contratData;
      }
      
      console.log('[ContratService] Aucun contrat trouvé pour ce date');
      return null;
    } catch (error) {
      console.error('[ContratService] Erreur lors de la récupération du contrat:', error);
      throw error;
    }
  },

  /**
   * Met à jour un contrat
   * @param {string} contratId - ID du contrat
   * @param {Object} updates - Champs à mettre à jour
   * @returns {Promise<void>}
   */
  async updateContrat(contratId, updates) {
    try {
      console.log('[ContratService] Mise à jour du contrat:', contratId, updates);
      
      const contratRef = doc(db, 'contrats', contratId);
      await updateDoc(contratRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('[ContratService] Contrat mis à jour avec succès');
    } catch (error) {
      console.error('[ContratService] Erreur lors de la mise à jour du contrat:', error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'un contrat
   * @param {string} dateId - ID du date
   * @param {string} status - Nouveau statut ('draft', 'finalized', 'signed')
   * @returns {Promise<void>}
   */
  async updateContratStatus(dateId, status) {
    try {
      console.log('[ContratService] Mise à jour du statut du contrat:', dateId, status);
      
      const contratRef = doc(db, 'contrats', dateId);
      await updateDoc(contratRef, {
        status,
        updatedAt: serverTimestamp(),
        [`${status}At`]: serverTimestamp() // Ex: finalizedAt, signedAt
      });
      
      // Mettre à jour aussi le statut dans le date
      const dateRef = doc(db, 'dates', dateId);
      await updateDoc(dateRef, {
        contratStatus: status,
        contratId: dateId,
        updatedAt: serverTimestamp()
      });
      
      // Créer une tâche automatique si le contrat est signé
      if (status === 'signed') {
        try {
          const dateDoc = await getDoc(dateRef);
          const dateData = dateDoc.exists() ? dateDoc.data() : {};
          const contratDoc = await getDoc(contratRef);
          const contratData = contratDoc.exists() ? contratDoc.data() : {};
          
          await tachesService.creerTache({
            titre: `Créer la facture pour ${contratData.organisateur?.raisonSociale || 'l\'organisateur'}`,
            description: `Le contrat pour ${dateData.titre || 'le date'} a été signé. Il faut maintenant créer la facture.`,
            type: 'facture',
            priorite: 'normale',
            dateEcheance: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
            organizationId: contratData.organizationId,
            dateId,
            contactId: contratData.organisateur?.contactId || null,
            entityType: 'contrat',
            entityId: dateId,
            automatique: true,
            createdBy: contratData.updatedBy || null
          });
          console.log('[ContratService] Tâche automatique créée pour la création de la facture');
        } catch (error) {
          console.error('[ContratService] Erreur création tâche automatique:', error);
        }
      }
      
      console.log('[ContratService] Statut du contrat mis à jour avec succès');
    } catch (error) {
      console.error('[ContratService] Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  /**
   * Finalise un contrat (le verrouille)
   * @param {string} dateId - ID du date
   * @param {string} contratNumber - Numéro de contrat généré
   * @returns {Promise<void>}
   */
  async finalizeContrat(dateId, contratNumber) {
    try {
      console.log('[ContratService] Finalisation du contrat:', dateId);
      
      const contratRef = doc(db, 'contrats', dateId);
      await updateDoc(contratRef, {
        status: 'finalized',
        contratNumber,
        finalizedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Mettre à jour le date
      const dateRef = doc(db, 'dates', dateId);
      await updateDoc(dateRef, {
        contratStatus: 'finalized',
        contratNumber,
        updatedAt: serverTimestamp()
      });
      
      console.log('[ContratService] Contrat finalisé avec succès');
    } catch (error) {
      console.error('[ContratService] Erreur lors de la finalisation:', error);
      throw error;
    }
  },

  /**
   * Récupère tous les contrats d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Array>} Liste des contrats
   */
  async getContratsByOrganization(organizationId) {
    try {
      console.log('[ContratService] Récupération des contrats pour organisation:', organizationId);
      
      const contratsQuery = query(
        collection(db, 'contrats'),
        where('organizationId', '==', organizationId),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(contratsQuery);
      const contrats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('[ContratService] Contrats trouvés:', contrats.length);
      return contrats;
    } catch (error) {
      console.error('[ContratService] Erreur lors de la récupération des contrats:', error);
      throw error;
    }
  },

  /**
   * Génère un numéro de contrat unique
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<string>} Numéro de contrat
   */
  async generateContratNumber(organizationId) {
    try {
      // Format: CONT-YYYY-XXXX (ex: CONT-2024-0001)
      const year = new Date().getFullYear();
      
      // Compter les contrats de l'année en cours
      const startOfYear = new Date(year, 0, 1);
      const contratsQuery = query(
        collection(db, 'contrats'),
        where('organizationId', '==', organizationId),
        where('createdAt', '>=', Timestamp.fromDate(startOfYear))
      );
      
      const snapshot = await getDocs(contratsQuery);
      const count = snapshot.size + 1;
      const number = String(count).padStart(4, '0');
      
      return `CONT-${year}-${number}`;
    } catch (error) {
      console.error('[ContratService] Erreur lors de la génération du numéro:', error);
      // Fallback avec timestamp
      return `CONT-${Date.now()}`;
    }
  },

  /**
   * Valide les données requises pour un contrat
   * @param {Object} contratData - Données du contrat
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validateContratData(contratData) {
    const errors = [];
    const requiredFields = [
      { field: 'organisateur.raisonSociale', label: 'Raison sociale de l\'organisateur' },
      { field: 'organisateur.adresse', label: 'Adresse de l\'organisateur' },
      { field: 'organisateur.codePostal', label: 'Code postal de l\'organisateur' },
      { field: 'organisateur.ville', label: 'Ville de l\'organisateur' },
      { field: 'producteur.raisonSociale', label: 'Nom du producteur' },
      { field: 'negociation.montantNet', label: 'Montant net HT' },
      { field: 'negociation.tauxTva', label: 'Taux de TVA' }
    ];

    requiredFields.forEach(({ field, label }) => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], contratData);
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(label);
      }
    });

    // Validation spécifique pour les montants
    if (contratData.negociation?.montantNet && isNaN(parseFloat(contratData.negociation.montantNet))) {
      errors.push('Le montant net HT doit être un nombre valide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valide seulement les données minimales pour la sauvegarde automatique
   * @param {Object} contratData - Données du contrat
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validateMinimalData(contratData) {
    const errors = [];
    
    // Pour la sauvegarde automatique, on vérifie juste qu'on a au moins quelques données de base
    if (!contratData.organisateur?.raisonSociale && !contratData.producteur?.raisonSociale) {
      errors.push('Au moins l\'organisateur ou le producteur doit être renseigné');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Met à jour le lien vers un devis
   * @param {string} dateId - ID du date/contrat
   * @param {string} devisId - ID du devis
   * @returns {Promise<void>}
   */
  async linkDevis(dateId, devisId) {
    try {
      console.log('[ContratService] Liaison du devis:', devisId, 'au contrat:', dateId);
      
      const contratRef = doc(db, 'contrats', dateId);
      await updateDoc(contratRef, {
        devisId,
        updatedAt: serverTimestamp()
      });
      
      console.log('[ContratService] Devis lié avec succès');
    } catch (error) {
      console.error('[ContratService] Erreur lors de la liaison du devis:', error);
      throw error;
    }
  },

  /**
   * Met à jour le lien vers une facture
   * @param {string} dateId - ID du date/contrat
   * @param {string} factureId - ID de la facture
   * @returns {Promise<void>}
   */
  async linkFacture(dateId, factureId) {
    try {
      console.log('[ContratService] Liaison de la facture:', factureId, 'au contrat:', dateId);
      
      const contratRef = doc(db, 'contrats', dateId);
      await updateDoc(contratRef, {
        factureId,
        updatedAt: serverTimestamp()
      });
      
      console.log('[ContratService] Facture liée avec succès');
    } catch (error) {
      console.error('[ContratService] Erreur lors de la liaison de la facture:', error);
      throw error;
    }
  },

  /**
   * Supprime un contrat
   * @param {string} contratId - ID du contrat à supprimer
   * @returns {Promise<boolean>}
   */
  async deleteContrat(contratId) {
    try {
      console.log('[ContratService] === SUPPRESSION CONTRAT - DÉBUT ===');
      console.log('[ContratService] ID à supprimer:', contratId);
      
      // Vérifier que le contrat existe
      const contratDoc = await getDoc(doc(db, 'contrats', contratId));
      if (!contratDoc.exists()) {
        console.log('[ContratService] ❌ Contrat non trouvé avec ID:', contratId);
        throw new Error('Contrat non trouvé');
      }
      
      // Supprimer le contrat
      await deleteDoc(doc(db, 'contrats', contratId));
      
      console.log('[ContratService] ✅ Contrat supprimé avec succès - ID:', contratId);
      console.log('[ContratService] === SUPPRESSION CONTRAT - FIN ===');
      
      return true;
    } catch (error) {
      console.error('[ContratService] ❌ Erreur lors de la suppression du contrat:', error);
      throw error;
    }
  }
};

export default contratService;