/**
 * @fileoverview Hook pour la validation de token de formulaire
 * 
 * @deprecated Utilisez useGenericEntityDetails avec validation personnalisée pour les nouveaux développements
 * @migrationDate 2025-01-XX
 * @replaces Wrapper autour de useGenericEntityDetails pour maintenir la compatibilité
 * 
 * Ce hook est maintenant un wrapper autour de useGenericEntityDetails.
 * Il maintient l'API existante pour la compatibilité avec le code existant,
 * mais utilise la logique générique en arrière-plan pour la récupération des entités.
 * 
 * @author TourCraft Team
 * @since 2024
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, where, getDocs } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import useGenericEntityDetails from '@/hooks/common/useGenericEntityDetails';

/**
 * Hook to validate a form token and fetch related concert data
 * 
 * @deprecated Utilisez useGenericEntityDetails avec validation personnalisée pour les nouveaux développements
 * 
 * Used in public form access scenarios
 * 
 * @param {string} concertId - ID du concert
 * @param {string} token - Token de validation du formulaire
 * @returns {Object} État et données de validation du token
 */
export const useFormTokenValidation = (concertId, token) => {
  // États spécifiques à la validation de token
  const [tokenValidation, setTokenValidation] = useState({
    loading: true,
    formData: null,
    formLinkId: null,
    error: null,
    expired: false,
    completed: false
  });

  // Configuration des entités liées pour le concert
  const relatedEntitiesConfig = useMemo(() => [
    {
      name: 'lieu',
      collection: 'lieux',
      idField: 'lieuId',
      type: 'single',
      loadImmediately: true
    }
  ], []);

  // Utilisation du hook générique pour récupérer le concert et le lieu
  const {
    entity: concert,
    loading: concertLoading,
    error: concertError,
    relatedData
  } = useGenericEntityDetails({
    entityType: 'concert',
    collectionName: 'concerts',
    id: concertId,
    relatedEntities: relatedEntitiesConfig,
    autoFetch: false // On ne charge que si le token est valide
  });

  // Extraction du lieu depuis les données liées
  const lieu = relatedData?.lieu || null;

  // Validation du token
  const validateToken = useCallback(async () => {
    // Skip if no concertId or token
    if (!concertId || !token) {
      setTokenValidation(prev => ({
        ...prev,
        error: "Lien de formulaire invalide. Il manque des paramètres nécessaires.",
        loading: false
      }));
      return;
    }

    setTokenValidation(prev => ({ ...prev, loading: true }));
    
    try {
      console.log("Validation du token:", token, "pour le concert:", concertId);
      
      // Vérifier si le token existe dans la collection formLinks
      const formsQuery = query(
        collection(db, 'formLinks'),
        where('token', '==', token),
        where('concertId', '==', concertId)
      );
      
      const formsSnapshot = await getDocs(formsQuery);
      
      if (formsSnapshot.empty) {
        console.error("Token non trouvé dans formLinks");
        setTokenValidation(prev => ({
          ...prev,
          error: 'Formulaire non trouvé. Le lien est peut-être incorrect.',
          loading: false
        }));
        return;
      }
      
      const formDoc = formsSnapshot.docs[0];
      const formLinkData = formDoc.data();
      
      console.log("Données du lien trouvées:", formLinkData);
      
      // Vérifier si le formulaire est déjà complété
      if (formLinkData.completed) {
        console.log("Formulaire déjà complété");
        setTokenValidation(prev => ({
          ...prev,
          formData: formLinkData,
          formLinkId: formDoc.id,
          completed: true,
          loading: false
        }));
        return;
      }
      
      // Vérifier si le token n'est pas expiré
      const now = new Date();
      const expiryDate = formLinkData.expiryDate ? formLinkData.expiryDate.toDate() : null;
      
      if (expiryDate && now > expiryDate) {
        console.log("Lien expiré:", expiryDate);
        setTokenValidation(prev => ({
          ...prev,
          formData: formLinkData,
          formLinkId: formDoc.id,
          expired: true,
          loading: false
        }));
        return;
      }
      
      // Token valide, on peut maintenant charger les données du concert
      setTokenValidation(prev => ({
        ...prev,
        formData: formLinkData,
        formLinkId: formDoc.id,
        loading: false
      }));
      
      console.log("Token validé avec succès, chargement du concert:", concertId);
      
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      setTokenValidation(prev => ({
        ...prev,
        error: `Une erreur est survenue lors du chargement du formulaire: ${error.message}`,
        loading: false
      }));
    }
  }, [concertId, token]);

  // Effet pour valider le token au montage
  useEffect(() => {
    validateToken();
  }, [validateToken]);

  // Function to toggle completed state (used when user wants to edit after completion)
  const toggleCompleted = useCallback((value) => {
    setTokenValidation(prev => ({
      ...prev,
      completed: value
    }));
  }, []);

  // Gestion des erreurs combinées
  const combinedError = useMemo(() => {
    if (tokenValidation.error) return tokenValidation.error;
    if (concertError && !tokenValidation.loading) {
      return "Le concert associé à ce formulaire n'existe pas ou a été supprimé.";
    }
    return null;
  }, [tokenValidation.error, concertError, tokenValidation.loading]);

  // État de chargement combiné
  const isLoading = tokenValidation.loading || (concertLoading && !tokenValidation.error && !tokenValidation.expired && !tokenValidation.completed);

  return {
    loading: isLoading,
    formData: tokenValidation.formData,
    formLinkId: tokenValidation.formLinkId,
    concert,
    lieu,
    error: combinedError,
    expired: tokenValidation.expired,
    completed: tokenValidation.completed,
    toggleCompleted
  };
};

export default useFormTokenValidation;