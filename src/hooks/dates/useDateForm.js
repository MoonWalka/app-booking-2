/**
 * Hook optimisé pour le formulaire de date basé sur useGenericEntityForm
 * 
 * ⚠️ NOTE IMPORTANTE - APPROCHE RECOMMANDÉE ⚠️
 * Ce hook représente l'approche RECOMMANDÉE pour les nouveaux développements.
 * Il utilise DIRECTEMENT les hooks génériques plutôt que de passer par des wrappers
 * ou des hooks "Migrated/V2", conformément au plan de dépréciation officiel
 * (PLAN_DEPRECIATION_HOOKS.md) qui prévoit la suppression de tous les hooks 
 * spécifiques d'ici novembre 2025.
 */

import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGenericEntityForm from '@/hooks/generics/forms/useGenericEntityForm';
import { validateDateForm } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';
import { generateDateId } from '@/utils/idGenerators';
import { debugLog } from '@/utils/logUtils';
import { updateBidirectionalRelation } from '@/services/bidirectionalRelationsService';

/**
 * Hook optimisé pour gérer les formulaires de dates
 * Utilise directement useGenericEntityForm comme recommandé
 * 
 * @param {string} dateId - ID du date ou 'nouveau' pour un nouveau date
 * @returns {Object} - États et fonctions pour gérer le formulaire
 */
