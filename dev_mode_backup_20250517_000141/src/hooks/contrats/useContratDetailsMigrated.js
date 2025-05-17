// src/hooks/contrats/useContratDetailsMigrated.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from '@/firebaseInit';
import { db } from '@/firebaseInit';
import { useGenericEntityDetails } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook migré pour la gestion des détails d'un contrat
 * Utilise useGenericEntityDetails comme base tout en préservant les fonctionnalités spécifiques
 * 
 * @param {string} contratId - ID du contrat
 * @returns {Object} États et méthodes pour gérer un contrat et ses relations
 */
const useContratDetailsMigrated = (contratId) => {
  const navigate = useNavigate();
  
  // Configuration des entités liées pour useGenericEntityDetails
  const relatedEntities = [
    { 
      name: 'concert', 
      collection: 'concerts', 
      idField: 'concertId',
      type: 'one-to-one'
    },
    { 
      name: 'template', 
      collection: 'contratTemplates', 
      idField: 'templateId',
      type: 'one-to-one'
    }
  ];
  
  // Requêtes personnalisées pour charger les entités liées indirectement (via le concert)
  const customQueries = {
    // Requête personnalisée pour charger le programmateur via le concert
    programmateur: async (contratData) => {
      if (!contratData.concertId) return null;
      
      try {
        // Récupérer d'abord le concert
        const concertDoc = await getDoc(doc(db, 'concerts', contratData.concertId));
        if (!concertDoc.exists() || !concertDoc.data().programmateurId) return null;
        
        // Récupérer ensuite le programmateur
        const progDoc = await getDoc(doc(db, 'programmateurs', concertDoc.data().programmateurId));
        if (!progDoc.exists()) return null;
        
        return { id: progDoc.id, ...progDoc.data() };
      } catch (err) {
        console.error('Erreur lors du chargement du programmateur:', err);
        return null;
      }
    },
    
    // Requête personnalisée pour charger le lieu via le concert
    lieu: async (contratData) => {
      if (!contratData.concertId) return null;
      
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', contratData.concertId));
        if (!concertDoc.exists() || !concertDoc.data().lieuId) return null;
        
        const lieuDoc = await getDoc(doc(db, 'lieux', concertDoc.data().lieuId));
        if (!lieuDoc.exists()) return null;
        
        return { id: lieuDoc.id, ...lieuDoc.data() };
      } catch (err) {
        console.error('Erreur lors du chargement du lieu:', err);
        return null;
      }
    },
    
    // Requête personnalisée pour charger l'artiste via le concert
    artiste: async (contratData) => {
      if (!contratData.concertId) return null;
      
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', contratData.concertId));
        if (!concertDoc.exists() || !concertDoc.data().artisteId) return null;
        
        const artisteDoc = await getDoc(doc(db, 'artistes', concertDoc.data().artisteId));
        if (!artisteDoc.exists()) return null;
        
        return { id: artisteDoc.id, ...artisteDoc.data() };
      } catch (err) {
        console.error('Erreur lors du chargement de l\'artiste:', err);
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
    programmateur: genericDetails.relatedData.programmateur || null,
    lieu: genericDetails.relatedData.lieu || null,
    artiste: genericDetails.relatedData.artiste || null,
    entreprise: genericDetails.relatedData.entreprise || null,
    loading: genericDetails.loading,
    error: genericDetails.error
  };
};

export default useContratDetailsMigrated;