/**
 * @fileoverview Service de gestion des relances automatiques
 * Gère la création, validation et suppression automatique des relances
 * en fonction du cycle de vie des concerts et formulaires
 * 
 * @author TourCraft Team
 * @since 2025
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  serverTimestamp 
} from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { areAutomaticRelancesDisabled } from '@/utils/fixRelancesLoop';
import { 
  areRelancesEnabled, 
  shouldIgnoreUpdate, 
  debugLog,
  RELANCES_CONFIG 
} from '@/config/relancesAutomatiquesConfig';

/**
 * Types de relances automatiques avec leurs conditions de déclenchement
 */
export const RELANCE_TYPES = {
  ENVOYER_FORMULAIRE: {
    id: 'envoyer_formulaire',
    nom: 'Envoyer le formulaire',
    description: 'Envoyer le formulaire de validation au contact',
    priorite: 'haute',
    couleur: 'warning',
    conditions: {
      concert_cree: true,
      formulaire_envoye: false
    }
  },
  VALIDER_FORMULAIRE: {
    id: 'valider_formulaire',
    nom: 'Valider le formulaire',
    description: 'Valider les informations reçues dans le formulaire',
    priorite: 'haute',
    couleur: 'info',
    conditions: {
      formulaire_recu: true,
      formulaire_valide: false
    }
  },
  ENVOYER_CONTRAT: {
    id: 'envoyer_contrat',
    nom: 'Envoyer le contrat',
    description: 'Générer et envoyer le contrat au contact',
    priorite: 'haute',
    couleur: 'primary',
    conditions: {
      formulaire_valide: true,
      contrat_envoye: false
    }
  },
  ENVOYER_FACTURE: {
    id: 'envoyer_facture',
    nom: 'Envoyer la facture',
    description: 'Générer et envoyer la facture (fonctionnalité à venir)',
    priorite: 'moyenne',
    couleur: 'success',
    conditions: {
      contrat_signe: true,
      facture_envoyee: false
    },
    futur: true // Indique que cette fonctionnalité n'est pas encore disponible
  }
};

/**
 * Service principal de gestion des relances automatiques
 */
class RelancesAutomatiquesService {
  constructor() {
    // Map pour stocker les dernières évaluations et éviter les doublons
    this._lastEvaluations = new Map();
    
    // Nettoyer la map toutes les 10 minutes
    setInterval(() => {
      const now = Date.now();
      const tenMinutesAgo = now - 10 * 60 * 1000;
      
      for (const [key, timestamp] of this._lastEvaluations.entries()) {
        if (timestamp < tenMinutesAgo) {
          this._lastEvaluations.delete(key);
        }
      }
    }, 10 * 60 * 1000);
  }
  
