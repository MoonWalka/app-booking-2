/**
 * @fileoverview Hook de validation des données de formulaire pour les concerts
 * Gère la récupération et la validation des soumissions de formulaires associées aux concerts,
 * incluant les données du programmateur, du lieu et de la structure.
 * 
 * @author TourCraft Team
 * @since 2024
 */

import { useState, useEffect, useCallback } from 'react';
import { db, doc, getDoc, collection, query, where, getDocs, updateDoc } from '@/services/firebase-service';

/**
 * Configuration des champs de contact du programmateur
 * @type {Array<{id: string, label: string}>}
 */
const contactFields = [
  { id: 'nom', label: 'Nom' },
  { id: 'prenom', label: 'Prénom' },
  { id: 'fonction', label: 'Fonction' },
  { id: 'email', label: 'Email' },
  { id: 'telephone', label: 'Téléphone' }
];

/**
 * Configuration des champs de structure du programmateur
 * @type {Array<{id: string, label: string}>}
 */
const structureFields = [
  { id: 'raisonSociale', label: 'Raison sociale' },
  { id: 'type', label: 'Type de structure' },
  { id: 'adresse', label: 'Adresse' },
  { id: 'codePostal', label: 'Code postal' },
  { id: 'ville', label: 'Ville' },
  { id: 'pays', label: 'Pays' },
  { id: 'siret', label: 'SIRET' }
];

/**
 * Configuration des champs du lieu de concert
 * @type {Array<{id: string, label: string}>}
 */
const lieuFields = [
  { id: 'nom', label: 'Nom du lieu' },
  { id: 'adresse', label: 'Adresse' },
  { id: 'codePostal', label: 'Code postal' },
  { id: 'ville', label: 'Ville' },
  { id: 'capacite', label: 'Capacité' }
];

/**
 * Hook de validation des données de formulaire pour un concert
 * 
 * Ce hook gère la logique complexe de récupération et validation des données
 * de formulaire soumises par les programmateurs pour un concert donné.
 * 
 * @description
 * Fonctionnalités principales :
 * - Récupération des données du concert et du lieu associé
 * - Recherche de la soumission de formulaire (formSubmissions)
 * - Gestion des liens de formulaire non soumis (formLinks)
 * - Récupération des données du programmateur existant
 * - Initialisation des valeurs de validation
 * - Gestion des états de validation
 * 
 * @param {string} concertId - ID unique du concert pour lequel récupérer les données de formulaire
 * 
 * @returns {Object} État et données du formulaire de validation
 * @returns {Object|null} returns.formData - Données de la soumission de formulaire
 * @returns {string|null} returns.formId - ID de la soumission de formulaire
 * @returns {Object|null} returns.concert - Données complètes du concert
 * @returns {boolean} returns.loading - État de chargement des données
 * @returns {string|null} returns.error - Message d'erreur éventuel
 * @returns {boolean} returns.validated - État de validation du formulaire
 * @returns {Function} returns.setValidated - Fonction pour modifier l'état de validation
 * @returns {Object} returns.validatedFields - Champs validés avec leurs valeurs
 * @returns {Function} returns.setValidatedFields - Fonction pour modifier les champs validés
 * @returns {Object|null} returns.programmateur - Données du programmateur existant
 * @returns {Object|null} returns.lieu - Données du lieu de concert
 * @returns {Array} returns.contactFields - Configuration des champs de contact
 * @returns {Array} returns.structureFields - Configuration des champs de structure
 * @returns {Array} returns.lieuFields - Configuration des champs de lieu
 * 
 * @example
 * ```javascript
 * const {
 *   formData,
 *   loading,
 *   error,
 *   validated,
 *   validatedFields,
 *   setValidatedFields,
 *   programmateur,
 *   lieu
 * } = useFormValidationData('concert-123');
 * 
 * if (loading) return <div>Chargement...</div>;
 * if (error) return <div>Erreur: {error}</div>;
 * 
 * // Utiliser les données pour la validation
 * ```
 * 
 * @dependencies
 * - Firebase Firestore (collections: concerts, formSubmissions, formLinks, lieux, programmateurs)
 * - React hooks (useState, useEffect, useCallback)
 * 
 * @complexity HIGH
 * @businessCritical true
 * @migrationCandidate useGenericEntityForm - Candidat pour généralisation
 * 
 * @workflow
 * 1. Récupération des données du concert par concertId
 * 2. Récupération optionnelle des données du lieu associé
 * 3. Recherche de la soumission de formulaire :
 *    - Via formSubmissionId du concert (si existant)
 *    - Via requête sur formSubmissions par concertId
 *    - Vérification des formLinks si aucune soumission
 * 4. Sélection de la soumission la plus récente
 * 5. Mise à jour du concert avec formSubmissionId
 * 6. Récupération des données du programmateur existant
 * 7. Initialisation des valeurs de validation
 * 8. Gestion des états de validation existants
 * 
 * @errorHandling
 * - Concert inexistant : "Ce concert n'existe pas."
 * - Aucun formulaire : "Aucun formulaire n'a été soumis pour ce concert."
 * - Lien sans soumission : "Un lien de formulaire a été généré mais le programmateur n'a pas encore soumis de réponse."
 * - Soumission introuvable : "La soumission de formulaire n'a pas été trouvée."
 * - Erreurs génériques : "Impossible de charger les données du formulaire: {error}"
 */
