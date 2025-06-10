/**
 * @fileoverview Hook pour surveiller les changements des concerts
 * Déclenche automatiquement l'évaluation des relances lors des modifications
 * 
 * @author TourCraft Team
 * @since 2025
 */

import { useEffect, useRef } from 'react';
import { doc, onSnapshot } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useRelancesAutomatiques } from '@/hooks/relances/useRelancesAutomatiques';
import { useOrganization } from '@/context/OrganizationContext';
import { isWatcherEnabled, debugLog } from '@/config/relancesAutomatiquesConfig';

/**
 * Hook pour surveiller les changements d'un concert et déclencher les relances automatiques
 * 
 * @param {string} concertId - ID du concert à surveiller
 * @param {Object} options - Options de configuration
 * @param {boolean} options.enabled - Activer/désactiver la surveillance
 * @returns {Object} État de la surveillance
 */
export const useConcertWatcher = (concertId, options = {}) => {
  const { enabled = true } = options;
  const { currentOrganization } = useOrganization();
  const relancesAuto = useRelancesAutomatiques();
  const previousStateRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!enabled || !concertId || !currentOrganization?.id) {
      return;
    }
    
    // Vérifier si le watcher est activé dans la configuration
    if (!isWatcherEnabled()) {
      debugLog('👁️ Watcher désactivé par la configuration');
      return;
    }

    console.log(`👁️ Début de la surveillance du concert: ${concertId}`);

    // Écouter les changements du concert
    unsubscribeRef.current = onSnapshot(
      doc(db, 'concerts', concertId),
      async (snapshot) => {
        if (!snapshot.exists()) {
          console.warn(`⚠️ Concert ${concertId} non trouvé`);
          return;
        }

        const concertData = { id: snapshot.id, ...snapshot.data() };
        const previousState = previousStateRef.current;

        // Détecter les changements significatifs
        const hasSignificantChange = detectSignificantChange(previousState, concertData);

        if (hasSignificantChange) {
          console.log(`🔄 Changement significatif détecté pour le concert ${concertId}`);
          console.log('📊 État précédent:', previousState);
          console.log('📊 Nouvel état:', concertData);

          // Déclencher l'évaluation des relances
          try {
            await relancesAuto.evaluerRelances(concertData, {
              formulaire: concertData.formValidated ? {
                statut: 'valide',
                dateValidation: concertData.formValidatedAt
              } : null
            });
            console.log('✅ Relances automatiques évaluées suite au changement');
          } catch (error) {
            console.error('❌ Erreur lors de l\'évaluation des relances:', error);
          }
        }

        // Mettre à jour l'état précédent
        previousStateRef.current = concertData;
      },
      (error) => {
        console.error(`❌ Erreur surveillance concert ${concertId}:`, error);
      }
    );

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        console.log(`👁️ Fin de la surveillance du concert: ${concertId}`);
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [concertId, enabled, currentOrganization?.id, relancesAuto]);

  return {
    isWatching: !!unsubscribeRef.current
  };
};

/**
 * Détecte si un changement significatif s'est produit
 * 
 * @param {Object|null} previousState - État précédent
 * @param {Object} newState - Nouvel état
 * @returns {boolean} True si changement significatif
 */
function detectSignificantChange(previousState, newState) {
  if (!previousState) {
    return true; // Premier chargement
  }

  // Ignorer les changements causés par les opérations automatiques
  const autoUpdateTypes = ['relance_auto_added', 'relance_cleanup'];
  if (autoUpdateTypes.includes(newState._lastUpdateType) && 
      newState._lastUpdateType !== previousState._lastUpdateType) {
    console.log(`⏩ Ignorer changement causé par: ${newState._lastUpdateType}`);
    return false;
  }

  // Champs à surveiller pour les changements significatifs
  const significantFields = [
    'formValidated',
    'formSubmissionId',
    'formValidatedAt',
    'contactId',
    'artisteId',
    'lieuId',
    'statut'
  ];

  // Vérifier si l'un des champs significatifs a changé
  for (const field of significantFields) {
    if (previousState[field] !== newState[field]) {
      console.log(`📝 Champ modifié: ${field} (${previousState[field]} → ${newState[field]})`);
      return true;
    }
  }

  // Vérifier spécifiquement le passage à "formulaire validé"
  if (!previousState.formValidated && newState.formValidated) {
    console.log('✅ Formulaire validé !');
    return true;
  }

  return false;
}

export default useConcertWatcher;