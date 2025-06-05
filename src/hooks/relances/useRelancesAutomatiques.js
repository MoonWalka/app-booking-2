/**
 * @fileoverview Hook pour la gestion des relances automatiques
 * Fournit une interface pour déclencher et gérer les relances automatiques
 * depuis les composants React
 * 
 * @author TourCraft Team
 * @since 2025
 */

import { useState, useCallback } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { relancesAutomatiquesService, RELANCE_TYPES } from '@/services/relancesAutomatiquesService';

/**
 * Hook pour la gestion des relances automatiques
 * 
 * @param {Object} options - Options de configuration
 * @param {boolean} options.autoEvaluation - Active l'évaluation automatique lors des changements
 * @returns {Object} Interface de gestion des relances automatiques
 */
export const useRelancesAutomatiques = (options = {}) => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Déclenche l'évaluation des relances automatiques pour un concert
   * 
   * @param {Object} concert - Données du concert
   * @param {Object} context - Contexte additionnel (formulaire, contrat, etc.)
   * @returns {Promise<void>}
   */
  const evaluerRelances = useCallback(async (concert, context = {}) => {
    if (!currentOrganization?.id) {
      console.warn('⚠️ Aucune organisation sélectionnée pour l\'évaluation des relances');
      return;
    }
    
    if (!concert?.id) {
      console.warn('⚠️ Concert invalide pour l\'évaluation des relances');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await relancesAutomatiquesService.evaluerEtMettreAJourRelances(
        concert,
        context.formulaire,
        context.contrat,
        currentOrganization.id
      );
      
      console.log('✅ Évaluation des relances automatiques réussie');
      
    } catch (err) {
      console.error('❌ Erreur lors de l\'évaluation des relances automatiques:', err);
      setError(err.message || 'Erreur lors de l\'évaluation des relances');
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id]);
  
  /**
   * Force la réévaluation de toutes les relances d'un concert
   * 
   * @param {string} concertId - ID du concert
   * @returns {Promise<void>}
   */
  const reevaluerRelances = useCallback(async (concertId) => {
    if (!currentOrganization?.id) {
      console.warn('⚠️ Aucune organisation sélectionnée pour la réévaluation');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await relancesAutomatiquesService.reevaluerRelancesConcert(
        concertId,
        currentOrganization.id
      );
      
      console.log('✅ Réévaluation des relances automatiques réussie');
      
    } catch (err) {
      console.error('❌ Erreur lors de la réévaluation des relances:', err);
      setError(err.message || 'Erreur lors de la réévaluation des relances');
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id]);
  
  /**
   * Supprime toutes les relances automatiques d'un concert
   * 
   * @param {string} concertId - ID du concert
   * @returns {Promise<void>}
   */
  const supprimerRelances = useCallback(async (concertId) => {
    if (!currentOrganization?.id) {
      console.warn('⚠️ Aucune organisation sélectionnée pour la suppression');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await relancesAutomatiquesService.supprimerRelancesAutomatiques(
        concertId,
        currentOrganization.id
      );
      
      console.log('✅ Suppression des relances automatiques réussie');
      
    } catch (err) {
      console.error('❌ Erreur lors de la suppression des relances:', err);
      setError(err.message || 'Erreur lors de la suppression des relances');
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id]);
  
  /**
   * Déclenche l'évaluation des relances lors de la création d'un concert
   * 
   * @param {Object} concert - Données du nouveau concert
   * @returns {Promise<void>}
   */
  const onConcertCree = useCallback(async (concert) => {
    console.log('🎵 Déclenchement des relances automatiques pour nouveau concert:', concert.id);
    await evaluerRelances(concert, {});
  }, [evaluerRelances]);
  
  /**
   * Déclenche l'évaluation des relances lors de la mise à jour d'un concert
   * 
   * @param {Object} concert - Données du concert mis à jour
   * @param {Object} context - Contexte de la mise à jour
   * @returns {Promise<void>}
   */
  const onConcertMisAJour = useCallback(async (concert, context = {}) => {
    console.log('🔄 Réévaluation des relances automatiques pour concert mis à jour:', concert.id);
    await evaluerRelances(concert, context);
  }, [evaluerRelances]);
  
  /**
   * Déclenche l'évaluation lors de la réception d'un formulaire
   * 
   * @param {Object} concert - Données du concert
   * @param {Object} formulaire - Données du formulaire reçu
   * @returns {Promise<void>}
   */
  const onFormulaireRecu = useCallback(async (concert, formulaire) => {
    console.log('📋 Formulaire reçu, réévaluation des relances pour:', concert.id);
    await evaluerRelances(concert, { formulaire });
  }, [evaluerRelances]);
  
  /**
   * Déclenche l'évaluation lors de la validation d'un formulaire
   * 
   * @param {Object} concert - Données du concert
   * @param {Object} formulaire - Données du formulaire validé
   * @returns {Promise<void>}
   */
  const onFormulaireValide = useCallback(async (concert, formulaire) => {
    console.log('✅ Formulaire validé, réévaluation des relances pour:', concert.id);
    await evaluerRelances(concert, { formulaire: { ...formulaire, statut: 'valide' } });
  }, [evaluerRelances]);
  
  /**
   * Déclenche l'évaluation lors de la génération d'un contrat
   * 
   * @param {Object} concert - Données du concert
   * @param {Object} contrat - Données du contrat généré
   * @returns {Promise<void>}
   */
  const onContratGenere = useCallback(async (concert, contrat) => {
    console.log('📄 Contrat généré, réévaluation des relances pour:', concert.id);
    await evaluerRelances(concert, { contrat });
  }, [evaluerRelances]);
  
  /**
   * Déclenche l'évaluation lors de l'envoi d'un contrat
   * 
   * @param {Object} concert - Données du concert
   * @param {Object} contrat - Données du contrat envoyé
   * @returns {Promise<void>}
   */
  const onContratEnvoye = useCallback(async (concert, contrat) => {
    console.log('📤 Contrat envoyé, réévaluation des relances pour:', concert.id);
    await evaluerRelances(concert, { contrat: { ...contrat, dateEnvoi: new Date() } });
  }, [evaluerRelances]);
  
  return {
    // États
    loading,
    error,
    
    // Actions principales
    evaluerRelances,
    reevaluerRelances,
    supprimerRelances,
    
    // Triggers d'événements
    onConcertCree,
    onConcertMisAJour,
    onFormulaireRecu,
    onFormulaireValide,
    onContratGenere,
    onContratEnvoye,
    
    // Utilitaires
    typesRelances: RELANCE_TYPES,
    
    // Fonction pour nettoyer les erreurs
    clearError: () => setError(null)
  };
};

export default useRelancesAutomatiques;