const useFormValidationData = (concertId) => {
  const [formData, setFormData] = useState(null);
  const [formId, setFormId] = useState(null);
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [validatedFields, setValidatedFields] = useState({});
  const [programmateur, setProgrammateur] = useState(null);
  const [lieu, setLieu] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
      console.log("Recherche de formulaire pour le concert:", concertId);
      
      // 1. D'abord, récupérer les données du concert
      const concertRef = doc(db, 'concerts', concertId);
      const concertDoc = await getDoc(concertRef);
      
      if (!concertDoc.exists()) {
        console.error("Concert non trouvé:", concertId);
        setError("Ce concert n'existe pas.");
        setLoading(false);
        return;
      }
      
      const concertData = {
        id: concertDoc.id,
        ...concertDoc.data()
      };
      
      console.log("Concert trouvé:", concertData);
      setConcert(concertData);
      
      // Récupérer les données du lieu si existant
      if (concertData.lieuId) {
        const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
        if (lieuDoc.exists()) {
          const lieuData = {
            id: lieuDoc.id,
            ...lieuDoc.data()
          };
          setLieu(lieuData);
          console.log("Lieu trouvé:", lieuData);
        }
      }
      
      // 2. Chercher la soumission de formulaire associée au concert
      let formSubmissionId = null;
      
      // Si le concert a déjà un formSubmissionId associé
      if (concertData.formSubmissionId) {
        console.log("FormSubmissionId trouvé dans le concert:", concertData.formSubmissionId);
        formSubmissionId = concertData.formSubmissionId;
      } else {
        console.log("Recherche dans formSubmissions par concertId");
        // Chercher dans la collection formSubmissions
        const submissionsQuery = query(
          collection(db, 'formSubmissions'), 
          where('concertId', '==', concertId)
        );
        
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        if (submissionsSnapshot.empty) {
          console.log("Aucune soumission trouvée, recherche dans formLinks");
          // Si aucune soumission, vérifier si un lien a été généré
          const linksQuery = query(
            collection(db, 'formLinks'), 
            where('concertId', '==', concertId)
          );
          
          const linksSnapshot = await getDocs(linksQuery);
          
          if (linksSnapshot.empty) {
            console.error("Aucun formulaire trouvé pour ce concert");
            // Ne pas mettre d'erreur, laisser formData à null pour afficher le FormGenerator
            setFormData(null);
            setLoading(false);
            return;
          }
          
          console.log("Lien trouvé, mais aucune soumission");
          // Ne pas mettre d'erreur, laisser formData à null pour afficher le FormGenerator
          setFormData(null);
          setLoading(false);
          return;
        }
        
        // Prendre la soumission la plus récente
        const submissions = submissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("Soumissions trouvées:", submissions.length);
        
        // Trier par date de soumission (du plus récent au plus ancien)
        submissions.sort((a, b) => {
          const dateA = a.submittedAt?.toDate() || a.createdAt?.toDate() || new Date(0);
          const dateB = b.submittedAt?.toDate() || b.createdAt?.toDate() || new Date(0);
          return dateB - dateA;
        });
        
        formSubmissionId = submissions[0].id;
        
        // Mettre à jour le concert avec l'ID de la soumission
        await updateDoc(doc(db, 'concerts', concertId), {
          formSubmissionId: formSubmissionId
        });
        
        console.log("FormSubmissionId sélectionné:", formSubmissionId);
      }
      
      setFormId(formSubmissionId);
      
      // 3. Récupérer les données de la soumission
      const formDoc = await getDoc(doc(db, 'formSubmissions', formSubmissionId));

      if (formDoc.exists()) {
        const formDocData = {
          id: formDoc.id,
          ...formDoc.data()
        };
        
        console.log("Soumission trouvée:", formDocData);
        setFormData(formDocData);
        
        // Création des valeurs initiales à partir des données existantes
        const initialValues = {};
        
        // Si un lieu existe, initialiser avec ses données en priorité
        if (lieu) {
          lieuFields.forEach(field => {
            initialValues[`lieu.${field.id}`] = lieu[field.id] || '';
          });
        }
        
        // Si la soumission contient des données de lieu, les prendre en compte après
        if (formDocData.lieuData) {
          console.log("Données de lieu trouvées dans la soumission:", formDocData.lieuData);
          lieuFields.forEach(field => {
            if (formDocData.lieuData[field.id]) {
              initialValues[`lieu.${field.id}`] = formDocData.lieuData[field.id];
            }
          });
        }
        
        // Récupérer les données existantes du programmateur (s'il existe)
        if (formDocData.programmId) {
          try {
            const progDoc = await getDoc(doc(db, 'programmateurs', formDocData.programmId));
            if (progDoc.exists()) {
              // Définir les données existantes du programmateur
              const programmData = progDoc.data();
              setProgrammateur(programmData);
              
              // Initialiser les champs de contact avec les valeurs existantes
              contactFields.forEach(field => {
                initialValues[`contact.${field.id}`] = programmData[field.id] || '';
              });
              
              // Initialiser les champs de structure avec les valeurs existantes
              structureFields.forEach(field => {
                if (field.id === 'raisonSociale') {
                  initialValues[`structure.${field.id}`] = programmData.structure || '';
                } else if (['type', 'adresse', 'codePostal', 'ville', 'pays'].includes(field.id)) {
                  const fieldKey = `structure${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`;
                  initialValues[`structure.${field.id}`] = programmData[fieldKey] || '';
                } else {
                  initialValues[`structure.${field.id}`] = programmData[field.id] || '';
                }
              });
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données du programmateur:", error);
          }
        }
        
        // Si la soumission a déjà été validée, utiliser les champs validés existants
        if (formDocData.status === 'validated' && formDocData.validatedFields) {
          setValidatedFields(formDocData.validatedFields);
          setValidated(true);
        } else {
          // Sinon, initialiser les champs validés avec les valeurs existantes
          setValidatedFields(initialValues);
        }
      } else {
        console.error("Soumission non trouvée avec ID:", formSubmissionId);
        setError("La soumission de formulaire n'a pas été trouvée.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(`Impossible de charger les données du formulaire: ${err.message}`);
      setLoading(false);
    }
  }, [concertId, lieu]);

  useEffect(() => {
    if (concertId) {
      fetchData();
    }
  }, [concertId, fetchData]);

  return {
    formData,
    formId,
    concert,
    loading,
    error,
    validated,
    setValidated,
    validatedFields,
    setValidatedFields,
    programmateur,
    lieu,
    contactFields,
    structureFields,
    lieuFields
  };
};

export default useFormValidationData;
