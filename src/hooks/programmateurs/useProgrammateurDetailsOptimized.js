// src/hooks/programmateurs/useProgrammateurDetailsOptimized.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  db,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  query,
  collection,
  where,
  getDocs
} from '@/firebaseInit';
import { useGenericEntityDetails } from '@/hooks/common';
import { validateProgrammateurForm } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la gestion des détails d'un programmateur
 * Implémentation conforme à l'originale pour garantir la compatibilité
 * avec les composants existants
 * 
 * @param {string} id - ID du programmateur
 * @returns {Object} États et méthodes pour gérer un programmateur
 */
const useProgrammateurDetailsOptimized = (id) => {
  console.log('[TRACE-UNIQUE][useProgrammateurDetailsOptimized] Entrée hook avec id:', id);
  const navigate = useNavigate();
  
  // Fonction pour formater les champs date - IDENTIQUE À L'ORIGINALE
  const formatFields = {
    createdAt: (value) => value ? format(new Date(value), 'PPP à HH:mm', { locale: fr }) : '-',
    updatedAt: (value) => value ? format(new Date(value), 'PPP à HH:mm', { locale: fr }) : '-',
    derniereActivite: (value) => value ? format(new Date(value), 'PPP', { locale: fr }) : '-',
  };

  // Fonction pour transformer les données - IDENTIQUE À L'ORIGINALE
  const transformData = useCallback((data) => {
    if (!data) return null;
    
    return {
      ...data,
      // Ajouter des champs calculés comme dans l'original
      displayName: data.prenom && data.nom ? `${data.prenom} ${data.nom}` : (data.nom || 'Sans nom'),
      nombreContacts: data.contacts ? data.contacts.length : 0,
      nombreStructures: data.structureIds ? data.structureIds.length : 0,
      // S'assurer que ces tableaux sont toujours disponibles
      contacts: data.contacts || [],
      structureIds: data.structureIds || [],
      concertsAssocies: data.concertsAssocies || [],
      lieux: data.lieux || []
    };
  }, []);

  // Requête personnalisée pour charger les structures - IDENTIQUE À L'ORIGINALE
  const customQueries = {
    structures: async (programmateurData) => {
      try {
        if (!programmateurData.structureIds || programmateurData.structureIds.length === 0) {
          return [];
        }
        const structuresPromises = programmateurData.structureIds.map(async (structureId) => {
          try {
            const structureDoc = await getDoc(doc(db, 'structures', structureId));
            return structureDoc.exists() ? { id: structureDoc.id, ...structureDoc.data() } : null;
          } catch (err) {
            console.error('Erreur getDoc structure:', err);
            return null;
          }
        });
        const structures = await Promise.all(structuresPromises);
        return structures.filter(s => s !== null);
      } catch (error) {
        console.error('Erreur customQueries.structures:', error);
        return [];
      }
    }
  };

  // Fonction de vérification de la permission de suppression - IDENTIQUE À L'ORIGINALE
  const checkDeletePermission = useCallback(async (programmateurId) => {
    // Vérifier si le programmateur est utilisé dans des lieux
    const lieuxQuery = query(
      collection(db, 'lieux'),
      where('programmateurId', '==', programmateurId)
    );
    
    const lieuxSnapshot = await getDocs(lieuxQuery);
    if (!lieuxSnapshot.empty) {
      return false;
    }
    
    // Vérifier si le programmateur est utilisé dans des concerts
    const concertsQuery = query(
      collection(db, 'concerts'),
      where('programmateurId', '==', programmateurId)
    );
    
    const concertsSnapshot = await getDocs(concertsQuery);
    return concertsSnapshot.empty;
  }, []);

  // Handler avant soumission - IDENTIQUE À L'ORIGINALE
  const onBeforeSubmit = useCallback(async (formData, originalData) => {
    // Vérifier si la structure a changé
    if (formData.structureId !== originalData.structureId) {
      // Supprimer de l'ancienne structure
      if (originalData.structureId) {
        try {
          const oldStructureRef = doc(db, 'structures', originalData.structureId);
          await updateDoc(oldStructureRef, {
            programmateurIds: arrayRemove(id)
          });
        } catch (err) {
          console.error("Erreur lors de la mise à jour de l'ancienne structure:", err);
        }
      }
      
      // Ajouter à la nouvelle structure
      if (formData.structureId) {
        try {
          const newStructureRef = doc(db, 'structures', formData.structureId);
          await updateDoc(newStructureRef, {
            programmateurIds: arrayUnion(id)
          });
        } catch (err) {
          console.error("Erreur lors de la mise à jour de la nouvelle structure:", err);
        }
      }
    }
    
    return formData;
  }, [id]);

  // Callbacks pour les opérations réussies ou en erreur - IDENTIQUE À L'ORIGINALE
  const onSaveSuccess = useCallback((data) => {
    showSuccessToast(`Le programmateur ${data.prenom || ''} ${data.nom || ''} a été mis à jour avec succès`);
  }, []);

  const onSaveError = useCallback((error) => {
    showErrorToast(`Erreur lors de la sauvegarde du programmateur: ${error.message}`);
  }, []);

  const onDeleteSuccess = useCallback(() => {
    showSuccessToast(`Le programmateur a été supprimé avec succès`);
    navigate('/programmateurs');
  }, [navigate]);

  const onDeleteError = useCallback((error) => {
    showErrorToast(`Erreur lors de la suppression du programmateur: ${error.message}`);
  }, []);

  // Configuration du hook générique - IDENTIQUE À L'ORIGINALE
  const genericDetails = useGenericEntityDetails({
    // Configuration de base
    entityType: 'programmateur',
    collectionName: 'programmateurs',
    id,
    
    // Configuration des entités liées
    relatedEntities: [
      { 
        name: 'structure', 
        idField: 'structureId', 
        collection: 'structures'
      },
      {
        name: 'structures',
        idField: 'structureIds',
        collection: 'structures',
        type: 'one-to-many'
      },
      { 
        name: 'lieux', 
        idField: 'programmateurId',
        collection: 'lieux',
        type: 'one-to-many',
        isReference: true 
      },
      {
        name: 'concerts',
        idField: 'programmateurId',
        collection: 'concerts',
        type: 'one-to-many',
        isReference: true
      }
    ],
    customQueries,
    
    // Transformateurs et validations
    transformData,
    validateFormFn: validateProgrammateurForm,
    formatValue: (field, value) => formatFields[field] ? formatFields[field](value) : value,
    checkDeletePermission,
    
    // Callbacks
    onBeforeSubmit,
    onSaveSuccess,
    onSaveError,
    onDeleteSuccess,
    onDeleteError,
    
    // Navigation
    navigate,
    returnPath: '/programmateurs',
    editPath: '/programmateurs/:id/edit',
    
    // Options
    disableCache: false
  });

  console.log('[TRACE-UNIQUE][useProgrammateurDetailsOptimized] genericDetails:', {
    loading: genericDetails.loading,
    entity: genericDetails.entity,
    error: genericDetails.error,
    relatedData: genericDetails.relatedData
  });

  // === Fonctions spécifiques aux programmateurs - IDENTIQUE À L'ORIGINALE ===
  
  // Gérer le changement de structure principale
  const handleStructureChange = useCallback(async (newStructure) => {
    if (!genericDetails.formData) return;
    
    try {
      if (newStructure) {
        genericDetails.updateFormData({
          ...genericDetails.formData,
          structureId: newStructure.id,
          structure: {
            id: newStructure.id,
            nom: newStructure.nom
          }
        });
      } else {
        genericDetails.updateFormData({
          ...genericDetails.formData,
          structureId: null,
          structure: null
        });
      }
    } catch (error) {
      console.error("Erreur lors du changement de structure:", error);
      showErrorToast(`Erreur lors du changement de structure: ${error.message}`);
    }
  }, [genericDetails]);

  // Ajouter une structure secondaire - EXACTEMENT COMME L'ORIGINALE
  const addStructureSecondaire = useCallback(async (structure) => {
    if (!structure || !structure.id) return;
    
    try {
      // Vérifier si la structure est déjà associée
      const currentStructureIds = genericDetails.formData.structureIds || [];
      if (currentStructureIds.includes(structure.id)) {
        showErrorToast("Cette structure est déjà associée au programmateur");
        return;
      }
      
      // Mettre à jour le programmateur
      const newStructureIds = [...currentStructureIds, structure.id];
      
      genericDetails.updateFormData({
        ...genericDetails.formData,
        structureIds: newStructureIds
      });
      
      // Mettre à jour la structure également (relation bidirectionnelle)
      const structureRef = doc(db, 'structures', structure.id);
      await updateDoc(structureRef, {
        programmateurIds: arrayUnion(id)
      });
      
      // Rafraîchir la liste des structures liées
      genericDetails.refresh();
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une structure secondaire:", error);
      showErrorToast(`Erreur lors de l'ajout d'une structure: ${error.message}`);
    }
  }, [genericDetails, id]);

  // Retirer une structure secondaire - EXACTEMENT COMME L'ORIGINALE
  const removeStructureSecondaire = useCallback(async (structureId) => {
    if (!structureId) return;
    
    try {
      // Mettre à jour le programmateur
      const currentStructureIds = genericDetails.formData.structureIds || [];
      const newStructureIds = currentStructureIds.filter(id => id !== structureId);
      
      genericDetails.updateFormData({
        ...genericDetails.formData,
        structureIds: newStructureIds
      });
      
      // Mettre à jour la structure également (relation bidirectionnelle)
      const structureRef = doc(db, 'structures', structureId);
      await updateDoc(structureRef, {
        programmateurIds: arrayRemove(id)
      });
      
      // Rafraîchir la liste des structures liées
      genericDetails.refresh();
    } catch (error) {
      console.error("Erreur lors du retrait d'une structure secondaire:", error);
      showErrorToast(`Erreur lors du retrait d'une structure: ${error.message}`);
    }
  }, [genericDetails, id]);

  // Ajouter un contact - EXACTEMENT COMME L'ORIGINALE
  const addContact = useCallback((contact) => {
    const currentContacts = genericDetails.formData.contacts || [];
    const newContact = { 
      ...contact, 
      id: Date.now().toString() 
    };
    
    genericDetails.updateFormData({
      ...genericDetails.formData,
      contacts: [...currentContacts, newContact]
    });
  }, [genericDetails]);

  // Modifier un contact - EXACTEMENT COMME L'ORIGINALE
  const updateContact = useCallback((contactId, updatedContact) => {
    const currentContacts = genericDetails.formData.contacts || [];
    const updatedContacts = currentContacts.map(contact => 
      contact.id === contactId ? { ...contact, ...updatedContact } : contact
    );
    
    genericDetails.updateFormData({
      ...genericDetails.formData,
      contacts: updatedContacts
    });
  }, [genericDetails]);

  // Supprimer un contact - EXACTEMENT COMME L'ORIGINALE
  const removeContact = useCallback((contactId) => {
    const currentContacts = genericDetails.formData.contacts || [];
    const updatedContacts = currentContacts.filter(contact => contact.id !== contactId);
    
    genericDetails.updateFormData({
      ...genericDetails.formData,
      contacts: updatedContacts
    });
  }, [genericDetails]);

  // Retourner exactement la même structure que l'originale
  return {
    // Toutes les fonctionnalités du hook générique
    ...genericDetails,
    // Alias pour compatibilité avec les vues existantes
    programmateur: genericDetails.entity,
    // Fonctionnalités spécifiques aux programmateurs
    handleStructureChange,
    addStructureSecondaire,
    removeStructureSecondaire,
    addContact,
    updateContact,
    removeContact
  };
};

export default useProgrammateurDetailsOptimized;