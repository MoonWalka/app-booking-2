/**
 * Hook pour valider les tokens de formulaires publics
 * Gère la validation des liens, l'expiration et le statut de soumission
 */

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import preContratService from '@/services/preContratService';
import { debugLog } from '@/utils/logUtils';

export function useFormTokenValidation(concertId, token) {
  const [state, setState] = useState({
    isLoading: true,
    isValid: false,
    isExpired: false,
    isCompleted: false,
    concertData: null,
    formLinkData: null,
    existingSubmission: null,
    error: null
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!concertId || !token) {
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
          concertId,
          token: token.substring(0, 8) + '...'
        }, 'info');

        // Valider le token
        const validationResult = await preContratService.validateToken(concertId, token);
        
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

        // Récupérer les données du concert
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (!concertDoc.exists()) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isValid: false,
            error: 'Concert introuvable'
          }));
          return;
        }

        const concertData = { id: concertId, ...concertDoc.data() };

        // Récupérer les données du lieu si disponible
        if (concertData.lieuId) {
          try {
            const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
            if (lieuDoc.exists()) {
              concertData.lieu = { id: lieuDoc.id, ...lieuDoc.data() };
            }
          } catch (error) {
            debugLog('[useFormTokenValidation] Erreur récupération lieu:', error, 'warn');
          }
        }

        // Récupérer les données de l'artiste si disponible
        if (concertData.artisteId) {
          try {
            const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
            if (artisteDoc.exists()) {
              concertData.artiste = { id: artisteDoc.id, ...artisteDoc.data() };
            }
          } catch (error) {
            debugLog('[useFormTokenValidation] Erreur récupération artiste:', error, 'warn');
          }
        }

        setState({
          isLoading: false,
          isValid: true,
          isExpired: false,
          isCompleted: validationResult.alreadyValidated || false,
          concertData,
          formLinkData: validationResult.preContrat,
          existingSubmission: validationResult.alreadyValidated ? validationResult.preContrat : null,
          error: null
        });

        debugLog('[useFormTokenValidation] Validation réussie:', {
          concertNom: concertData.titre || concertData.nom,
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
  }, [concertId, token]);

  return state;
}