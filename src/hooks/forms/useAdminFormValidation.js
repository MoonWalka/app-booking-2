/**
 * @fileoverview Hook d'administration pour la validation des soumissions de formulaires
 * Permet aux administrateurs de récupérer et valider les soumissions de formulaires
 * avec les données associées du concert et du lieu.
 * 
 * @author TourCraft Team
 * @since 2024
 */

import { useState, useEffect } from 'react';
import { getDoc, doc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Hook d'administration pour la récupération et validation des soumissions de formulaires
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
 * @dependencies
 * - Firebase Firestore (collections: formSubmissions, concerts, lieux)
 * - React hooks (useState, useEffect)
 * 
 * @complexity LOW
 * @businessCritical true
 * @migrationCandidate useGenericEntityDetails - Candidat pour généralisation
 * 
 * @workflow
 * 1. Validation de la présence du submissionId
 * 2. Récupération de la soumission depuis formSubmissions
 * 3. Récupération du concert associé via concertId
 * 4. Récupération optionnelle du lieu via lieuId
 * 5. Gestion des erreurs et mise à jour des états
 * 
 * @errorHandling
 * - ID manquant : "ID de soumission manquant"
 * - Soumission inexistante : "La soumission demandée n'existe pas."
 * - Erreur générique : "Impossible de charger les données de la soumission."
 * 
 * @adminOnly true
 * @usedBy AdminFormValidation, ValidationDashboard
 */
export const useAdminFormValidation = (submissionId) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!submissionId) {
      setError("ID de soumission manquant");
      setLoading(false);
      return;
    }

    const fetchFormSubmission = async () => {
      try {
        setLoading(true);
        
        // Récupérer les données de la soumission
        const submissionDoc = await getDoc(doc(db, 'formSubmissions', submissionId));
        if (submissionDoc.exists()) {
          const submissionData = submissionDoc.data();
          setFormData(submissionData);
          
          // Récupérer le concert associé
          if (submissionData.concertId) {
            const concertDoc = await getDoc(doc(db, 'concerts', submissionData.concertId));
            if (concertDoc.exists()) {
              const concertData = concertDoc.data();
              setConcert(concertData);
              
              // Récupérer le lieu si nécessaire
              if (concertData.lieuId) {
                const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
                if (lieuDoc.exists()) {
                  setLieu(lieuDoc.data());
                }
              }
            }
          }
        } else {
          setError("La soumission demandée n'existe pas.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la soumission:", error);
        setError("Impossible de charger les données de la soumission.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormSubmission();
  }, [submissionId]);

  return {
    loading,
    formData,
    concert,
    lieu,
    error
  };
};

export default useAdminFormValidation;