export const useDateForm = (dateId) => {
  const navigate = useNavigate();
  
  // Déterminer si c'est un nouveau date - modifier pour éviter les fausses détections
  // On ne considère un date comme nouveau QUE si l'ID est explicitement 'nouveau'
  const isNewDate = dateId === 'nouveau';
  
  // Pour un nouveau date, générer l'ID une seule fois pour éviter les boucles de render
  const generatedIdRef = useRef(isNewDate ? generateDateId() : null);
  
  // Références pour stocker les valeurs précédentes des relations
  const previousArtisteIdRef = useRef(null);
  const previousLieuIdRef = useRef(null);
  const previousContactIdsRef = useRef([]); // Changé en array pour multi-contacts


  // Nettoyer les logs pour éviter la confusion (supprimer références à useDateFormMigrated)
  
  debugLog(`Initialisation du formulaire de date optimisé: ${isNewDate ? 'nouveau date' : `date ${dateId}`}`, 'info', 'useDateForm');
  
  // Fonction de validation spécifique au date
  // Note: on utilise directement validateDateForm de utils/validation.js
  
  // Fonction de transformation des données avant sauvegarde
  const transformDateData = useCallback((data) => {
    // Transformations spécifiques aux dates avant sauvegarde
    console.log('[WORKFLOW_TEST] 2. Sauvegarde du date avec structureId - transformation des données', {
      structureId: data.structureId,
      structureNom: data.structureNom
    });
    
    const transformedData = {
      ...data,
      // Normalisation du titre
      titre: data.titre ? data.titre.trim() : '',
      // Harmonisation : prix = montant (pour la base de données)
      prix: data.montant ? parseFloat(data.montant) : 0,
      // Conversion de la capacité en nombre entier
      capacité: data.capacité ? parseInt(data.capacité, 10) : 0,
      // Ajout de la date de mise à jour
      updatedAt: new Date()
    };
    
    // Support rétrocompatibilité contactId (ancien format)
    // Si on a un contactId mais pas de contactIds, migrer automatiquement
    if (data.contactId && (!data.contactIds || data.contactIds.length === 0)) {
      transformedData.contactIds = [data.contactId];
      // Ne pas supprimer contactId pour la rétrocompatibilité temporaire
      debugLog('Migration automatique contactId → contactIds', 'info', 'useDateForm', {
        contactId: data.contactId,
        contactIds: transformedData.contactIds
      });
    }
    
    // S'assurer que contactIds est toujours un tableau
    if (!Array.isArray(transformedData.contactIds)) {
      transformedData.contactIds = [];
    }
    
    debugLog('Données transformées avant sauvegarde', 'debug', 'useDateForm', transformedData);
    return transformedData;
  }, []);
  

  // Callbacks pour les opérations réussies ou en erreur
  const onSuccessCallback = useCallback(async (data, action) => {
    console.log("[useDateForm] onSuccessCallback appelé", { data, action });
    
    // Si c'est un chargement initial (getById), on ne fait rien
    if (action === 'getById' || action === 'load') {
      console.log("[useDateForm] Action de chargement, on ignore");
      // Stocker les IDs initiaux pour détecter les changements futurs
      if (data) {
        previousArtisteIdRef.current = data.artisteId || null;
        previousLieuIdRef.current = data.lieuId || null;
        // Gérer la rétrocompatibilité : contactId (string) → contactIds (array)
        if (data.contactIds && Array.isArray(data.contactIds)) {
          previousContactIdsRef.current = data.contactIds;
        } else if (data.contactId) {
          previousContactIdsRef.current = [data.contactId];
        } else {
          previousContactIdsRef.current = [];
        }
      }
      return;
    }
    
    // Si c'est une création ou mise à jour, on affiche le message et on redirige
    if (action === 'create' || action === 'update') {
      const message = action === 'create'
        ? `Le date ${data.titre || ''} a été créé avec succès`
        : `Le date ${data.titre || ''} a été mis à jour avec succès`;
      
      console.log("[useDateForm] Affichage du message de succès:", message);
      showSuccessToast(message);
      
      // Gérer les relations bidirectionnelles pour l'artiste
      if (data.artisteId || previousArtisteIdRef.current) {
        try {
          console.log("[useDateForm] Gestion des relations bidirectionnelles artiste-date");
          
          // Si l'artiste a changé, supprimer la relation avec l'ancien artiste
          if (previousArtisteIdRef.current && previousArtisteIdRef.current !== data.artisteId) {
            console.log("[useDateForm] Suppression de la relation avec l'ancien artiste:", previousArtisteIdRef.current);
            await updateBidirectionalRelation({
              sourceType: 'dates',
              sourceId: data.id,
              targetType: 'artistes',
              targetId: previousArtisteIdRef.current,
              relationName: 'artistes',
              action: 'remove'
            });
          }
          
          // Ajouter la relation avec le nouvel artiste
          if (data.artisteId) {
            console.log("[useDateForm] Ajout de la relation avec le nouvel artiste:", data.artisteId);
            await updateBidirectionalRelation({
              sourceType: 'dates',
              sourceId: data.id,
              targetType: 'artistes',
              targetId: data.artisteId,
              relationName: 'artistes',
              action: 'add'
            });
          }
          
          // Mettre à jour la référence pour les prochaines modifications
          previousArtisteIdRef.current = data.artisteId;
          
        } catch (error) {
          console.error("[useDateForm] Erreur lors de la mise à jour des relations bidirectionnelles artiste:", error);
        }
      }
      
      // Gérer les relations bidirectionnelles pour le lieu
      if (data.lieuId || previousLieuIdRef.current) {
        try {
          console.log("[useDateForm] Gestion des relations bidirectionnelles lieu-date");
          
          // Si le lieu a changé, supprimer la relation avec l'ancien lieu
          if (previousLieuIdRef.current && previousLieuIdRef.current !== data.lieuId) {
            console.log("[useDateForm] Suppression de la relation avec l'ancien lieu:", previousLieuIdRef.current);
            await updateBidirectionalRelation({
              sourceType: 'dates',
              sourceId: data.id,
              targetType: 'lieux',
              targetId: previousLieuIdRef.current,
              relationName: 'lieu',
              action: 'remove'
            });
          }
          
          // Ajouter la relation avec le nouveau lieu
          if (data.lieuId) {
            console.log("[useDateForm] Ajout de la relation avec le nouveau lieu:", data.lieuId);
            await updateBidirectionalRelation({
              sourceType: 'dates',
              sourceId: data.id,
              targetType: 'lieux',
              targetId: data.lieuId,
              relationName: 'lieu',
              action: 'add'
            });
          }
          
          // Mettre à jour la référence pour les prochaines modifications
          previousLieuIdRef.current = data.lieuId;
          
        } catch (error) {
          console.error("[useDateForm] Erreur lors de la mise à jour des relations bidirectionnelles lieu:", error);
        }
      }
      
      // Gérer les relations bidirectionnelles pour les contacts (multi-contacts)
      // Normaliser les données pour gérer la rétrocompatibilité
      const currentContactIds = data.contactIds && Array.isArray(data.contactIds) 
        ? data.contactIds 
        : (data.contactId ? [data.contactId] : []);
      
      const previousContactIds = previousContactIdsRef.current || [];
      
      if (currentContactIds.length > 0 || previousContactIds.length > 0) {
        try {
          console.log("[useDateForm] Gestion des relations bidirectionnelles contacts-date");
          console.log("[useDateForm] Contacts précédents:", previousContactIds);
          console.log("[useDateForm] Contacts actuels:", currentContactIds);
          
          // Identifier les contacts à supprimer (présents avant mais plus maintenant)
          const contactsToRemove = previousContactIds.filter(id => !currentContactIds.includes(id));
          
          // Identifier les contacts à ajouter (nouveaux contacts)
          const contactsToAdd = currentContactIds.filter(id => !previousContactIds.includes(id));
          
          // Supprimer les anciennes relations
          for (const contactId of contactsToRemove) {
            console.log("[useDateForm] Suppression de la relation avec le contact:", contactId);
            await updateBidirectionalRelation({
              sourceType: 'dates',
              sourceId: data.id,
              targetType: 'contacts',
              targetId: contactId,
              relationName: 'contact',
              action: 'remove'
            });
          }
          
          // Ajouter les nouvelles relations
          for (const contactId of contactsToAdd) {
            console.log("[useDateForm] Ajout de la relation avec le contact:", contactId);
            await updateBidirectionalRelation({
              sourceType: 'dates',
              sourceId: data.id,
              targetType: 'contacts',
              targetId: contactId,
              relationName: 'contact',
              action: 'add'
            });
          }
          
          // Mettre à jour la référence pour les prochaines modifications
          previousContactIdsRef.current = currentContactIds;
          
        } catch (error) {
          console.error("[useDateForm] Erreur lors de la mise à jour des relations bidirectionnelles:", error);
          // Ne pas bloquer le flux principal si la mise à jour échoue
        }
      }
      
      // Les relances automatiques ont été supprimées - elles sont maintenant gérées par un système de tâches unifié
      
      // Redirection immédiate vers la liste des dates après sauvegarde
      console.log("[useDateForm] Redirection immédiate vers /dates");
      navigate('/dates');
    }
  }, [navigate]);

  const onErrorCallback = useCallback((error) => {
    
    const message = isNewDate
      ? `Erreur lors de la création du date: ${error.message}`
      : `Erreur lors de la sauvegarde du date: ${error.message}`;
    
    showErrorToast(message);
  }, [isNewDate]);
  
  // Références stables pour les callbacks
  const onSuccessCallbackRef = useRef();
  const onErrorCallbackRef = useRef();
  const transformDateDataRef = useRef();
  
  onSuccessCallbackRef.current = onSuccessCallback;
  onErrorCallbackRef.current = onErrorCallback;
  transformDateDataRef.current = transformDateData;
  
  // Utilisation directe du hook générique avec configuration spécifique aux dates
  const formOptions = useMemo(() => ({
    entityType: 'dates',
    // Important: pour un nouveau date, on passe null comme entityId, pas l'ID généré
    // Cela évite que useGenericEntityForm essaie de charger des données pour un ID qui n'existe pas encore
    entityId: isNewDate ? null : dateId,
    collectionName: 'dates',
    initialData: {
      // Valeurs par défaut pour un nouveau date
      titre: '',
      date: null,
      heure: '',
      statut: 'planifié',
      lieuId: '',
      artisteId: '',
      description: '',
      prix: '',
      capacité: '',
      isPublic: true,
      contactIds: [], // Changé de contactId à contactIds (array)
      contacts: []    // Garder pour la rétrocompatibilité temporaire
    },
    validateForm: validateDateForm,
    transformData: (...args) => transformDateDataRef.current(...args),
    onSuccess: (...args) => onSuccessCallbackRef.current(...args),
    onError: (...args) => onErrorCallbackRef.current(...args),
    // Pour un nouveau date, on fournit uniquement la fonction de génération d'ID
    // qui sera utilisée au moment de la sauvegarde
    generateId: isNewDate ? () => generatedIdRef.current : undefined,
    relatedEntities: [
      { name: 'lieu', collection: 'lieux', idField: 'lieuId' },
      { name: 'artiste', collection: 'artistes', idField: 'artisteId' },
      { name: 'contacts', collection: 'contacts', idField: 'contactIds', isArray: true } // Changé pour multi-contacts
    ]
  }), [isNewDate, dateId]);
  
  // TEMPORAIRE: Désactiver l'auto-save pour éviter les re-renders
  const formOptionsWithoutAutoSave = useMemo(() => ({
    enableAutoSave: false, // ⚠️ DÉSACTIVÉ TEMPORAIREMENT - À réactiver après tests
    enableValidation: true,
    validateOnChange: true, // ✅ RÉACTIVÉ - Impact faible sur les performances
    validateOnBlur: true
  }), []);
  
  const formHook = useGenericEntityForm(formOptions, formOptionsWithoutAutoSave);
  
  console.log('[useDateForm] after useGenericEntityForm hook:', {
    loading: formHook.loading,
    data: formHook.formData,
    error: formHook.error,
    entityId: formHook.entityId,
    isNew: formHook.isNew
  });
  
  // Log any changes to the form data
  useEffect(() => {
  }, [formHook.formData]);
  
  // Extension du hook avec des fonctionnalités spécifiques aux dates
  
  // Gérer le changement d'artiste (avec mise à jour des données liées)
  const handleArtisteChange = useCallback((artiste) => {
    
    if (artiste) {
      formHook.setFormData(prev => ({
        ...prev,
        artisteId: artiste.id,
        artisteNom: artiste.nom
      }));
      
      // TODO: Charger les détails de l'artiste dans les données liées
      // Note: loadRelatedEntity n'existe pas dans useGenericEntityForm
      // formHook.loadRelatedEntity('artiste', artiste.id);
    } else {
      formHook.setFormData(prev => ({
        ...prev,
        artisteId: null,
        artisteNom: ''
      }));
    }
  }, [formHook]);

  // Gérer le changement de lieu (avec mise à jour des données liées)
  const handleLieuChange = useCallback((lieu) => {
    
    if (lieu) {
      formHook.setFormData(prev => ({
        ...prev,
        lieuId: lieu.id,
        lieuNom: lieu.nom,
        ville: lieu?.adresse?.ville || ''
      }));
      
      // TODO: Charger les détails du lieu dans les données liées
      // Note: loadRelatedEntity n'existe pas dans useGenericEntityForm
      // formHook.loadRelatedEntity('lieu', lieu.id);
    } else {
      formHook.setFormData(prev => ({
        ...prev,
        lieuId: null,
        lieuNom: '',
        ville: ''
      }));
    }
  }, [formHook]);

  // Gérer le changement de contacts (multi-contacts)
  const handleContactsChange = useCallback((contactIds) => {
    debugLog('Changement de contacts', 'debug', 'useDateForm', { contactIds });
    
    formHook.setFormData(prev => ({
      ...prev,
      contactIds: Array.isArray(contactIds) ? contactIds : [],
      // Garder contactId pour rétrocompatibilité (premier contact de la liste)
      contactId: Array.isArray(contactIds) && contactIds.length > 0 ? contactIds[0] : null
    }));
  }, [formHook]);

  // Gérer l'ajout d'un contact (pour la rétrocompatibilité)
  const handleAddContact = useCallback((contact) => {
    if (!contact || !contact.id) return;
    
    formHook.setFormData(prev => {
      const currentIds = prev.contactIds || [];
      if (!currentIds.includes(contact.id)) {
        const newIds = [...currentIds, contact.id];
        return {
          ...prev,
          contactIds: newIds,
          contactId: newIds[0] || null // Garder le premier pour rétrocompatibilité
        };
      }
      return prev;
    });
  }, [formHook]);

  // Gérer la suppression d'un contact
  const handleRemoveContact = useCallback((contactId) => {
    formHook.setFormData(prev => {
      const newIds = (prev.contactIds || []).filter(id => id !== contactId);
      return {
        ...prev,
        contactIds: newIds,
        contactId: newIds[0] || null // Garder le premier pour rétrocompatibilité
      };
    });
  }, [formHook]);

  // Fonction pour gérer l'annulation du formulaire
  const handleCancel = useCallback(() => {
    debugLog('Annulation du formulaire date', 'info', 'useDateForm');
    
    // Si c'est un nouveau date, rediriger vers la liste
    if (isNewDate) {
      navigate('/dates');
    } else {
      // Si c'est un date existant, rediriger vers sa vue détails
      navigate(`/dates/${dateId}`);
    }
  }, [navigate, isNewDate, dateId]);

  // Add debug log before returning
  console.log("[useDateForm] Retourne. formData:", formHook.formData, 
    "loading:", formHook.loading, "isNewDate (variable du hook):", isNewDate,
    "dateId:", dateId, "entityId utilisé:", isNewDate ? null : dateId,
    "handleChange fourni:", formHook.handleChange ? "✓" : "✗");
    
  // Test explicite de handleChange
  if (!formHook.handleChange) {
    console.error("[useDateForm] ERREUR: handleChange n'est pas défini dans l'objet retourné par useGenericEntityForm!");
  }

  // Wrapper pour handleChange qui ajoute des logs détaillés et force la mise à jour de formData si nécessaire
  const handleChangeWithLogs = useCallback((e) => {
    
    // Extraire le nom et la valeur du champ
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    try {
      // Essayer d'utiliser la fonction handleChange originale
      if (formHook.handleChange) {
        formHook.handleChange(e);
      } else {
        // Fallback : mettre à jour directement les données avec updateFormData
        console.warn("[useDateForm] handleChange non défini, utilisation de updateFormData à la place");
        formHook.setFormData(prev => ({ 
          ...prev, 
          [name]: fieldValue 
        }));
      }
    } catch (error) {
      // En cas d'erreur, utiliser updateFormData comme fallback
      console.error("[useDateForm] Erreur dans handleChange:", error);
      console.warn("[useDateForm] Tentative de mise à jour avec updateFormData");
      
      formHook.setFormData(prev => ({ 
        ...prev, 
        [name]: fieldValue 
      }));
    }
  }, [formHook]);

  // Wrapper pour handleSubmit avec logs détaillés
  const handleSubmitWithLogs = useCallback(async (e) => {
    console.log("[useDateForm] handleSubmitWithLogs appelé");
    console.log("[useDateForm] Event:", e);
    console.log("[useDateForm] formData actuel:", formHook.formData);
    console.log("[useDateForm] isNewDate:", isNewDate);
    console.log("[useDateForm] generatedId:", generatedIdRef.current);
    console.log("[useDateForm] formHook.handleSubmit existe:", !!formHook.handleSubmit);
    console.log("[useDateForm] Type de formHook.handleSubmit:", typeof formHook.handleSubmit);
    
    try {
      const result = await formHook.handleSubmit(e);
      console.log("[useDateForm] Résultat handleSubmit:", result);
      return result;
    } catch (error) {
      console.error("[useDateForm] Erreur dans handleSubmit:", error);
      console.error("[useDateForm] Stack trace:", error.stack);
      throw error;
    }
  }, [formHook, isNewDate]);

  // Enrichir formData avec l'id de l'entité pour exposer date.id
  const dateDataWithId = { ...formHook.formData, id: formHook.entityId };
  
  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook,
    // Remplacer handleChange par notre version avec logs détaillés
    handleChange: handleChangeWithLogs,
    // Remplacer handleSubmit par notre version avec logs
    handleSubmit: handleSubmitWithLogs,
    // Propriétés et méthodes spécifiques aux dates
    handleArtisteChange,
    handleLieuChange,
    handleContactsChange,    // Nouveau : pour gérer plusieurs contacts
    handleAddContact,        // Gardé pour rétrocompatibilité
    handleRemoveContact,     // Adapté pour gérer par ID
    handleCancel,
    isNewDate,
    // Exposer les données du date enrichies avec l'id pour la DX
    date: dateDataWithId,
    // TODO: Gérer les entités liées différemment car relatedData n'existe pas dans useGenericEntityForm
    lieu: null,
    artiste: null,
    contact: null
  };
};

export default useDateForm;