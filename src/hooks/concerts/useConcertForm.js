import { useState, useEffect, useCallback } from 'react';
import { useGenericEntityForm } from '@/hooks/common/useGenericEntityForm';

/**
 * Hook pour la gestion des formulaires de concerts
 * Version unifiée basée sur useGenericEntityForm, remplace les deux implémentations précédentes
 * 
 * @param {string} concertId - ID du concert ou 'nouveau' pour un nouveau concert
 * @returns {Object} États et fonctions pour gérer le formulaire de concert
 */
const useConcertForm = (concertId) => {
  // Configuration des entités liées à un concert
  const relatedEntities = [
    { 
      name: 'lieu',
      collection: 'lieux',
      idField: 'lieuId',
      nameField: 'lieuNom'
    },
    { 
      name: 'programmateur',
      collection: 'programmateurs',
      idField: 'programmateurId',
      nameField: 'programmateurNom'
    },
    { 
      name: 'artiste',
      collection: 'artistes',
      idField: 'artisteId',
      nameField: 'artisteNom'
    }
  ];

  // Données initiales du formulaire
  const initialData = {
    titre: '',
    date: '',
    heure: '',
    montant: '',
    statut: 'en_negociation',
    notes: '',
    lieuId: null,
    lieuNom: '',
    programmateurId: null,
    programmateurNom: '',
    artisteId: null,
    artisteNom: ''
  };

  // Fonction de validation
  const validateConcertForm = (data) => {
    const errors = {};
    
    if (!data.titre) {
      errors.titre = 'Le titre du concert est obligatoire';
    }
    
    if (!data.date) {
      errors.date = 'La date du concert est obligatoire';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      message: Object.keys(errors).length ? 'Veuillez corriger les erreurs dans le formulaire' : null
    };
  };

  // Fonction de transformation des données
  const transformConcertData = (data) => {
    // Formater la date si nécessaire
    let formattedDate = data.date;
    
    // Si la date est au format MM/DD/YYYY, la convertir en YYYY-MM-DD
    if (data.date && data.date.includes('/')) {
      const dateParts = data.date.split('/');
      if (dateParts.length === 3) {
        formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
      }
    }
    
    return {
      ...data,
      date: formattedDate,
      montant: data.montant ? parseFloat(data.montant) : null
    };
  };

  // Callback après sauvegarde réussie
  const onConcertSaveSuccess = (savedId, savedData, previousData) => {
    console.log(`Concert ${savedId} enregistré avec succès`, savedData);
    
    // Mettre à jour les relations si nécessaire (comme les concertsAssocies dans les entités liées)
    // Ce code pourrait être implémenté pour maintenir la cohérence des relations
  };

  // Utiliser le hook générique avec la configuration spécifique aux concerts
  const genericFormHook = useGenericEntityForm({
    entityType: 'concerts',
    entityId: concertId,
    initialData,
    collectionName: 'concerts',
    validateForm: validateConcertForm,
    transformData: transformConcertData,
    onSuccess: onConcertSaveSuccess,
    relatedEntities
  });

  // Pour faciliter l'accès aux entités liées spécifiques aux concerts
  const selectedLieu = genericFormHook.relatedData.lieu || null;
  const selectedProgrammateur = genericFormHook.relatedData.programmateur || null;
  const selectedArtiste = genericFormHook.relatedData.artiste || null;

  // Fonctions spécifiques pour sélectionner/désélectionner les entités liées aux concerts
  const handleSelectLieu = useCallback((lieu) => {
    genericFormHook.handleSelectRelatedEntity('lieu', lieu);
  }, [genericFormHook.handleSelectRelatedEntity]);

  const handleSelectProgrammateur = useCallback((programmateur) => {
    genericFormHook.handleSelectRelatedEntity('programmateur', programmateur);
  }, [genericFormHook.handleSelectRelatedEntity]);

  const handleSelectArtiste = useCallback((artiste) => {
    genericFormHook.handleSelectRelatedEntity('artiste', artiste);
  }, [genericFormHook.handleSelectRelatedEntity]);

  // Fonctions spécifiques pour désélectionner les entités liées
  const handleRemoveLieu = useCallback(() => {
    genericFormHook.handleRemoveRelatedEntity('lieu');
  }, [genericFormHook.handleRemoveRelatedEntity]);

  const handleRemoveProgrammateur = useCallback(() => {
    genericFormHook.handleRemoveRelatedEntity('programmateur');
  }, [genericFormHook.handleRemoveRelatedEntity]);

  const handleRemoveArtiste = useCallback(() => {
    genericFormHook.handleRemoveRelatedEntity('artiste');
  }, [genericFormHook.handleRemoveRelatedEntity]);

  // Pour maintenir la compatibilité avec le code existant, créons des wrappers pour les setters
  const setSelectedLieu = useCallback((lieu) => {
    if (lieu === null) {
      handleRemoveLieu();
    } else {
      handleSelectLieu(lieu);
    }
  }, [handleSelectLieu, handleRemoveLieu]);

  const setSelectedProgrammateur = useCallback((programmateur) => {
    if (programmateur === null) {
      handleRemoveProgrammateur();
    } else {
      handleSelectProgrammateur(programmateur);
    }
  }, [handleSelectProgrammateur, handleRemoveProgrammateur]);

  const setSelectedArtiste = useCallback((artiste) => {
    if (artiste === null) {
      handleRemoveArtiste();
    } else {
      handleSelectArtiste(artiste);
    }
  }, [handleSelectArtiste, handleRemoveArtiste]);

  return {
    ...genericFormHook,
    // Ajouter les propriétés spécifiques aux concerts pour maintenir la compatibilité avec le code existant
    selectedLieu,
    selectedProgrammateur,
    selectedArtiste,
    // Exposer les setters compatibles avec l'ancienne API
    setSelectedLieu,
    setSelectedProgrammateur,
    setSelectedArtiste,
    // Exposer les handlers spécifiques
    handleSelectLieu,
    handleSelectProgrammateur,
    handleSelectArtiste,
    handleRemoveLieu,
    handleRemoveProgrammateur,
    handleRemoveArtiste,
    // Ajouter les propriétés qui étaient dans les anciens hooks mais pas dans le générique
    initialProgrammateurId: selectedProgrammateur?.id,
    initialArtisteId: selectedArtiste?.id
  };
};

export default useConcertForm;
