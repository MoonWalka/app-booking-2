import { useCallback, useState } from 'react';
import { useContactActionsRelational } from './useContactActionsRelational';

/**
 * Hook personnalisé pour gérer toutes les actions liées aux contacts
 * MIGRATION: Maintenant utilise le modèle relationnel via useContactActionsRelational
 * Garde la même interface pour la compatibilité avec les composants existants
 */
export function useContactActions(contactId, contactType = 'structure') {
  
  // Utiliser le nouveau hook relationnel
  const relationalActions = useContactActionsRelational(contactId, contactType);
  
  // État local pour la compatibilité (certains composants peuvent encore les utiliser)
  const [localTags, setLocalTags] = useState([]);
  const [localPersonnes, setLocalPersonnes] = useState([]);
  const [localCommentaires, setLocalCommentaires] = useState([]);
  const [lastLocalUpdate, setLastLocalUpdate] = useState(null);

  // Déléguer toutes les actions au hook relationnel tout en gardant l'interface compatible
  const handleTagsChange = useCallback(async (newTags) => {
    const result = await relationalActions.handleTagsChange(newTags);
    setLocalTags(newTags); // Sync local state for compatibility
    return result;
  }, [relationalActions]);

  const handleRemoveTag = useCallback(async (tagToRemove) => {
    const result = await relationalActions.handleRemoveTag(tagToRemove);
    const newTags = localTags.filter(tag => tag !== tagToRemove);
    setLocalTags(newTags); // Sync local state for compatibility
    return result;
  }, [relationalActions, localTags]);

  // Gestion des personnes associées - délégué au hook relationnel
  const handleAssociatePersons = useCallback(async (selectedPersons) => {
    const result = await relationalActions.handleAssociatePersons(selectedPersons);
    setLastLocalUpdate(Date.now()); // Sync for compatibility
    return result;
  }, [relationalActions]);

  const handleUpdatePerson = useCallback(async (updatedPersonData) => {
    const result = await relationalActions.handleUpdatePerson(updatedPersonData);
    setLastLocalUpdate(Date.now()); // Sync for compatibility
    return result;
  }, [relationalActions]);

  const handleDissociatePerson = useCallback(async (personne) => {
    const result = await relationalActions.handleDissociatePerson(personne);
    setLastLocalUpdate(Date.now()); // Sync for compatibility
    return result;
  }, [relationalActions]);

  const handleOpenPersonFiche = useCallback(async (personne) => {
    return relationalActions.handleOpenPersonFiche(personne);
  }, [relationalActions]);

  // Gestion des commentaires - délégué au hook relationnel
  const handleAddComment = useCallback(async (content) => {
    const result = await relationalActions.handleAddComment(content);
    setLastLocalUpdate(Date.now()); // Sync for compatibility
    return result;
  }, [relationalActions]);

  const handleDeleteComment = useCallback(async (commentaire) => {
    const result = await relationalActions.handleDeleteComment(commentaire);
    setLastLocalUpdate(Date.now()); // Sync for compatibility
    return result;
  }, [relationalActions]);

  const handleAddCommentToPerson = useCallback(async (personne) => {
    return relationalActions.handleAddCommentToPerson(personne);
  }, [relationalActions]);

  return {
    // État local (maintenu pour compatibilité)
    localTags: relationalActions.localTags || localTags,
    setLocalTags: relationalActions.setLocalTags || setLocalTags,
    localPersonnes,
    setLocalPersonnes,
    localCommentaires: relationalActions.localCommentaires || localCommentaires,
    setLocalCommentaires: relationalActions.setLocalCommentaires || setLocalCommentaires,
    lastLocalUpdate: relationalActions.lastLocalUpdate || lastLocalUpdate,
    
    // Actions sur les tags
    handleTagsChange,
    handleRemoveTag,
    
    // Actions sur les personnes
    handleAssociatePersons,
    handleUpdatePerson,
    handleDissociatePerson,
    handleOpenPersonFiche,
    handleAddCommentToPerson,
    
    // Actions sur les commentaires
    handleAddComment,
    handleDeleteComment,
    
    // Nouvelles actions du modèle relationnel (bonus de compatibilité)
    handleSetPrioritaire: relationalActions.handleSetPrioritaire,
    handleToggleActif: relationalActions.handleToggleActif,
    handleToggleInteresse: relationalActions.handleToggleInteresse,
    handleSetClientStatus: relationalActions.handleSetClientStatus
  };
}