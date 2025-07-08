/**
 * @fileoverview Hook de validation des données de formulaire pour les dates
 * Gère la récupération et la validation des soumissions de formulaires associées aux dates,
 * incluant les données du contact, du lieu et de la structure.
 * 
 * @author TourCraft Team
 * @since 2024
 */

import { useState, useEffect, useCallback } from 'react';
import { db, doc, getDoc, collection, query, where, getDocs, updateDoc } from '@/services/firebase-service';

/**
 * Configuration des champs de contact
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
 * Configuration des champs de structure
 * @type {Array<{id: string, label: string}>}
 */
const structureFields = [
  { id: 'raisonSociale', label: 'Raison sociale' },
  { id: 'type', label: 'Type de structure' },
  { id: 'adresse', label: 'Adresse' },
  { id: 'codePostal', label: 'Code postal' },
  { id: 'ville', label: 'Ville' },
  { id: 'pays', label: 'Pays' },
  { id: 'siret', label: 'SIRET' },
  { id: 'numeroIntracommunautaire', label: 'N° TVA Intracommunautaire' }
];

/**
 * Configuration des champs du lieu
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
 * de formulaire soumises par les contacts pour un date donné.
 * 
 * @description
 * Fonctionnalités principales :
 * - Récupération des données du date et du lieu associé
 * - Recherche de la soumission de formulaire (formSubmissions)
 * - Gestion des liens de formulaire non soumis (formLinks)
 * - Récupération des données du contact existant
 * - Initialisation des valeurs de validation
 * - Gestion des états de validation
 * 
 * @param {string} dateId - ID unique du date pour lequel récupérer les données de formulaire
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
 * @returns {Object|null} returns.contact - Données du contact existant (rétrocompatibilité avec programmateur)
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
 *   contact,
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
 * - Firebase Firestore (collections: dates, formSubmissions, formLinks, lieux, contacts)
 * - React hooks (useState, useEffect, useCallback)
 * 
 * @complexity HIGH
 * @businessCritical true
 * @migrationCandidate useGenericEntityForm - Candidat pour généralisation
 * 
 * @workflow
 * 1. Récupération des données du date par dateId
 * 2. Récupération optionnelle des données du lieu associé
 * 3. Recherche de la soumission de formulaire :
 *    - Via formSubmissionId du date (si existant)
 *    - Via requête sur formSubmissions par dateId
 *    - Vérification des formLinks si aucune soumission
 * 4. Sélection de la soumission la plus récente
 * 5. Mise à jour du date avec formSubmissionId
 * 6. Récupération des données du contact existant
 * 7. Initialisation des valeurs de validation
 * 8. Gestion des états de validation existants
 * 
 * @errorHandling
 * - Date inexistant : "Ce date n'existe pas."
 * - Aucun formulaire : "Aucun formulaire n'a été soumis pour ce date."
 * - Lien sans soumission : "Un lien de formulaire a été généré mais le contact n'a pas encore soumis de réponse."
 * - Soumission introuvable : "La soumission de formulaire n'a pas été trouvée."
 * - Erreurs génériques : "Impossible de charger les données du formulaire: {error}"
 */
