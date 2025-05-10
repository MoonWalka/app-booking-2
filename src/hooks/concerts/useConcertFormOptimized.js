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

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntityForm } from '@/hooks/common';
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
export const useConcertFormOptimized = (concertId) => {
  const navigate = useNavigate();
  const isNewConcert = !concertId || concertId === 'nouveau';
  
  debugLog(`Initialisation du formulaire de concert optimisé: ${isNewConcert ? 'nouveau concert' : `concert ${concertId}`}`, 'info', 'useConcertFormOptimized');
  
  // Fonction de validation spécifique au concert
  // Note: on utilise directement validateConcertForm de utils/validation.js
  
  // Fonction de transformation des données avant sauvegarde
  const transformConcertData = (data) => {
    // Transformations spécifiques aux concerts avant sauvegarde
    const transformedData = {
      ...data,
      // Normalisation du nom
      nom: data.nom ? data.nom.trim() : '',
      // Conversion du prix en nombre
      prix: data.prix ? parseFloat(data.prix) : 0,
      // Conversion de la capacité en nombre entier
      capacité: data.capacité ? parseInt(data.capacité, 10) : 0,
      // Ajout de la date de mise à jour
      updatedAt: new Date()
    };
    
    debugLog('Données transformées avant sauvegarde', 'debug', 'useConcertFormOptimized', transformedData);
    return transformedData;
  };
  
  // Callbacks pour les opérations réussies ou en erreur
  const onSuccessCallback = useCallback((savedId, savedData) => {
    const message = isNewConcert
      ? `Le concert ${savedData.nom || ''} a été créé avec succès`
      : `Le concert ${savedData.nom || ''} a été mis à jour avec succès`;
    
    showSuccessToast(message);
    navigate(`/concerts/${savedId}`);
  }, [isNewConcert, navigate]);

  const onErrorCallback = useCallback((error) => {
    const message = isNewConcert
      ? `Erreur lors de la création du concert: ${error.message}`
      : `Erreur lors de la sauvegarde du concert: ${error.message}`;
    
    showErrorToast(message);
  }, [isNewConcert]);
  
  // Utilisation directe du hook générique avec configuration spécifique aux concerts
  const formHook = useGenericEntityForm({
    entityType: 'concerts',
    entityId: isNewConcert ? null : concertId,
    collectionName: 'concerts',
    initialData: {
      // Valeurs par défaut pour un nouveau concert
      nom: '',
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
    transformData: transformConcertData,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    generateId: isNewConcert ? generateConcertId : undefined,
    relatedEntities: [
      { name: 'lieu', collection: 'lieux', idField: 'lieuId' },
      { name: 'artiste', collection: 'artistes', idField: 'artisteId' },
      { name: 'programmateur', collection: 'programmateurs', idField: 'programmateurId' }
    ]
  });
  
  // Extension du hook avec des fonctionnalités spécifiques aux concerts
  
  // Gérer le changement d'artiste (avec mise à jour des données liées)
  const handleArtisteChange = useCallback((artiste) => {
    if (artiste) {
      formHook.updateFormData(prev => ({
        ...prev,
        artisteId: artiste.id,
        artisteNom: artiste.nom
      }));
      
      // Charger les détails de l'artiste dans les données liées
      formHook.loadRelatedEntity('artiste', artiste.id);
    } else {
      formHook.updateFormData(prev => ({
        ...prev,
        artisteId: null,
        artisteNom: ''
      }));
    }
  }, [formHook]);

  // Gérer le changement de lieu (avec mise à jour des données liées)
  const handleLieuChange = useCallback((lieu) => {
    if (lieu) {
      formHook.updateFormData(prev => ({
        ...prev,
        lieuId: lieu.id,
        lieuNom: lieu.nom,
        ville: lieu?.adresse?.ville || ''
      }));
      
      // Charger les détails du lieu dans les données liées
      formHook.loadRelatedEntity('lieu', lieu.id);
    } else {
      formHook.updateFormData(prev => ({
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
    
    formHook.updateFormData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), contact]
    }));
  }, [formHook]);

  // Gérer la suppression d'un contact
  const handleRemoveContact = useCallback((index) => {
    formHook.updateFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  }, [formHook]);

  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques aux concerts
    handleArtisteChange,
    handleLieuChange,
    handleAddContact,
    handleRemoveContact,
    isNewConcert,
    // Raccourcis pour une meilleure DX
    concert: formHook.formData,
    lieu: formHook.relatedData?.lieu,
    artiste: formHook.relatedData?.artiste,
    programmateur: formHook.relatedData?.programmateur
  };
};

export default useConcertFormOptimized;