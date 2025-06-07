// src/hooks/concerts/useConcertFormFixed.js
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntityForm } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook optimisé pour le formulaire de concert avec gestion locale des entités
 * Version CORRIGÉE pour affichage immédiat des sélections
 */
const useConcertFormFixed = (concertId = null) => {
  const navigate = useNavigate();
  
  // États locaux pour les entités sélectionnées (affichage immédiat)
  const [localLieu, setLocalLieu] = useState(null);
  const [localContact, setLocalContact] = useState(null);
  const [localProgrammateur, setLocalProgrammateur] = useState(null); // Alias rétrocompatibilité
  const [localArtiste, setLocalArtiste] = useState(null);
  const [localStructure, setLocalStructure] = useState(null);
  
  // Hook générique pour le formulaire
  const genericFormHook = useGenericEntityForm({
    entityType: 'concert',
    collectionName: 'concerts',
    entityId: concertId,
    defaultValues: {
      titre: '',
      date: '',
      heureDebut: '',
      heureFin: '',
      statut: 'contact',
      montant: 0,
      lieuId: '',
      lieuNom: '',
      lieuVille: '',
      contactId: '',
      contactNom: '', // Nouveau format
      programmateurNom: '', // Rétrocompatibilité
      artisteId: '',
      artisteNom: '',
      structureId: '',
      structureNom: '',
      notes: '',
      hasFormSubmission: false,
      formSubmissionId: null
    },
    onSuccess: () => {
      showSuccessToast('Concert enregistré avec succès');
      navigate(`/concerts/${concertId || 'new'}`);
    },
    onError: (error) => {
      showErrorToast(`Erreur lors de l'enregistrement: ${error.message}`);
    }
  });
  
  // Synchroniser les entités locales avec les données du formulaire au chargement
  useEffect(() => {
    if (genericFormHook.formData && !localLieu && !localContact && !localArtiste) {
      const { formData } = genericFormHook;
      
      // Reconstruire les objets entités à partir des données du formulaire
      if (formData.lieuId && formData.lieuNom) {
        setLocalLieu({
          id: formData.lieuId,
          nom: formData.lieuNom,
          ville: formData.lieuVille
        });
      }
      
      // Contact/Programmateur
      if (formData.contactId && (formData.contactNom || formData.programmateurNom)) {
        const contact = {
          id: formData.contactId,
          nom: formData.contactNom || formData.programmateurNom,
          prenom: formData.contactPrenom || formData.programmateurPrenom || ''
        };
        setLocalContact(contact);
        setLocalProgrammateur(contact); // Rétrocompatibilité
      }
      
      if (formData.artisteId && formData.artisteNom) {
        setLocalArtiste({
          id: formData.artisteId,
          nom: formData.artisteNom
        });
      }
      
      if (formData.structureId && formData.structureNom) {
        setLocalStructure({
          id: formData.structureId,
          nom: formData.structureNom
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genericFormHook.formData]);
  
  // Handlers améliorés pour la sélection d'entités
  const handleSelectLieu = useCallback((lieu) => {
    debugLog('[useConcertFormFixed] Lieu sélectionné:', lieu);
    
    // Mettre à jour l'état local immédiatement
    setLocalLieu(lieu);
    
    // Mettre à jour les données du formulaire
    if (lieu) {
      genericFormHook.handleChange({
        target: {
          name: 'lieuId',
          value: lieu.id
        }
      });
      genericFormHook.handleChange({
        target: {
          name: 'lieuNom',
          value: lieu.nom
        }
      });
      genericFormHook.handleChange({
        target: {
          name: 'lieuVille',
          value: lieu.ville || ''
        }
      });
    }
  }, [genericFormHook]);
  
  const handleRemoveLieu = useCallback(() => {
    setLocalLieu(null);
    genericFormHook.handleChange({ target: { name: 'lieuId', value: '' } });
    genericFormHook.handleChange({ target: { name: 'lieuNom', value: '' } });
    genericFormHook.handleChange({ target: { name: 'lieuVille', value: '' } });
  }, [genericFormHook]);
  
  const handleSelectContact = useCallback((contact) => {
    debugLog('[useConcertFormFixed] Contact sélectionné:', contact);
    
    // Mettre à jour l'état local immédiatement
    setLocalContact(contact);
    setLocalProgrammateur(contact); // Rétrocompatibilité
    
    // Mettre à jour les données du formulaire
    if (contact) {
      genericFormHook.handleChange({
        target: {
          name: 'contactId',
          value: contact.id
        }
      });
      genericFormHook.handleChange({
        target: {
          name: 'contactNom',
          value: `${contact.prenom || ''} ${contact.nom || ''}`.trim()
        }
      });
      genericFormHook.handleChange({
        target: {
          name: 'programmateurNom', // Rétrocompatibilité
          value: `${contact.prenom || ''} ${contact.nom || ''}`.trim()
        }
      });
    }
  }, [genericFormHook]);
  
  // Alias pour rétrocompatibilité
  const handleSelectProgrammateur = handleSelectContact;
  
  const handleRemoveContact = useCallback(() => {
    setLocalContact(null);
    setLocalProgrammateur(null); // Rétrocompatibilité
    genericFormHook.handleChange({ target: { name: 'contactId', value: '' } });
    genericFormHook.handleChange({ target: { name: 'contactNom', value: '' } });
    genericFormHook.handleChange({ target: { name: 'programmateurNom', value: '' } }); // Rétrocompatibilité
  }, [genericFormHook]);
  
  // Alias pour rétrocompatibilité
  const handleRemoveProgrammateur = handleRemoveContact;
  
  const handleSelectArtiste = useCallback((artiste) => {
    debugLog('[useConcertFormFixed] Artiste sélectionné:', artiste);
    
    // Mettre à jour l'état local immédiatement
    setLocalArtiste(artiste);
    
    // Mettre à jour les données du formulaire
    if (artiste) {
      genericFormHook.handleChange({
        target: {
          name: 'artisteId',
          value: artiste.id
        }
      });
      genericFormHook.handleChange({
        target: {
          name: 'artisteNom',
          value: artiste.nom
        }
      });
    }
  }, [genericFormHook]);
  
  const handleRemoveArtiste = useCallback(() => {
    setLocalArtiste(null);
    genericFormHook.handleChange({ target: { name: 'artisteId', value: '' } });
    genericFormHook.handleChange({ target: { name: 'artisteNom', value: '' } });
  }, [genericFormHook]);
  
  const handleSelectStructure = useCallback((structure) => {
    debugLog('[useConcertFormFixed] Structure sélectionnée:', structure);
    
    // Mettre à jour l'état local immédiatement
    setLocalStructure(structure);
    
    // Mettre à jour les données du formulaire
    if (structure) {
      genericFormHook.handleChange({
        target: {
          name: 'structureId',
          value: structure.id
        }
      });
      genericFormHook.handleChange({
        target: {
          name: 'structureNom',
          value: structure.nom || structure.raisonSociale || ''
        }
      });
    }
  }, [genericFormHook]);
  
  const handleRemoveStructure = useCallback(() => {
    setLocalStructure(null);
    genericFormHook.handleChange({ target: { name: 'structureId', value: '' } });
    genericFormHook.handleChange({ target: { name: 'structureNom', value: '' } });
  }, [genericFormHook]);
  
  // API du hook
  const api = useMemo(() => ({
    // Données du formulaire
    formData: genericFormHook.formData,
    handleChange: genericFormHook.handleChange,
    handleSubmit: genericFormHook.handleSubmit,
    
    // États
    loading: genericFormHook.loading,
    isSubmitting: genericFormHook.isSubmitting,
    error: genericFormHook.error,
    
    // Entités locales pour affichage immédiat (nouvelle API)
    lieu: localLieu,
    contact: localContact,
    artiste: localArtiste,
    structure: localStructure,
    
    // Entités locales (rétrocompatibilité)
    programmateur: localProgrammateur,
    
    // Handlers de sélection (nouvelle API)
    handleSelectLieu,
    handleRemoveLieu,
    handleSelectContact,
    handleRemoveContact,
    handleSelectArtiste,
    handleRemoveArtiste,
    handleSelectStructure,
    handleRemoveStructure,
    
    // Handlers de sélection (rétrocompatibilité)
    handleSelectProgrammateur,
    handleRemoveProgrammateur,
    
    // Alias pour compatibilité
    setLieu: handleSelectLieu,
    setContact: handleSelectContact,
    setProgrammateur: handleSelectProgrammateur,
    setArtiste: handleSelectArtiste,
    setStructure: handleSelectStructure
  }), [
    genericFormHook,
    localLieu,
    localContact,
    localProgrammateur,
    localArtiste,
    localStructure,
    handleSelectLieu,
    handleRemoveLieu,
    handleSelectContact,
    handleRemoveContact,
    handleSelectProgrammateur,
    handleRemoveProgrammateur,
    handleSelectArtiste,
    handleRemoveArtiste,
    handleSelectStructure,
    handleRemoveStructure
  ]);
  
  return api;
};

export default useConcertFormFixed;