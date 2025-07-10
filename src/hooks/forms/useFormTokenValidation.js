/**
 * Hook pour valider les tokens de formulaires publics
 * Gère la validation des liens, l'expiration et le statut de soumission
 */

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import preContratService from '@/services/preContratService';
import { debugLog } from '@/utils/logUtils';

export function useFormTokenValidation(dateId, token) {
  const [state, setState] = useState({
    isLoading: true,
    isValid: false,
    isExpired: false,
    isCompleted: false,
    dateData: null,
    formLinkData: null,
    existingSubmission: null,
    entrepriseData: null,
    error: null
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!dateId || !token) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isValid: false,
          error: 'Paramètres manquants'
        }));
        return;
      }

      try {
        debugLog('[useFormTokenValidation] Validation du token:', {
          dateId,
          token: token.substring(0, 8) + '...'
        }, 'info');

        // Valider le token
        const validationResult = await preContratService.validateToken(dateId, token);
        
        if (!validationResult.valid) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isValid: false,
            isExpired: validationResult.reason === 'Token expiré',
            error: validationResult.reason
          }));
          return;
        }

        // Récupérer les données de la date
        const dateDoc = await getDoc(doc(db, 'dates', dateId));
        if (!dateDoc.exists()) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isValid: false,
            error: 'Date introuvable'
          }));
          return;
        }

        const dateData = { id: dateId, ...dateDoc.data() };

        // Récupérer les données du lieu si disponible
        if (dateData.lieuId) {
          try {
            const lieuDoc = await getDoc(doc(db, 'lieux', dateData.lieuId));
            if (lieuDoc.exists()) {
              dateData.lieu = { id: lieuDoc.id, ...lieuDoc.data() };
            }
          } catch (error) {
            debugLog('[useFormTokenValidation] Erreur récupération lieu:', error, 'warn');
          }
        }

        // Récupérer les données de l'artiste si disponible
        if (dateData.artisteId) {
          try {
            const artisteDoc = await getDoc(doc(db, 'artistes', dateData.artisteId));
            if (artisteDoc.exists()) {
              dateData.artiste = { id: artisteDoc.id, ...artisteDoc.data() };
            }
          } catch (error) {
            debugLog('[useFormTokenValidation] Erreur récupération artiste:', error, 'warn');
          }
        }

        // Récupérer les données de l'entreprise
        let entrepriseData = null;
        if (validationResult.preContrat?.entrepriseId) {
          try {
            const orgDoc = await getDoc(doc(db, 'entreprises', validationResult.preContrat.entrepriseId));
            if (orgDoc.exists()) {
              entrepriseData = { id: orgDoc.id, ...orgDoc.data() };
            }
          } catch (error) {
            debugLog('[useFormTokenValidation] Erreur récupération entreprise:', error, 'warn');
          }
        }

        // Debug des données du pré-contrat
        console.log('[WORKFLOW_TEST] 5. Passage des données au formulaire public - chargement dans useFormTokenValidation');
        console.log('[useFormTokenValidation] Données du pré-contrat:', validationResult.preContrat);
        console.log('[useFormTokenValidation] Adresse dans preContrat:', {
          adresse: validationResult.preContrat?.adresse,
          cp: validationResult.preContrat?.cp,
          ville: validationResult.preContrat?.ville,
          publicFormData: validationResult.preContrat?.publicFormData
        });

        setState({
          isLoading: false,
          isValid: true,
          isExpired: false,
          isCompleted: validationResult.alreadyValidated || validationResult.preContrat?.publicFormCompleted || false,
          dateData,
          formLinkData: validationResult.preContrat,
          existingSubmission: validationResult.preContrat?.publicFormData ? validationResult.preContrat.publicFormData : null,
          entrepriseData,
          error: null
        });

        debugLog('[useFormTokenValidation] Validation réussie:', {
          dateNom: dateData.titre || dateData.nom,
          isCompleted: validationResult.alreadyValidated
        }, 'success');

      } catch (error) {
        debugLog('[useFormTokenValidation] Erreur:', error, 'error');
        setState(prev => ({
          ...prev,
          isLoading: false,
          isValid: false,
          error: error.message || 'Erreur lors de la validation'
        }));
      }
    };

    validateToken();
  }, [dateId, token]);

  return state;
}