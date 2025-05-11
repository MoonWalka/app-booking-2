// src/hooks/common/useFormSubmission.js
import { useState } from 'react';
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove } from '@/firebaseInit';
import { db } from '@/firebaseInit';

/**
 * Hook générique pour gérer la soumission de formulaire vers Firestore
 * Version consolidée commune à toutes les entités
 * 
 * @param {Object} options - Options de configuration
 * @param {string} options.collection - Nom de la collection Firestore
 * @param {Function} options.onSuccess - Callback appelé après une soumission réussie
 * @param {Function} options.onError - Callback appelé en cas d'erreur
 * @param {Function} options.validate - Fonction de validation (optionnelle)
 * @param {Function} options.transformData - Fonction pour transformer les données avant enregistrement (optionnelle)
 * @param {Object} options.associations - Configuration des associations bidirectionnelles entre entités (optionnel)
 * @param {Function} options.beforeSubmit - Fonction exécutée avant la soumission (optionnelle)
 * @param {Function} options.afterSubmit - Fonction exécutée après la soumission réussie (optionnelle)
 * @param {Function} options.beforeDelete - Fonction exécutée avant la suppression (optionnelle)
 * @param {Function} options.afterDelete - Fonction exécutée après la suppression réussie (optionnelle)
 */
const useFormSubmission = (options) => {
  const {
    collection,
    onSuccess,
    onError,
    validate = () => true,
    transformData = (data) => data,
    associations = {},
    beforeSubmit = async () => {},
    afterSubmit = async () => {},
    beforeDelete = async () => {},
    afterDelete = async () => {}
  } = options;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  /**
   * Mettre à jour les associations bidirectionnelles entre entités
   * @param {string} documentId - ID du document principal
   * @param {Object} data - Données du document principal 
   * @param {Object} associationConfig - Configuration de l'association
   */
  const updateAssociation = async (documentId, data, associationConfig) => {
    const {
      targetCollection,
      targetField,
      sourceField,
      oldValue,
      newValue
    } = associationConfig;
    
    try {
      // Si l'ancienne valeur est différente de la nouvelle, supprimer l'ancienne association
      if (oldValue && oldValue !== newValue) {
        const oldTargetRef = doc(db, targetCollection, oldValue);
        await updateDoc(oldTargetRef, {
          [targetField]: arrayRemove(documentId)
        });
        console.log(`Association supprimée avec ${targetCollection}/${oldValue}`);
      }
      
      // Si une nouvelle valeur est spécifiée, créer la nouvelle association
      if (newValue) {
        const targetRef = doc(db, targetCollection, newValue);
        await updateDoc(targetRef, {
          [targetField]: arrayUnion(documentId),
          updatedAt: serverTimestamp()
        });
        console.log(`Association créée avec ${targetCollection}/${newValue}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'association avec ${targetCollection}:`, error);
      throw error;
    }
  };
  
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
      // Exécuter le hook beforeSubmit
      await beforeSubmit(data, id);
      
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
      
      const documentId = id || docRef.id;
      
      await setDoc(docRef, processedData, { merge });
      
      // Mettre à jour les associations si configurées
      if (Object.keys(associations).length > 0) {
        for (const [key, config] of Object.entries(associations)) {
          await updateAssociation(documentId, processedData, config);
        }
      }
      
      // Exécuter le hook afterSubmit
      await afterSubmit(documentId, processedData);
      
      setSubmitSuccess(true);
      
      if (onSuccess) {
        onSuccess({
          id: documentId,
          ...processedData
        });
      }
      
      return {
        id: documentId,
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
  
  /**
   * Supprimer un document de Firestore et mettre à jour les associations
   * @param {string} id - ID du document à supprimer
   */
  const deleteFromFirestore = async (id) => {
    if (!id) return;
    
    setIsDeleting(true);
    setSubmitError(null);
    
    try {
      // Exécuter le hook beforeDelete
      await beforeDelete(id);
      
      // Supprimer les associations si configurées
      if (Object.keys(associations).length > 0) {
        for (const [key, config] of Object.entries(associations)) {
          if (config.newValue) {
            const targetRef = doc(db, config.targetCollection, config.newValue);
            await updateDoc(targetRef, {
              [config.targetField]: arrayRemove(id)
            });
            console.log(`Association supprimée avec ${config.targetCollection}/${config.newValue}`);
          }
        }
      }
      
      // Supprimer le document
      await deleteDoc(doc(db, collection, id));
      console.log(`Document supprimé: ${collection}/${id}`);
      
      // Exécuter le hook afterDelete
      await afterDelete(id);
      
      if (onSuccess) {
        onSuccess({ id, deleted: true });
      }
      
      return { id, deleted: true };
    } catch (error) {
      console.error(`Erreur lors de la suppression dans ${collection}:`, error);
      
      setSubmitError(error.message || 'Une erreur est survenue lors de la suppression');
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  return {
    isSubmitting,
    isDeleting,
    submitError,
    submitSuccess,
    showDeleteConfirm,
    setShowDeleteConfirm,
    submitToFirestore,
    deleteFromFirestore,
    resetSubmitState: () => {
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  };
};

export default useFormSubmission;