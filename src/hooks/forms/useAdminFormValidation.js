/**
 * @fileoverview Hook d'administration pour la validation des soumissions de formulaires
 * 
 * @deprecated Utilisez useGenericEntityDetails directement pour les nouveaux développements
 * @migrationDate 2025-01-XX
 * @replaces Wrapper autour de useGenericEntityDetails pour maintenir la compatibilité
 * 
 * Ce hook est maintenant un wrapper autour de useGenericEntityDetails.
 * Il maintient l'API existante pour la compatibilité avec le code existant,
 * mais utilise la logique générique en arrière-plan.
 * 
 * @author TourCraft Team
 * @since 2024
 */

import { useMemo } from 'react';
import useGenericEntityDetails from '@/hooks/common/useGenericEntityDetails';

/**
 * Hook d'administration pour la récupération et validation des soumissions de formulaires
 * 
 * @deprecated Utilisez useGenericEntityDetails directement pour les nouveaux développements
 * 
 * Ce hook permet aux administrateurs de récupérer une soumission de formulaire spécifique
 * avec toutes les données contextuelles nécessaires (concert, lieu) pour la validation.
 * 
 * @description
 * Fonctionnalités principales :
 * - Récupération des données de soumission par ID
 * - Récupération automatique du concert associé
 * - Récupération optionnelle du lieu de concert
 * - Gestion des erreurs et états de chargement
 * - Interface simplifiée pour l'administration
 * 
 * @param {string} submissionId - ID unique de la soumission de formulaire à récupérer
 * 
 * @returns {Object} État et données de la soumission pour validation administrative
 * @returns {boolean} returns.loading - État de chargement des données
 * @returns {Object|null} returns.formData - Données complètes de la soumission de formulaire
 * @returns {Object|null} returns.concert - Données du concert associé à la soumission
 * @returns {Object|null} returns.lieu - Données du lieu de concert (si disponible)
 * @returns {string|null} returns.error - Message d'erreur éventuel
 * 
 * @example
 * ```javascript
 * const { loading, formData, concert, lieu, error } = useAdminFormValidation('submission-123');
 * 
 * if (loading) return <div>Chargement de la soumission...</div>;
 * if (error) return <div>Erreur: {error}</div>;
 * if (!formData) return <div>Soumission non trouvée</div>;
 * 
 * // Afficher les données pour validation
 * return (
 *   <div>
 *     <h2>Validation de soumission</h2>
 *     <p>Concert: {concert?.titre}</p>
 *     <p>Lieu: {lieu?.nom}</p>
 *     <p>Programmateur: {formData.programmateur?.nom}</p>
 *   </div>
 * );
 * ```
 * 
 * @complexity LOW
 * @businessCritical true
 * @migrated useGenericEntityDetails - Migré vers la version générique
 * 
 * @adminOnly true
 * @usedBy AdminFormValidation, ValidationDashboard
 */
export const useAdminFormValidation = (submissionId) => {
  // Configuration des entités liées pour useGenericEntityDetails
  const relatedEntitiesConfig = useMemo(() => [
    {
      name: 'concert',
      collection: 'concerts',
      idField: 'concertId',
      type: 'single',
      loadImmediately: true
    },
    {
      name: 'lieu',
      collection: 'lieux',
      idField: 'lieuId',
      type: 'single',
      loadImmediately: true,
      // Le lieu est lié au concert, pas directement à la soumission
      parentEntity: 'concert'
    }
  ], []);

  // Utilisation du hook générique
  const {
    entity: formData,
    loading,
    error: genericError,
    relatedData
  } = useGenericEntityDetails({
    entityType: 'formSubmission',
    collectionName: 'formSubmissions',
    id: submissionId,
    relatedEntities: relatedEntitiesConfig,
    transformData: (data) => {
      // Transformation pour maintenir la compatibilité
      return data;
    },
    onError: (error) => {
      // Gestion d'erreur personnalisée pour maintenir les messages existants
      if (error.includes('not found') || error.includes('non trouvé')) {
        return "La soumission demandée n'existe pas.";
      }
      return "Impossible de charger les données de la soumission.";
    }
  });

  // Extraction des entités liées pour maintenir l'API existante
  const concert = relatedData?.concert || null;
  const lieu = relatedData?.lieu || null;

  // Gestion d'erreur personnalisée pour maintenir la compatibilité
  const error = useMemo(() => {
    if (!submissionId) {
      return "ID de soumission manquant";
    }
    return genericError;
  }, [submissionId, genericError]);

  return {
    loading,
    formData,
    concert,
    lieu,
    error
  };
};

export default useAdminFormValidation;