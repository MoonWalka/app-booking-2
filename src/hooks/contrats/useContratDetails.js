// src/hooks/contrats/useContratDetails.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useGenericEntityDetails } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook migré pour la gestion des détails d'un contrat
 * Utilise useGenericEntityDetails comme base tout en préservant les fonctionnalités spécifiques
 * 
 * @param {string} contratId - ID du contrat
 * @returns {Object} États et méthodes pour gérer un contrat et ses relations
 */
const useContratDetails = (contratId) => {
  const navigate = useNavigate();
  
  // Configuration des entités liées pour useGenericEntityDetails
  const relatedEntities = [
    { 
      name: 'concert', 
      collection: 'concerts', 
      idField: 'dateId',
      type: 'one-to-one',
      essential: true
    },
    { 
      name: 'template', 
      collection: 'contratTemplates', 
      idField: 'templateId',
      type: 'one-to-one',
      essential: true
    },
    { 
      name: 'contact', 
      collection: 'contacts', 
      idField: 'contactId',
      type: 'custom-query',
      essential: true
    },
    { 
      name: 'lieu', 
      collection: 'lieux', 
      idField: 'lieuId',
      type: 'custom-query',
      essential: true
    },
    { 
      name: 'artiste', 
      collection: 'artistes', 
      idField: 'artisteId',
      type: 'custom-query',
      essential: true
    },
    { 
      name: 'entreprise', 
      collection: 'parametres', 
      idField: 'entrepriseId',
      type: 'custom-query',
      essential: true
    },
    { 
      name: 'structure', 
      collection: 'structures', 
      idField: 'structureId',
      type: 'custom-query',
      essential: false
    }
  ];
  
  // Requêtes personnalisées pour charger les entités liées indirectement (via le concert)
  const customQueries = {
    // Requête personnalisée pour charger le contact via le concert
    contact: async (contratData) => {
      console.log('[DEBUG] Chargement contact pour contrat:', contratData);
      
      if (!contratData.dateId) {
        console.log('[DEBUG] Pas de dateId dans le contrat');
        return null;
      }
      
      try {
        // Récupérer d'abord le concert
        console.log('[DEBUG] Récupération du concert:', contratData.dateId);
        const dateDoc = await getDoc(doc(db, 'concerts', contratData.dateId));
        
        if (!dateDoc.exists()) {
          console.log('[DEBUG] Date non trouvé');
          return null;
        }
        
        const dateData = dateDoc.data();
        console.log('[DEBUG] Données du concert:', dateData);
        
        if (!dateData.contactId) {
          console.log('[DEBUG] Pas de contactId dans le concert');
          return null;
        }
        
        // Récupérer ensuite le contact
        console.log('[DEBUG] Récupération du contact:', dateData.contactId);
        const progDoc = await getDoc(doc(db, 'contacts', dateData.contactId));
        
        if (!progDoc.exists()) {
          console.log('[DEBUG] Contact non trouvé');
          return null;
        }
        
        const contactData = { id: progDoc.id, ...progDoc.data() };
        console.log('[DEBUG] Données du contact:', contactData);
        
        return contactData;
      } catch (err) {
        console.error('[DEBUG] Erreur lors du chargement du contact:', err);
        return null;
      }
    },
    
    // Requête personnalisée pour charger le lieu via le concert
    lieu: async (contratData) => {
      console.log('[DEBUG] Chargement lieu pour contrat:', contratData);
      
      if (!contratData.dateId) {
        console.log('[DEBUG] Pas de dateId dans le contrat');
        return null;
      }
      
      try {
        const dateDoc = await getDoc(doc(db, 'concerts', contratData.dateId));
        
        if (!dateDoc.exists()) {
          console.log('[DEBUG] Date non trouvé pour le lieu');
          return null;
        }
        
        const dateData = dateDoc.data();
        console.log('[DEBUG] Données du date pour lieu:', dateData);
        
        if (!dateData.lieuId) {
          console.log('[DEBUG] Pas de lieuId dans le concert');
          return null;
        }
        
        console.log('[DEBUG] Récupération du lieu:', dateData.lieuId);
        const lieuDoc = await getDoc(doc(db, 'lieux', dateData.lieuId));
        
        if (!lieuDoc.exists()) {
          console.log('[DEBUG] Lieu non trouvé');
          return null;
        }
        
        const lieuData = { id: lieuDoc.id, ...lieuDoc.data() };
        console.log('[DEBUG] Données du lieu:', lieuData);
        
        return lieuData;
      } catch (err) {
        console.error('[DEBUG] Erreur lors du chargement du lieu:', err);
        return null;
      }
    },
    
    // Requête personnalisée pour charger l'artiste via le concert
    artiste: async (contratData) => {
      console.log('[DEBUG] Chargement artiste pour contrat:', contratData);
      
      if (!contratData.dateId) {
        console.log('[DEBUG] Pas de dateId dans le contrat');
        return null;
      }
      
      try {
        const dateDoc = await getDoc(doc(db, 'concerts', contratData.dateId));
        
        if (!dateDoc.exists()) {
          console.log('[DEBUG] Date non trouvé pour artiste');
          return null;
        }
        
        const dateData = dateDoc.data();
        console.log('[DEBUG] Données du date pour artiste:', dateData);
        
        if (!dateData.artisteId) {
          console.log('[DEBUG] Pas d\'artisteId dans le concert');
          return null;
        }
        
        console.log('[DEBUG] Récupération de l\'artiste:', dateData.artisteId);
        const artisteDoc = await getDoc(doc(db, 'artistes', dateData.artisteId));
        
        if (!artisteDoc.exists()) {
          console.log('[DEBUG] Artiste non trouvé');
          return null;
        }
        
        const artisteData = { id: artisteDoc.id, ...artisteDoc.data() };
        console.log('[DEBUG] Données de l\'artiste:', artisteData);
        
        return artisteData;
      } catch (err) {
        console.error('[DEBUG] Erreur lors du chargement de l\'artiste:', err);
        return null;
      }
    },
    
    // Requête personnalisée pour charger les paramètres de l'entreprise
    entreprise: async () => {
      try {
        const entrepriseDoc = await getDoc(doc(db, 'parametres', 'entreprise'));
        if (!entrepriseDoc.exists()) return null;
        
        return entrepriseDoc.data();
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres d\'entreprise:', err);
        return null;
      }
    },
    
    // Requête personnalisée pour charger la structure via le contact
    structure: async (contratData) => {
      console.log('[DEBUG] Chargement structure pour contrat:', contratData);
      
      if (!contratData.dateId) {
        console.log('[DEBUG] Pas de dateId dans le contrat');
        return null;
      }
      
      try {
        // Récupérer d'abord le concert
        const dateDoc = await getDoc(doc(db, 'concerts', contratData.dateId));
        
        if (!dateDoc.exists()) {
          console.log('[DEBUG] Date non trouvé pour structure');
          return null;
        }
        
        const dateData = dateDoc.data();
        console.log('[DEBUG] Données du date pour structure:', dateData);
        
        if (!dateData.contactId) {
          console.log('[DEBUG] Pas de contactId dans le concert');
          return null;
        }
        
        // Récupérer le contact
        const contactDoc = await getDoc(doc(db, 'contacts', dateData.contactId));
        
        if (!contactDoc.exists()) {
          console.log('[DEBUG] Contact non trouvé pour structure');
          return null;
        }
        
        const contactData = contactDoc.data();
        console.log('[DEBUG] Données du contact pour structure:', contactData);
        
        if (!contactData.structureId) {
          console.log('[DEBUG] Pas de structureId dans le contact');
          return null;
        }
        
        // Récupérer enfin la structure
        console.log('[DEBUG] Récupération de la structure:', contactData.structureId);
        const structureDoc = await getDoc(doc(db, 'structures', contactData.structureId));
        
        if (!structureDoc.exists()) {
          console.log('[DEBUG] Structure non trouvée');
          return null;
        }
        
        const structureData = { id: structureDoc.id, ...structureDoc.data() };
        console.log('[DEBUG] Données de la structure:', structureData);
        
        return structureData;
      } catch (err) {
        console.error('[DEBUG] Erreur lors du chargement de la structure:', err);
        return null;
      }
    }
  };

  // Fonction de transformation des données
  const transformData = useCallback((data) => {
    // Assurer que les champs importants sont toujours initialisés
    return {
      ...data,
      status: data.status || 'brouillon',
      dateCreation: data.dateCreation || new Date().toISOString(),
      dateModification: data.dateModification || new Date().toISOString()
    };
  }, []);

  // Callbacks après opérations
  const onSaveSuccess = useCallback(() => {
    showSuccessToast(`Le contrat a été enregistré avec succès`);
  }, []);

  const onSaveError = useCallback((error) => {
    showErrorToast(`Erreur lors de l'enregistrement du contrat: ${error.message}`);
  }, []);

  const onDeleteSuccess = useCallback(() => {
    showSuccessToast(`Le contrat a été supprimé avec succès`);
    navigate('/contrats');
  }, [navigate]);

  const onDeleteError = useCallback((error) => {
    showErrorToast(`Erreur lors de la suppression du contrat: ${error.message}`);
  }, []);

  // Formatage des valeurs pour l'affichage
  const formatFields = {
    dateSignature: (value) => value ? new Date(value).toLocaleDateString() : 'Non signé',
    dateCreation: (value) => value ? new Date(value).toLocaleDateString() : '-',
    dateModification: (value) => value ? new Date(value).toLocaleDateString() : '-',
    montant: (value) => value ? `${value} €` : 'Non spécifié'
  };

  // Utiliser le hook générique avec la configuration appropriée
  const genericDetails = useGenericEntityDetails({
    // Configuration de base
    entityType: 'contrat',
    collectionName: 'contrats',
    id: contratId,
    
    // Configuration des entités liées
    relatedEntities,
    autoLoadRelated: true,
    customQueries,
    
    // Transformateurs et formatage
    transformData,
    formatValue: (field, value) => formatFields[field] ? formatFields[field](value) : value,
    
    // Callbacks
    onSaveSuccess,
    onSaveError,
    onDeleteSuccess,
    onDeleteError,
    
    // Navigation
    navigate,
    returnPath: '/contrats',
    editPath: '/contrats/:id/edit',
  });

  // Exposer une API compatible avec l'ancien hook
  return {
    // Toutes les fonctionnalités du hook générique
    ...genericDetails,
    
    // Mapping des propriétés pour garantir la compatibilité avec l'ancien hook
    contrat: genericDetails.entity,
    setContrat: genericDetails.updateFormData,
    concert: genericDetails.relatedData.concert || null,
    template: genericDetails.relatedData.template || null,
    contact: genericDetails.relatedData.contact || null,
    lieu: genericDetails.relatedData.lieu || null,
    artiste: genericDetails.relatedData.artiste || null,
    entreprise: genericDetails.relatedData.entreprise || null,
    structure: genericDetails.relatedData.structure || null,
    loading: genericDetails.loading,
    error: genericDetails.error
  };
};

export default useContratDetails;