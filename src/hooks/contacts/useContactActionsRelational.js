import { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useContactModals } from '@/context/ContactModalsContext';
import { useTabs } from '@/context/TabsContext';
import { useContactsRelational } from './useContactsRelational';
import structuresService from '@/services/contacts/structuresService';
import personnesService from '@/services/contacts/personnesService';

/**
 * Hook pour gérer les actions sur les contacts avec le nouveau modèle relationnel
 * Remplace progressivement useContactActions
 */
export function useContactActionsRelational(contactId, contactType = 'structure') {
  const { currentUser } = useAuth();
  const { openCommentModal } = useContactModals();
  const { openContactTab } = useTabs();
  const { 
    updateStructure,
    updatePersonne,
    associatePersonToStructure,
    dissociatePersonFromStructure,
    updateLiaison,
    setPrioritaire,
    getStructureWithPersonnes,
    getPersonneWithStructures
  } = useContactsRelational();
  
  // État local pour les modifications optimistes
  const [localTags, setLocalTags] = useState([]);
  const [localCommentaires, setLocalCommentaires] = useState([]);
  const [lastLocalUpdate, setLastLocalUpdate] = useState(null);

  // ==================== GESTION DES TAGS ====================

  const handleTagsChange = useCallback(async (newTags) => {
    try {
      if (contactType === 'structure') {
        await updateStructure(contactId, { tags: newTags });
      } else {
        await updatePersonne(contactId, { tags: newTags });
      }
      
      setLocalTags(newTags);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des tags:', error);
      throw error;
    }
  }, [contactId, contactType, updateStructure, updatePersonne]);

  const handleRemoveTag = useCallback(async (tagToRemove) => {
    try {
      const currentTags = localTags || [];
      const newTags = currentTags.filter(tag => tag !== tagToRemove);
      
      return handleTagsChange(newTags);
    } catch (error) {
      console.error('Erreur lors de la suppression du tag:', error);
      throw error;
    }
  }, [localTags, handleTagsChange]);

  // ==================== GESTION DES PERSONNES ASSOCIÉES ====================

  const handleAssociatePersons = useCallback(async (selectedPersons) => {
    try {
      if (!selectedPersons || selectedPersons.length === 0) {
        return false;
      }
      
      if (contactType !== 'structure') {
        throw new Error('Association uniquement possible pour les structures');
      }

      // Récupérer les liaisons existantes
      const structure = getStructureWithPersonnes(contactId);
      const existingPersonIds = structure?.personnes?.map(p => p.id) || [];

      // Filtrer les nouvelles personnes
      const newPersons = selectedPersons.filter(p => !existingPersonIds.includes(p.id));
      
      if (newPersons.length === 0) {
        console.log('Toutes les personnes sont déjà associées');
        return false;
      }

      // Créer les liaisons pour chaque nouvelle personne
      const results = await Promise.all(
        newPersons.map(person => 
          associatePersonToStructure(contactId, person.id, {
            fonction: person.fonction || '',
            prioritaire: existingPersonIds.length === 0 && newPersons[0].id === person.id
          })
        )
      );

      const success = results.every(r => r.success);
      return success;
    } catch (error) {
      console.error('Erreur lors de l\'association des personnes:', error);
      throw error;
    }
  }, [contactId, contactType, associatePersonToStructure, getStructureWithPersonnes]);

  const handleUpdatePerson = useCallback(async (updatedPersonData) => {
    try {
      // Mise à jour de la personne elle-même
      const updates = {
        prenom: updatedPersonData.prenom,
        nom: updatedPersonData.nom,
        email: updatedPersonData.mailDirect || updatedPersonData.email,
        telephone: updatedPersonData.telDirect || updatedPersonData.telephone,
        mobile: updatedPersonData.mobile,
        mailPerso: updatedPersonData.mailPerso,
        telPerso: updatedPersonData.telPerso,
        adresse: updatedPersonData.adresse,
        codePostal: updatedPersonData.codePostal,
        ville: updatedPersonData.ville,
        departement: updatedPersonData.departement,
        region: updatedPersonData.region,
        pays: updatedPersonData.pays
      };

      await updatePersonne(updatedPersonData.id, updates);

      // Si une fonction est fournie et qu'on est dans une structure, mettre à jour la liaison
      if (contactType === 'structure' && updatedPersonData.fonction !== undefined) {
        const structure = getStructureWithPersonnes(contactId);
        const personne = structure?.personnes?.find(p => p.id === updatedPersonData.id);
        
        if (personne?.liaison?.id) {
          await updateLiaison(personne.liaison.id, {
            fonction: updatedPersonData.fonction
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la personne:', error);
      throw error;
    }
  }, [contactId, contactType, updatePersonne, updateLiaison, getStructureWithPersonnes]);

  const handleDissociatePerson = useCallback(async (personne) => {
    try {
      if (contactType !== 'structure') {
        throw new Error('Dissociation uniquement possible depuis une structure');
      }

      const personDisplayName = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'cette personne';
      const confirmation = window.confirm(
        `Êtes-vous sûr de vouloir dissocier "${personDisplayName}" de cette structure ?\n\n` +
        `Cette action retirera la personne de la structure mais conservera sa fiche.`
      );
      
      if (!confirmation) {
        return false;
      }

      // Trouver la liaison correspondante
      const structure = getStructureWithPersonnes(contactId);
      const personneWithLiaison = structure?.personnes?.find(p => p.id === personne.id);
      
      if (!personneWithLiaison?.liaison?.id) {
        throw new Error('Liaison non trouvée');
      }

      // Dissocier (soft delete)
      await dissociatePersonFromStructure(personneWithLiaison.liaison.id);

      // Marquer la personne comme personne libre si elle n'a plus de structure
      const personneStructures = getPersonneWithStructures(personne.id);
      const activeLiaisons = personneStructures?.structures?.filter(s => s.liaison.actif) || [];
      
      if (activeLiaisons.length === 0) {
        await personnesService.setPersonneLibreStatus(personne.id, true, currentUser.uid);
      }

      alert(`"${personDisplayName}" a été dissocié(e) de la structure avec succès.`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la dissociation de la personne:', error);
      throw error;
    }
  }, [contactId, contactType, dissociatePersonFromStructure, getStructureWithPersonnes, getPersonneWithStructures, currentUser]);

  const handleOpenPersonFiche = useCallback(async (personne) => {
    try {
      const personneNom = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne';
      openContactTab(personne.id, personneNom, 'personne');
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la fiche personne:', error);
      throw error;
    }
  }, [openContactTab]);

  // ==================== GESTION DES STATUTS RELATIONNELS ====================

  const handleSetPrioritaire = useCallback(async (personne) => {
    try {
      if (contactType !== 'structure') {
        throw new Error('Contact prioritaire uniquement pour les structures');
      }

      await setPrioritaire(contactId, personne.id);
      return true;
    } catch (error) {
      console.error('Erreur lors de la définition du contact prioritaire:', error);
      throw error;
    }
  }, [contactId, contactType, setPrioritaire]);

  const handleToggleActif = useCallback(async (personne) => {
    try {
      const structure = getStructureWithPersonnes(contactId);
      const personneWithLiaison = structure?.personnes?.find(p => p.id === personne.id);
      
      if (!personneWithLiaison?.liaison?.id) {
        throw new Error('Liaison non trouvée');
      }

      await updateLiaison(personneWithLiaison.liaison.id, {
        actif: !personneWithLiaison.liaison.actif
      });

      return true;
    } catch (error) {
      console.error('Erreur lors du changement de statut actif:', error);
      throw error;
    }
  }, [contactId, updateLiaison, getStructureWithPersonnes]);

  const handleToggleInteresse = useCallback(async (personne) => {
    try {
      const structure = getStructureWithPersonnes(contactId);
      const personneWithLiaison = structure?.personnes?.find(p => p.id === personne.id);
      
      if (!personneWithLiaison?.liaison?.id) {
        throw new Error('Liaison non trouvée');
      }

      await updateLiaison(personneWithLiaison.liaison.id, {
        interesse: !personneWithLiaison.liaison.interesse
      });

      return true;
    } catch (error) {
      console.error('Erreur lors du changement de statut intéressé:', error);
      throw error;
    }
  }, [contactId, updateLiaison, getStructureWithPersonnes]);

  const handleSetClientStatus = useCallback(async (isClient) => {
    try {
      if (contactType !== 'structure') {
        throw new Error('Statut client uniquement pour les structures');
      }

      await structuresService.setClientStatus(contactId, isClient, currentUser.uid);
      return true;
    } catch (error) {
      console.error('Erreur lors du changement de statut client:', error);
      throw error;
    }
  }, [contactId, contactType, currentUser]);

  // ==================== GESTION DES COMMENTAIRES ====================

  const handleAddComment = useCallback(async (content) => {
    try {
      // TODO: Implémenter la gestion des commentaires dans le nouveau modèle
      // Pour l'instant, on garde la logique locale
      const newComment = {
        id: Date.now().toString(),
        contenu: content || '',
        auteur: currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu',
        date: new Date(),
        modifie: false
      };
      
      setLocalCommentaires([...localCommentaires, newComment]);
      setLastLocalUpdate(Date.now());
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  }, [currentUser, localCommentaires]);

  const handleDeleteComment = useCallback(async (commentaire) => {
    try {
      const confirmation = window.confirm(
        `Êtes-vous sûr de vouloir supprimer ce commentaire ?\n\n` +
        `« ${commentaire.contenu.substring(0, 100)}${commentaire.contenu.length > 100 ? '...' : ''} »`
      );
      
      if (!confirmation) {
        return false;
      }

      const updatedComments = localCommentaires.filter(c => c.id !== commentaire.id);
      setLocalCommentaires(updatedComments);
      setLastLocalUpdate(Date.now());
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      throw error;
    }
  }, [localCommentaires]);

  const handleAddCommentToPerson = useCallback(async (personne) => {
    const personneNom = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne';
    
    openCommentModal({
      title: `Nouveau commentaire - ${personneNom}`,
      onSave: async (content) => {
        // TODO: Implémenter les commentaires sur les personnes
        console.log('Commentaire sur personne:', personne.id, content);
      }
    });
  }, [openCommentModal]);

  return {
    // État local
    localTags,
    setLocalTags,
    localCommentaires,
    setLocalCommentaires,
    lastLocalUpdate,
    
    // Actions sur les tags
    handleTagsChange,
    handleRemoveTag,
    
    // Actions sur les personnes
    handleAssociatePersons,
    handleUpdatePerson,
    handleDissociatePerson,
    handleOpenPersonFiche,
    handleAddCommentToPerson,
    
    // Actions sur les statuts relationnels
    handleSetPrioritaire,
    handleToggleActif,
    handleToggleInteresse,
    handleSetClientStatus,
    
    // Actions sur les commentaires
    handleAddComment,
    handleDeleteComment
  };
}