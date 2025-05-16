// src/hooks/concerts/useConcertFormMigrated.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntityForm } from '@/hooks/common';
import { validateConcertForm } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';
import { generateConcertId } from '@/utils/idGenerators';

/**
 * Hook migré pour la gestion du formulaire de concert
 * Utilise useGenericEntityForm comme base
 * 
 * @param {string} id - ID du concert à éditer (optionnel, si null c'est un nouveau concert)
 * @returns {Object} API pour gérer le formulaire d'un concert
 */
const useConcertFormMigrated = (id) => {
  const navigate = useNavigate();
  const isNewConcert = !id;

  // Données initiales pour un nouveau concert
  const initialData = {
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
  };

  // Callbacks pour les opérations réussies ou en erreur
  const onSaveSuccess = useCallback((data) => {
    const message = isNewConcert
      ? `Le concert ${data.nom || ''} a été créé avec succès`
      : `Le concert ${data.nom || ''} a été mis à jour avec succès`;
    
    showSuccessToast(message);
    navigate(`/concerts/${data.id}`);
  }, [isNewConcert, navigate]);

  const onSaveError = useCallback((error) => {
    const message = isNewConcert
      ? `Erreur lors de la création du concert: ${error.message}`
      : `Erreur lors de la sauvegarde du concert: ${error.message}`;
    
    showErrorToast(message);
  }, [isNewConcert]);

  // Utiliser le hook générique avec la configuration appropriée
  const genericForm = useGenericEntityForm({
    // Configuration de base
    entityType: 'concert',
    collectionName: 'concerts',
    id,
    initialFormData: initialData,
    
    // Configuration des entités liées
    relatedEntities: [
      { name: 'lieu', idField: 'lieuId', collection: 'lieux' },
      { name: 'artiste', idField: 'artisteId', collection: 'artistes' }
    ],
    autoLoadRelated: true,
    
    // Validation et callbacks
    validateFormFn: validateConcertForm,
    onSaveSuccess,
    onSaveError,
    
    // Navigation
    navigate,
    returnPath: '/concerts',
    
    // Options avancées
    generateId: isNewConcert ? generateConcertId : undefined,
    addCreatedAt: isNewConcert // Ajouter createdAt seulement pour les nouveaux concerts
  });

  // Fonctions spécifiques aux concerts
  
  // Gérer le changement d'artiste
  const handleArtisteChange = useCallback((artiste) => {
    if (artiste) {
      genericForm.setFormData(prev => ({
        ...prev,
        artisteId: artiste.id,
        artisteNom: artiste.nom
      }));
      
      // Charger les détails de l'artiste dans les données liées
      genericForm.loadRelatedEntity('artiste', artiste.id);
    } else {
      genericForm.setFormData(prev => ({
        ...prev,
        artisteId: null,
        artisteNom: ''
      }));
    }
  }, [genericForm]);

  // Gérer le changement de lieu
  const handleLieuChange = useCallback((lieu) => {
    if (lieu) {
      genericForm.setFormData(prev => ({
        ...prev,
        lieuId: lieu.id,
        lieuNom: lieu.nom,
        ville: lieu.ville
      }));
      
      // Charger les détails du lieu dans les données liées
      genericForm.loadRelatedEntity('lieu', lieu.id);
    } else {
      genericForm.setFormData(prev => ({
        ...prev,
        lieuId: null,
        lieuNom: '',
        ville: ''
      }));
    }
  }, [genericForm]);

  // Gérer l'ajout d'un contact
  const handleAddContact = useCallback((contact) => {
    if (!contact.nom || !contact.email) return;
    
    genericForm.setFormData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), contact]
    }));
  }, [genericForm]);

  // Gérer la suppression d'un contact
  const handleRemoveContact = useCallback((index) => {
    genericForm.setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  }, [genericForm]);

  return {
    // Toutes les fonctionnalités du hook générique
    ...genericForm,
    
    // Fonctionnalités spécifiques aux concerts
    handleArtisteChange,
    handleLieuChange,
    handleAddContact,
    handleRemoveContact,
    isNewConcert
  };
};

export default useConcertFormMigrated;