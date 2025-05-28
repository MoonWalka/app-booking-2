/**
 * Hook optimisé pour le formulaire de concert basé sur useGenericEntityForm
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
import { validateConcertForm } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';
import { generateConcertId } from '@/utils/idGenerators';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook optimisé pour gérer les formulaires de concerts
 * Utilise directement useGenericEntityForm comme recommandé
 * 
 * @param {string} concertId - ID du concert ou 'nouveau' pour un nouveau concert
 * @returns {Object} - États et fonctions pour gérer le formulaire
 */
export const useConcertForm = (concertId) => {
  const navigate = useNavigate();
  // Déterminer si c'est un nouveau concert - modifier pour éviter les fausses détections
  // On ne considère un concert comme nouveau QUE si l'ID est explicitement 'nouveau'
  const isNewConcert = concertId === 'nouveau';
  
  // Pour un nouveau concert, générer l'ID une seule fois pour éviter les boucles de render
  const generatedIdRef = useRef(isNewConcert ? generateConcertId() : null);


  // Nettoyer les logs pour éviter la confusion (supprimer références à useConcertFormMigrated)
  
  debugLog(`Initialisation du formulaire de concert optimisé: ${isNewConcert ? 'nouveau concert' : `concert ${concertId}`}`, 'info', 'useConcertForm');
  
  // Fonction de validation spécifique au concert
  // Note: on utilise directement validateConcertForm de utils/validation.js
  
  // Fonction de transformation des données avant sauvegarde
  const transformConcertData = useCallback((data) => {
    // Transformations spécifiques aux concerts avant sauvegarde
    
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
    
    debugLog('Données transformées avant sauvegarde', 'debug', 'useConcertForm', transformedData);
    return transformedData;
  }, []);
  
  // Callbacks pour les opérations réussies ou en erreur
  // Empêcher l'exécution sur le succès initial (chargement des données)
  const hasSubmittedRef = useRef(false);
  const onSuccessCallback = useCallback((savedId, savedData) => {
    if (!hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      return;
    }
    
    const message = isNewConcert
      ? `Le concert ${savedData.titre || ''} a été créé avec succès`
      : `Le concert ${savedData.titre || ''} a été mis à jour avec succès`;
    
    showSuccessToast(message);
    
    // Ne navigue plus automatiquement après sauvegarde pour rester dans /:id/edit
    // (Supprimez ou ajustez la redirection si nécessaire)
  }, [isNewConcert]);

  const onErrorCallback = useCallback((error) => {
    
    const message = isNewConcert
      ? `Erreur lors de la création du concert: ${error.message}`
      : `Erreur lors de la sauvegarde du concert: ${error.message}`;
    
    showErrorToast(message);
  }, [isNewConcert]);
  
  // Références stables pour les callbacks
  const onSuccessCallbackRef = useRef();
  const onErrorCallbackRef = useRef();
  const transformConcertDataRef = useRef();
  
  onSuccessCallbackRef.current = onSuccessCallback;
  onErrorCallbackRef.current = onErrorCallback;
  transformConcertDataRef.current = transformConcertData;
  
  // Utilisation directe du hook générique avec configuration spécifique aux concerts
  const formOptions = useMemo(() => ({
    entityType: 'concerts',
    // Important: pour un nouveau concert, on passe null comme entityId, pas l'ID généré
    // Cela évite que useGenericEntityForm essaie de charger des données pour un ID qui n'existe pas encore
    entityId: isNewConcert ? null : concertId,
    collectionName: 'concerts',
    initialData: {
      // Valeurs par défaut pour un nouveau concert
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
      contacts: []
    },
    validateForm: validateConcertForm,
    transformData: (...args) => transformConcertDataRef.current(...args),
    onSuccess: (...args) => onSuccessCallbackRef.current(...args),
    onError: (...args) => onErrorCallbackRef.current(...args),
    // Pour un nouveau concert, on fournit uniquement la fonction de génération d'ID
    // qui sera utilisée au moment de la sauvegarde
    generateId: isNewConcert ? () => generatedIdRef.current : undefined,
    relatedEntities: [
      { name: 'lieu', collection: 'lieux', idField: 'lieuId' },
      { name: 'artiste', collection: 'artistes', idField: 'artisteId' },
      { name: 'programmateur', collection: 'programmateurs', idField: 'programmateurId' }
    ]
  }), [isNewConcert, concertId]);
  
  // TEMPORAIRE: Désactiver l'auto-save pour éviter les re-renders
  const formOptionsWithoutAutoSave = useMemo(() => ({
    enableAutoSave: false, // ⚠️ DÉSACTIVÉ TEMPORAIREMENT - À réactiver après tests
    enableValidation: true,
    validateOnChange: true, // ✅ RÉACTIVÉ - Impact faible sur les performances
    validateOnBlur: true
  }), []);
  
  const formHook = useGenericEntityForm(formOptions, formOptionsWithoutAutoSave);
  
  console.log('[useConcertForm] after useGenericEntityForm hook:', {
    loading: formHook.loading,
    data: formHook.formData,
    error: formHook.error,
    entityId: formHook.entityId,
    isNew: formHook.isNew
  });
  
  // Log any changes to the form data
  useEffect(() => {
  }, [formHook.formData]);
  
  // Extension du hook avec des fonctionnalités spécifiques aux concerts
  
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

  // Gérer l'ajout d'un contact
  const handleAddContact = useCallback((contact) => {
    if (!contact.nom || !contact.email) return;
    
    formHook.setFormData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), contact]
    }));
  }, [formHook]);

  // Gérer la suppression d'un contact
  const handleRemoveContact = useCallback((index) => {
    formHook.setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  }, [formHook]);

  // Fonction pour gérer l'annulation du formulaire
  const handleCancel = useCallback(() => {
    debugLog('Annulation du formulaire concert', 'info', 'useConcertForm');
    
    // Si c'est un nouveau concert, rediriger vers la liste
    if (isNewConcert) {
      navigate('/concerts');
    } else {
      // Si c'est un concert existant, rediriger vers sa vue détails
      navigate(`/concerts/${concertId}`);
    }
  }, [navigate, isNewConcert, concertId]);

  // Add debug log before returning
  console.log("[useConcertForm] Retourne. formData:", formHook.formData, 
    "loading:", formHook.loading, "isNewConcert (variable du hook):", isNewConcert,
    "concertId:", concertId, "entityId utilisé:", isNewConcert ? null : concertId,
    "handleChange fourni:", formHook.handleChange ? "✓" : "✗");
    
  // Test explicite de handleChange
  if (!formHook.handleChange) {
    console.error("[useConcertForm] ERREUR: handleChange n'est pas défini dans l'objet retourné par useGenericEntityForm!");
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
        console.warn("[useConcertForm] handleChange non défini, utilisation de updateFormData à la place");
        formHook.setFormData(prev => ({ 
          ...prev, 
          [name]: fieldValue 
        }));
      }
    } catch (error) {
      // En cas d'erreur, utiliser updateFormData comme fallback
      console.error("[useConcertForm] Erreur dans handleChange:", error);
      console.warn("[useConcertForm] Tentative de mise à jour avec updateFormData");
      
      formHook.setFormData(prev => ({ 
        ...prev, 
        [name]: fieldValue 
      }));
    }
  }, [formHook]);

  // Wrapper pour handleSubmit avec logs détaillés
  const handleSubmitWithLogs = useCallback(async (e) => {
    console.log("[useConcertForm] handleSubmit appelé");
    console.log("[useConcertForm] formData actuel:", formHook.formData);
    console.log("[useConcertForm] isNewConcert:", isNewConcert);
    console.log("[useConcertForm] generatedId:", generatedIdRef.current);
    
    try {
      const result = await formHook.handleSubmit(e);
      console.log("[useConcertForm] Résultat handleSubmit:", result);
      return result;
    } catch (error) {
      console.error("[useConcertForm] Erreur dans handleSubmit:", error);
      throw error;
    }
  }, [formHook, isNewConcert]);

  // Enrichir formData avec l'id de l'entité pour exposer concert.id
  const concertDataWithId = { ...formHook.formData, id: formHook.entityId };
  
  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook,
    // Remplacer handleChange par notre version avec logs détaillés
    handleChange: handleChangeWithLogs,
    // Remplacer handleSubmit par notre version avec logs
    handleSubmit: handleSubmitWithLogs,
    // Propriétés et méthodes spécifiques aux concerts
    handleArtisteChange,
    handleLieuChange,
    handleAddContact,
    handleRemoveContact,
    handleCancel,
    isNewConcert,
    // Exposer les données du concert enrichies avec l'id pour la DX
    concert: concertDataWithId,
    // TODO: Gérer les entités liées différemment car relatedData n'existe pas dans useGenericEntityForm
    lieu: null,
    artiste: null,
    programmateur: null
  };
};

export default useConcertForm;