  /**
   * Évalue l'état actuel d'un concert et détermine quelles relances automatiques
   * doivent être créées, mises à jour ou supprimées
   * 
   * @param {Object} concert - Données du concert
   * @param {Object} formulaireData - Données du formulaire associé (optionnel)
   * @param {Object} contratData - Données du contrat associé (optionnel)
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<void>}
   */
  async evaluerEtMettreAJourRelances(concert, formulaireData = null, contratData = null, organizationId) {
    try {
      debugLog('🔄 Évaluation des relances automatiques pour le concert:', concert.id);
      
      // Vérifier si les relances sont activées
      if (!areRelancesEnabled()) {
        debugLog('⏸️ Relances automatiques désactivées globalement');
        return;
      }
      
      // Vérifier si les relances automatiques sont temporairement désactivées
      if (areAutomaticRelancesDisabled(organizationId)) {
        debugLog('⏸️ Relances automatiques temporairement désactivées');
        return;
      }
      
      // Protection contre les appels multiples rapprochés
      const evaluationKey = `relance_eval_${concert.id}`;
      const lastEvaluation = this._lastEvaluations.get(evaluationKey);
      const now = Date.now();
      
      if (lastEvaluation && (now - lastEvaluation) < RELANCES_CONFIG.evaluationCooldown) {
        debugLog(`⏩ Évaluation ignorée (cooldown de ${RELANCES_CONFIG.evaluationCooldown}ms non écoulé)`);
        return;
      }
      
      this._lastEvaluations.set(evaluationKey, now);
      
      // Ignorer si c'est une mise à jour automatique
      if (shouldIgnoreUpdate(concert._lastUpdateType)) {
        debugLog('⏩ Évaluation ignorée (type de mise à jour ignoré):', concert._lastUpdateType);
        return;
      }
      
      // Évaluer l'état actuel du concert
      const etatConcert = this._evaluerEtatConcert(concert, formulaireData, contratData);
      console.log('📊 État du concert:', etatConcert);
      
      // Récupérer les relances automatiques existantes pour ce concert
      const relancesExistantes = await this._getRelancesAutomatiques(concert.id, organizationId);
      console.log('📋 Relances existantes:', relancesExistantes.length);
      
      // Pour chaque type de relance, vérifier si elle doit être créée/supprimée
      for (const [typeId, typeConfig] of Object.entries(RELANCE_TYPES)) {
        // Ignorer les fonctionnalités futures
        if (typeConfig.futur) {
          console.log(`⏳ Type de relance "${typeConfig.nom}" reporté (fonctionnalité future)`);
          continue;
        }
        
        const relanceExistante = relancesExistantes.find(r => r.type === typeId);
        const doitExister = this._verifierConditions(typeConfig.conditions, etatConcert);
        
        console.log(`🔍 Type: ${typeId} | Doit exister: ${doitExister} | Existe déjà: ${!!relanceExistante} | Terminée: ${relanceExistante?.terminee || 'N/A'}`);
        
        if (doitExister && !relanceExistante) {
          // Créer une nouvelle relance automatique
          console.log(`➕ Création nécessaire pour: ${typeConfig.nom}`);
          await this._creerRelanceAutomatique(concert, typeConfig, organizationId);
        } else if (!doitExister && relanceExistante && !relanceExistante.terminee) {
          // Marquer la relance comme terminée automatiquement
          console.log(`✅ Validation automatique de: ${typeConfig.nom}`);
          await this._terminerRelanceAutomatique(relanceExistante.id, `Action "${typeConfig.nom}" effectuée automatiquement`);
        } else if (doitExister && relanceExistante) {
          console.log(`⏩ Relance "${typeConfig.nom}" déjà existante et conforme`);
        } else {
          console.log(`⏭️ Aucune action nécessaire pour: ${typeConfig.nom}`);
        }
      }
      
      console.log('✅ Évaluation des relances automatiques terminée');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'évaluation des relances automatiques:', error);
      throw error;
    }
  }
  
  /**
   * Évalue l'état actuel d'un concert en analysant ses données
   * et celles des éléments associés
   * 
   * @private
   * @param {Object} concert - Données du concert
   * @param {Object|null} formulaireData - Données du formulaire
   * @param {Object|null} contratData - Données du contrat
   * @returns {Object} État évalué du concert
   */
  _evaluerEtatConcert(concert, formulaireData, contratData) {
    const etat = {
      concert_cree: !!concert,
      formulaire_envoye: false,
      formulaire_recu: false,
      formulaire_valide: false,
      contrat_genere: false,
      contrat_envoye: false,
      contrat_signe: false,
      facture_envoyee: false
    };
    
    // Analyser l'état du formulaire
    if (formulaireData) {
      etat.formulaire_envoye = true;
      etat.formulaire_recu = !!formulaireData.dateReponse;
      etat.formulaire_valide = formulaireData.statut === 'valide';
    }
    
    // Analyser l'état du contrat
    if (contratData) {
      etat.contrat_genere = true;
      etat.contrat_envoye = !!contratData.dateEnvoi;
      etat.contrat_signe = contratData.status === 'signed';
    }
    
    // Analyser les champs du concert pour déduire d'autres états
    // Si le concert a des informations complètes, on peut supposer que le formulaire a été traité
    const champsEssentiels = ['titre', 'date', 'lieuId', 'artisteId', 'contactId'];
    const champsCompletes = champsEssentiels.filter(champ => !!concert[champ]);
    
    // Concert incomplet et pas de formulaire connu = besoin d'envoyer le formulaire
    if (champsCompletes.length < champsEssentiels.length && !formulaireData) {
      etat.formulaire_envoye = false;
    }
    
    // Si le concert a été validé via formulaire, marquer comme traité
    if (concert.formValidated) {
      etat.formulaire_envoye = true;
      etat.formulaire_recu = true;
      etat.formulaire_valide = true;
    }
    
    return etat;
  }
  
  /**
   * Vérifie si les conditions d'une relance sont remplies
   * 
   * @private
   * @param {Object} conditions - Conditions à vérifier
   * @param {Object} etatConcert - État actuel du concert
   * @returns {boolean} True si toutes les conditions sont remplies
   */
  _verifierConditions(conditions, etatConcert) {
    return Object.entries(conditions).every(([cle, valeurAttendue]) => {
      const valeurActuelle = etatConcert[cle];
      return valeurActuelle === valeurAttendue;
    });
  }
  
  /**
   * Récupère les relances automatiques existantes pour un concert
   * 
   * @private
   * @param {string} concertId - ID du concert
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Array>} Liste des relances automatiques
   */
  async _getRelancesAutomatiques(concertId, organizationId) {
    try {
      console.log(`🔍 Recherche relances automatiques pour concert: ${concertId}, org: ${organizationId}`);
      
      const q = query(
        collection(db, 'relances'),
        where('concertId', '==', concertId),
        where('organizationId', '==', organizationId),
        where('automatique', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const relances = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📋 Trouvé ${relances.length} relances automatiques existantes:`, relances.map(r => `${r.type} (${r.id})`));
      
      return relances;
    } catch (error) {
      console.error('Erreur lors de la récupération des relances automatiques:', error);
      return [];
    }
  }
  
  /**
   * Crée une nouvelle relance automatique
   * 
   * @private
   * @param {Object} concert - Données du concert
   * @param {Object} typeConfig - Configuration du type de relance
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<string>} ID de la relance créée
   */
  async _creerRelanceAutomatique(concert, typeConfig, organizationId) {
    try {
      console.log(`🆕 Création de la relance automatique: ${typeConfig.nom}`);
      
      const relanceData = {
        nom: typeConfig.nom,
        description: typeConfig.description,
        // Champs pour la compatibilité avec les relances manuelles
        entityType: 'concert',
        entityId: concert.id,
        entityName: concert.titre || 'Concert sans titre',
        // Champs spécifiques aux concerts (pour rétrocompatibilité)
        concertId: concert.id,
        concertTitre: concert.titre || 'Concert sans titre',
        priorite: typeConfig.priorite,
        couleur: typeConfig.couleur,
        type: typeConfig.id,
        automatique: true,
        terminee: false,
        // Champ status pour compatibilité avec le filtrage des relances manuelles
        status: 'pending',
        dateCreation: serverTimestamp(),
        dateEcheance: this._calculerDateEcheance(concert, typeConfig),
        organizationId: organizationId,
        metadata: {
          concertDate: concert.date,
          artisteNom: concert.artisteNom || concert.artiste?.nom,
          lieuNom: concert.lieuNom || concert.lieu?.nom
        }
      };
      
      const docRef = await addDoc(collection(db, 'relances'), relanceData);
      console.log(`✅ Relance automatique créée: ${docRef.id}`);
      
      // Ajouter la relance à la liste des relances du concert
      await this._ajouterRelanceAuConcert(concert.id, docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('Erreur lors de la création de la relance automatique:', error);
      throw error;
    }
  }
  
  /**
   * Marque une relance automatique comme terminée
   * 
   * @private
   * @param {string} relanceId - ID de la relance
   * @param {string} commentaire - Commentaire de fin
   * @returns {Promise<void>}
   */
  async _terminerRelanceAutomatique(relanceId, commentaire) {
    try {
      console.log(`✅ Validation automatique de la relance: ${relanceId}`);
      
      await updateDoc(doc(db, 'relances', relanceId), {
        terminee: true,
        status: 'completed',
        dateTerminee: serverTimestamp(),
        commentaireFin: commentaire,
        termineeAutomatiquement: true
      });
      
      console.log(`✅ Relance ${relanceId} marquée comme terminée automatiquement`);
      
    } catch (error) {
      console.error('Erreur lors de la validation automatique de la relance:', error);
      throw error;
    }
  }
  
  /**
   * Calcule la date d'échéance pour une relance en fonction du type et du concert
   * 
   * @private
   * @param {Object} concert - Données du concert
   * @param {Object} typeConfig - Configuration du type de relance
   * @returns {Date} Date d'échéance calculée
   */
  _calculerDateEcheance(concert, typeConfig) {
    const maintenant = new Date();
    
    // Par défaut, échéance dans 7 jours
    let delaiJours = 7;
    
    // Ajuster le délai en fonction du type de relance
    switch (typeConfig.id) {
      case 'envoyer_formulaire':
        delaiJours = 3; // Urgent : 3 jours
        break;
      case 'valider_formulaire':
        delaiJours = 2; // Très urgent : 2 jours
        break;
      case 'envoyer_contrat':
        delaiJours = 5; // Important : 5 jours
        break;
      case 'envoyer_facture':
        delaiJours = 14; // Moins urgent : 2 semaines
        break;
      default:
        delaiJours = 7; // Par défaut : 1 semaine
        break;
    }
    
    // Si on a la date du concert, ajuster en fonction
    if (concert.date) {
      const dateConcert = concert.date.seconds 
        ? new Date(concert.date.seconds * 1000) 
        : new Date(concert.date);
      
      const joursAvantConcert = Math.floor((dateConcert - maintenant) / (1000 * 60 * 60 * 24));
      
      // Si le concert est bientôt, raccourcir les délais
      if (joursAvantConcert <= 30) {
        delaiJours = Math.min(delaiJours, Math.floor(joursAvantConcert / 4));
      }
      
      // Minimum 1 jour
      delaiJours = Math.max(1, delaiJours);
    }
    
    const dateEcheance = new Date(maintenant);
    dateEcheance.setDate(dateEcheance.getDate() + delaiJours);
    
    return dateEcheance;
  }
  
  /**
   * Ajoute une relance à la liste des relances du concert
   * 
   * @private
   * @param {string} concertId - ID du concert
   * @param {string} relanceId - ID de la relance
   * @returns {Promise<void>}
   */
  async _ajouterRelanceAuConcert(concertId, relanceId) {
    // DÉSACTIVÉ : Ne plus modifier le concert pour éviter les boucles
    // Les relances peuvent être retrouvées via une requête sur concertId
    debugLog(`🔗 Relation concert-relance créée (sans modification du concert)`);
    return;
    
    /* Code désactivé pour éviter les boucles
    try {
      console.log(`🔗 Ajout de la relance ${relanceId} au concert ${concertId}`);
      
      const concertRef = doc(db, 'concerts', concertId);
      const concertDoc = await getDoc(concertRef);
      
      if (concertDoc.exists()) {
        const concertData = concertDoc.data();
        const relancesActuelles = concertData.relances || [];
        
        // Vérifier que la relance n'est pas déjà dans la liste
        if (!relancesActuelles.includes(relanceId)) {
          const nouvellesRelances = [...relancesActuelles, relanceId];
          
          // Mise à jour avec un flag pour éviter les boucles infinies
          await updateDoc(concertRef, {
            relances: nouvellesRelances,
            updatedAt: serverTimestamp(),
            // Flag pour indiquer que c'est une mise à jour automatique
            _lastUpdateType: 'relance_auto_added'
          });
          
          console.log(`✅ Relance ${relanceId} ajoutée au concert ${concertId}`);
        } else {
          console.log(`⏩ Relance ${relanceId} déjà présente dans le concert ${concertId}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la relance au concert:', error);
      // Ne pas faire échouer toute l'opération pour cette erreur
    }
    */
  }
  
  /**
   * Supprime toutes les relances automatiques d'un concert
   * (à utiliser lors de la suppression d'un concert)
   * 
   * @param {string} concertId - ID du concert
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<void>}
   */
  async supprimerRelancesAutomatiques(concertId, organizationId) {
    try {
      console.log(`🗑️ Suppression des relances automatiques pour le concert: ${concertId}`);
      
      const relances = await this._getRelancesAutomatiques(concertId, organizationId);
      
      for (const relance of relances) {
        await deleteDoc(doc(db, 'relances', relance.id));
        console.log(`🗑️ Relance automatique supprimée: ${relance.id}`);
      }
      
      console.log(`✅ ${relances.length} relances automatiques supprimées`);
      
    } catch (error) {
      console.error('Erreur lors de la suppression des relances automatiques:', error);
      throw error;
    }
  }
  
  /**
   * Force la réévaluation de toutes les relances d'un concert
   * (utile après une mise à jour manuelle)
   * 
   * @param {string} concertId - ID du concert
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<void>}
   */
  async reevaluerRelancesConcert(concertId, organizationId) {
    try {
      console.log(`🔄 Réévaluation forcée des relances pour le concert: ${concertId}`);
      
      // Récupérer les données du concert
      const concertDoc = await getDoc(doc(db, 'concerts', concertId));
      if (!concertDoc.exists()) {
        throw new Error(`Concert ${concertId} non trouvé`);
      }
      
      const concert = { id: concertId, ...concertDoc.data() };
      
      // Récupérer les données associées (formulaire, contrat)
      // TODO: Implémenter la récupération des données de formulaire et contrat
      
      await this.evaluerEtMettreAJourRelances(concert, null, null, organizationId);
      
    } catch (error) {
      console.error('Erreur lors de la réévaluation des relances:', error);
      throw error;
    }
  }
}

// Instance singleton du service
export const relancesAutomatiquesService = new RelancesAutomatiquesService();

export default relancesAutomatiquesService;