const useFormValidationData = (dateId) => {
  const [formData, setFormData] = useState(null);
  const [formId, setFormId] = useState(null);
  const [concert, setDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [validatedFields, setValidatedFields] = useState({});
  const [contact, setContact] = useState(null);
  const [lieu, setLieu] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
      console.log("Recherche de formulaire pour la date:", dateId);
      
      // 1. D'abord, récupérer les données de la date
      const dateRef = doc(db, 'dates', dateId);
      const dateDoc = await getDoc(dateRef);
      
      if (!dateDoc.exists()) {
        console.error("Date non trouvé:", dateId);
        setError("Ce date n'existe pas.");
        setLoading(false);
        return;
      }
      
      const dateData = {
        id: dateDoc.id,
        ...dateDoc.data()
      };
      
      console.log("Date trouvé:", dateData);
      setDate(dateData);
      
      // Variable locale pour les données du lieu (éviter la dépendance cyclique)
      let lieuData = null;
      
      // Récupérer les données du lieu si existant
      if (dateData.lieuId) {
        const lieuDoc = await getDoc(doc(db, 'lieux', dateData.lieuId));
        if (lieuDoc.exists()) {
          lieuData = {
            id: lieuDoc.id,
            ...lieuDoc.data()
          };
          setLieu(lieuData);
          console.log("Lieu trouvé:", lieuData);
        }
      }
      
      // 2. Chercher la soumission de formulaire associée à la date
      let formSubmissionId = null;
      
      // Si le date a déjà un formSubmissionId associé
      if (dateData.formSubmissionId) {
        console.log("FormSubmissionId trouvé dans la date:", dateData.formSubmissionId);
        formSubmissionId = dateData.formSubmissionId;
      } else {
        console.log("Recherche dans formSubmissions par dateId");
        // Chercher dans la collection formSubmissions
        // NOTE: Ne pas filtrer par organizationId pour les formSubmissions existantes
        // car elles n'ont pas encore ce champ
        const submissionsQuery = query(
          collection(db, 'formSubmissions'), 
          where('dateId', '==', dateId)
        );
        
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        if (submissionsSnapshot.empty) {
          console.log("Aucune soumission trouvée, recherche dans formLinks");
          // Si aucune soumission, vérifier si un lien a été généré
          // NOTE: Ne pas filtrer par organizationId pour les formLinks existants
          const linksQuery = query(
            collection(db, 'formLinks'), 
            where('dateId', '==', dateId)
          );
          
          const linksSnapshot = await getDocs(linksQuery);
          
          if (linksSnapshot.empty) {
            console.error("Aucun formulaire trouvé pour cette date");
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
        
        // Mettre à jour le date avec l'ID de la soumission
        await updateDoc(doc(db, 'dates', dateId), {
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
        
        // NOUVEAU : Les données du lieu NE SONT PAS automatiquement mises dans initialValues
        // Elles seront affichées dans "Valeur existante" et "Valeur du formulaire"
        // L'utilisateur choisira de copier ou non
        
        // NOUVEAU : Les données du formulaire public NE SONT PAS mises dans initialValues
        // Elles restent dans formDocData pour être affichées dans "Valeur du formulaire"
        if (formDocData.signataireData) {
          console.log("Données signataire trouvées dans la soumission:", formDocData.signataireData);
          // PAS de mapping vers initialValues - les données restent dans formDocData
        }
        
        if (formDocData.structureData) {
          console.log("Données structure trouvées dans la soumission:", formDocData.structureData);
          // PAS de mapping vers initialValues - les données restent dans formDocData
        }
        
        if (formDocData.lieuData) {
          console.log("Données de lieu trouvées dans la soumission:", formDocData.lieuData);
          // PAS de mapping vers initialValues - les données restent dans formDocData
        }
        
        // Récupérer les données existantes du contact (s'il existe)
        // D'abord essayer avec programmId de la soumission (rétrocompatibilité), sinon utiliser contactId de la date
        const contactIdToUse = formDocData.programmId || dateData.contactId || dateData.programmateurId;
        
        if (contactIdToUse) {
          try {
            const contactDoc = await getDoc(doc(db, 'contacts', contactIdToUse));
            if (contactDoc.exists()) {
              // Définir les données existantes du contact
              const contactData = {
                id: contactDoc.id,
                ...contactDoc.data()
              };
              setContact(contactData);
              console.log("Contact trouvé:", contactData);
              
              // NE PAS initialiser automatiquement les champs validés
              // Les données existantes seront affichées dans "Valeur existante"
              // L'utilisateur choisira de copier ou non depuis "Valeur du formulaire"
            } else {
              console.log("Contact non trouvé avec ID:", contactIdToUse);
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données du contact:", error);
          }
        } else {
          console.log("Aucun contact lié à ce date ou formulaire");
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
  }, [dateId]);

  useEffect(() => {
    if (dateId) {
      fetchData();
    }
  }, [dateId, fetchData]);

  return {
    formData,
    formId,
    date,
    loading,
    error,
    validated,
    setValidated,
    validatedFields,
    setValidatedFields,
    contact,
    programmateur: contact, // Rétrocompatibilité
    lieu,
    contactFields,
    structureFields,
    lieuFields
  };
};

export default useFormValidationData;
