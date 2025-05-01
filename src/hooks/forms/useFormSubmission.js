// src/hooks/forms/useFormSubmission.js
import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook générique pour gérer la soumission de formulaire vers Firestore
 * @param {Object} options - Options de configuration
 * @param {string} options.collection - Nom de la collection Firestore
 * @param {Function} options.onSuccess - Callback appelé après une soumission réussie
 * @param {Function} options.onError - Callback appelé en cas d'erreur
 * @param {Function} options.validate - Fonction de validation (optionnelle)
 * @param {Function} options.transformData - Fonction pour transformer les données avant enregistrement (optionnelle)
 */
const useFormSubmission = (options) => {
  const {
    collection,
    onSuccess,
    onError,
    validate = () => true,
    transformData = (data) => data
  } = options;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  /**
   * Soumettre des données à Firestore
   * @param {Object} data - Données à soumettre
   * @param {string} [id] - ID du document (optionnel, généré automatiquement si non fourni)
   * @param {boolean} [merge=true] - Fusionner avec les données existantes si true
   */
  const submitToFirestore = async (data, id = null, merge = true) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      // Valider les données
      const isValid = validate(data);
      if (!isValid) {
        throw new Error('Données invalides');
      }
      
      // Transformer les données si nécessaire
      const processedData = transformData({
        ...data,
        updatedAt: serverTimestamp(),
        ...(id ? {} : { createdAt: serverTimestamp() })
      });
      
      // Créer ou mettre à jour le document
      const docRef = id 
        ? doc(db, collection, id) 
        : doc(db, collection);
      
      await setDoc(docRef, processedData, { merge });
      
      setSubmitSuccess(true);
      
      if (onSuccess) {
        onSuccess({
          id: id || docRef.id,
          ...processedData
        });
      }
      
      return {
        id: id || docRef.id,
        ...processedData
      };
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde dans ${collection}:`, error);
      
      setSubmitError(error.message || 'Une erreur est survenue lors de la sauvegarde');
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    submitError,
    submitSuccess,
    submitToFirestore,
    resetSubmitState: () => {
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  };
};

export default useFormSubmission;