/**
 * Hook optimisé pour le formulaire de contact basé sur useGenericEntityForm
 * 
 * ⚠️ NOTE IMPORTANTE - APPROCHE RECOMMANDÉE ⚠️
 * Ce hook représente l'approche RECOMMANDÉE pour les nouveaux développements.
 * Il utilise DIRECTEMENT les hooks génériques plutôt que de passer par des wrappers
 * ou des hooks "Migrated/V2", conformément au plan de dépréciation officiel
 * (PLAN_DEPRECIATION_HOOKS.md) qui prévoit la suppression de tous les hooks 
 * spécifiques d'ici novembre 2025.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useGenericEntityForm from '@/hooks/generics/forms/useGenericEntityForm';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';
import { debugLog } from '@/utils/logUtils';
import { useDataValidation } from '@/services/dataValidationService';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Hook optimisé pour gérer les formulaires de contacts
 * Utilise directement useGenericEntityForm comme recommandé
 * 
 * @param {string} contactId - ID du contact ou 'nouveau' pour un nouveau contact
 * @returns {Object} - États et fonctions pour gérer le formulaire
 */
export const useContactForm = (contactId) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { currentOrganization } = useOrganization();
  const { validateAndPrepare } = useDataValidation();
  
  // Détecter le mode "nouveau" via l'URL plutôt que via les paramètres
  const isNewFromUrl = location.pathname.endsWith('/nouveau');
  const actualContactId = contactId || id;
  const isNewContact = isNewFromUrl || !actualContactId || actualContactId === 'nouveau';
  
  // LOGS TEMPORAIREMENT DÉSACTIVÉS POUR ÉVITER LA BOUCLE
  // console.log('[DEBUG][useContactForm] actualContactId:', actualContactId);
  
  // debugLog(`Initialisation du formulaire de contact optimisé: ${isNewContact ? 'nouveau contact' : `contact ${actualContactId}`}`, 'info', 'useContactForm');
  
  // Fonction de validation spécifique aux contacts
  const validateContactForm = useCallback((data) => {
    const errors = {};
    
    // Validation sur les champs PLATS (pas imbriqués)
    if (!data.nom) {
      errors['nom'] = 'Le nom du contact est obligatoire';
    }
    
    // Email facultatif, mais si fourni, doit être valide
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      errors['email'] = 'Format d\'email invalide';
    }
    
    // Validation de la structure si nécessaire
    if (!data.structureId && !data.structureRaisonSociale) {
      errors['structureRaisonSociale'] = 'La raison sociale est requise si aucune structure n\'est sélectionnée';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      message: Object.keys(errors).length > 0 ? 'Veuillez corriger les erreurs du formulaire.' : null
    };
  }, []);

  // Fonction de transformation des données avant sauvegarde
  const transformContactData = useCallback((data) => {
    console.log('💾 PRÉPARATION SAUVEGARDE CONTACT - INPUT:', JSON.stringify(data, null, 2));
    
    // STRUCTURE DÉFINITIVE - AUCUN OBJET IMBRIQUÉ
    const contactData = {
      // Identité (TOUT au niveau racine)
      nom: data.nom || data.contact?.nom || '',
      prenom: data.prenom || data.contact?.prenom || '',
      email: data.email || data.contact?.email || '',
      telephone: data.telephone || data.contact?.telephone || '',
      fonction: data.fonction || data.contact?.fonction || '',
      
      // Structure (avec préfixe, PAS dans un objet)
      structureId: data.structureId || '',
      structureNom: data.structureNom || data.structure?.nom || data.structureRaisonSociale || '',
      structureRaisonSociale: data.structureRaisonSociale || data.structure?.raisonSociale || '',
      structureSiret: data.structureSiret || data.structure?.siret || '',
      structureAdresse: data.structureAdresse || data.structure?.adresse || '',
      structureCodePostal: data.structureCodePostal || data.structure?.codePostal || '',
      structureVille: data.structureVille || data.structure?.ville || '',
      structurePays: data.structurePays || data.structure?.pays || 'France',
      structureTva: data.structureTva || data.structure?.tva || '',
      structureType: data.structureType || data.structure?.type || '',
      structureNumeroIntracommunautaire: data.structureNumeroIntracommunautaire || data.structure?.numeroIntracommunautaire || '',
      
      // Bidirectionnalité
      concertsIds: data.concertsIds || [],
      lieuxIds: data.lieuxIds || [],
      artistesIds: data.artistesIds || [],
      concertsAssocies: data.concertsAssocies || [], // Pour compatibilité
      
      // Autres champs
      notes: data.notes || '',
      tags: data.tags || [],
      statut: data.statut || 'actif',
      
      // Métadonnées
      updatedAt: new Date()
    };
    
    // VÉRIFICATION CRITIQUE - organizationId OBLIGATOIRE
    if (!currentOrganization?.id) {
      throw new Error('organizationId OBLIGATOIRE - Aucune organisation sélectionnée');
    }
    
    // Multi-org (CRITIQUE)
    contactData.organizationId = currentOrganization.id;
    
    // LOG POUR VÉRIFIER
    console.log('💾 SAUVEGARDE CONTACT - STRUCTURE FINALE:', contactData);
    console.log('✅ PAS de contact: {} ou structure: {} !');
    
    // Validation finale via le service
    try {
      const validatedData = validateAndPrepare(contactData, 'contacts');
      console.log('✅ Contact validé et prêt:', validatedData);
      return validatedData;
    } catch (error) {
      console.error('❌ Erreur de validation:', error);
      // En cas d'erreur, on retourne quand même les données avec organizationId
      return contactData;
    }
  }, [validateAndPrepare, currentOrganization]);
  
  // Callbacks pour les opérations réussies ou en erreur
  const onSuccessCallback = useCallback((savedData) => {
    // savedData contient maintenant les champs aplatis
    const contactName = savedData.nom || '';
    const message = isNewContact
      ? `Le contact ${contactName} a été créé avec succès`
      : `Le contact ${contactName} a été mis à jour avec succès`;
    
    showSuccessToast(message);
    
    // Récupérer l'ID depuis savedData
    const savedId = savedData.id;
    
    // Éviter la boucle infinie : ne pas naviguer si savedId est "nouveau"
    if (savedId && savedId !== 'nouveau') {
      navigate(`/contacts/${savedId}`);
    } else if (isNewContact) {
      // Pour un nouveau contact, rediriger vers la liste
      navigate('/contacts');
    }
    
    // Si une structure a été créée en même temps, on pourrait gérer ici la sauvegarde de la structure
    // et la mise à jour de la relation entre la structure et le contact
  }, [isNewContact, navigate]);

  const onErrorCallback = useCallback((error) => {
    const message = isNewContact
      ? `Erreur lors de la création du contact: ${error.message}`
      : `Erreur lors de la sauvegarde du contact: ${error.message}`;
    
    showErrorToast(message);
  }, [isNewContact]);
  
  // Fonction pour transformer les données aplaties en structure imbriquée pour le formulaire
  // NOTE: Cette fonction n'est plus utilisée mais conservée pour la compatibilité
  // eslint-disable-next-line no-unused-vars
  const transformLoadedData = useCallback((data) => {
    if (!data) return null;
    
    // IMPORTANT: Ne plus créer de structures imbriquées
    // Retourner les données plates directement
    return {
      // Données du contact à la racine
      nom: data.nom || '',
      prenom: data.prenom || '',
      fonction: data.fonction || '',
      email: data.email || '',
      telephone: data.telephone || '',
      
      // Données de la structure avec préfixe
      structureRaisonSociale: data.structureRaisonSociale || data.structureInfo?.raisonSociale || '',
      structureType: data.structureType || data.structureInfo?.type || '',
      structureAdresse: data.structureAdresse || data.structureInfo?.adresse || '',
      structureCodePostal: data.structureCodePostal || data.structureInfo?.codePostal || '',
      structureVille: data.structureVille || data.structureInfo?.ville || '',
      structurePays: data.structurePays || data.structureInfo?.pays || 'France',
      structureSiret: data.structureSiret || data.structureInfo?.siret || '',
      structureTva: data.structureTva || data.structureInfo?.tva || '',
      
      // Autres données
      structureId: data.structureId || '',
      structureNom: data.structureNom || '',
      concertsAssocies: data.concertsAssocies || [],
      
      // Conserver l'ID et l'organizationId
      id: data.id,
      organizationId: data.organizationId
    };
  }, []);
  
  // DEBUG: Log pour voir ce qui se passe
  console.log('🔵 [useContactForm] Initialisation:', {
    isNewContact,
    actualContactId,
    currentOrganization: currentOrganization?.id
  });
  
  // Utilisation directe du hook générique avec configuration spécifique aux contacts
  const formHook = useGenericEntityForm({
    entityType: 'contacts',
    entityId: isNewContact ? null : actualContactId,
    collectionName: 'contacts',
    initialData: useMemo(() => ({
      // Valeurs par défaut pour un nouveau contact - structure plate
      nom: '',
      prenom: '',
      fonction: '',
      email: '',
      telephone: '',
      structureId: '',
      structureNom: '',
      structureRaisonSociale: '',
      structureType: '',
      structureAdresse: '',
      structureCodePostal: '',
      structureVille: '',
      structurePays: 'France',
      structureSiret: '',
      structureTva: '',
      structureNumeroIntracommunautaire: '',
      // BIDIRECTIONNALITÉ - Initialisation correcte
      lieuxIds: [],
      concertsIds: [],
      artistesIds: [],
      concertsAssocies: [], // Pour compatibilité
      notes: '',
      tags: [],
      statut: 'actif'
    }), []),
    validateForm: validateContactForm,
    transformData: transformContactData,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    relatedEntities: useMemo(() => [
      { 
        name: 'structure',
        collection: 'structures',
        idField: 'structureId',
        nameField: 'structureNom'
      }
    ], [])
  });
  
  // Extension du hook avec des fonctionnalités spécifiques aux contacts
  
  // Effet pour vérifier et CORRIGER les données chargées
  useEffect(() => {
    console.log('🔵 formData actuel:', formHook.formData);
    if (formHook.formData && (formHook.formData.contact || formHook.formData.structure)) {
      console.error('⚠️ STRUCTURE IMBRIQUÉE DÉTECTÉE - CORRECTION AUTOMATIQUE !');
      
      // Aplatir automatiquement les données imbriquées
      const flatData = transformContactData(formHook.formData);
      
      // Mettre à jour formData avec la structure plate
      formHook.setFormData(flatData);
      
      console.log('✅ Données corrigées (plates):', flatData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formHook.formData.id]); // Surveiller uniquement l'ID pour éviter les boucles
  
  // Fonction pour sélectionner/désélectionner la structure
  const handleSelectStructure = useCallback((structure) => {
    if (structure) {
      formHook.setFormData(prev => ({
        ...prev,
        structureId: structure.id,
        structureNom: structure.nom || structure.raisonSociale
      }));
      
      // TODO: Charger les détails de la structure dans les données liées
      // Note: loadRelatedEntity n'existe pas dans useGenericEntityForm
      // formHook.loadRelatedEntity('structure', structure.id);
    } else {
      formHook.setFormData(prev => ({
        ...prev,
        structureId: '',
        structureNom: ''
      }));
    }
  }, [formHook]);
  
  // Fonction pour gérer le toggle des sections (interface utilisateur)
  const [sectionsVisibility, setSectionsVisibility] = useState({
    contactVisible: true,
    legalVisible: true,
    structureVisible: true,
    lieuxVisible: true,
    concertsVisible: true
  });

  const toggleSection = useCallback((sectionName) => {
    setSectionsVisibility(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  }, []);
  
  // Fonction pour gérer l'annulation du formulaire
  const handleCancel = useCallback(() => {
    debugLog('Annulation du formulaire contact', 'info', 'useContactForm');
    
    // Si c'est un nouveau contact, rediriger vers la liste
    if (isNewContact) {
      navigate('/contacts');
    } else {
      // Si c'est un contact existant, rediriger vers sa vue détails
      navigate(`/contacts/${actualContactId}`);
    }
  }, [navigate, isNewContact, actualContactId]);
  
  // Plus besoin de méthodes pour mettre à jour les champs imbriqués
  // Les champs sont maintenant plats et gérés directement par handleChange
  
  // Fonction pour gérer les changements de structure principale (utilisée par useCompanySearch)
  const handleStructureChange = useCallback((company) => {
    if (company) {
      // Utiliser des champs PLATS avec le préfixe "structure"
      formHook.setFormData(prev => ({
        ...prev,
        structureId: company.id || '',
        structureNom: company.nom || company.raisonSociale || '',
        structureRaisonSociale: company.nom || company.raisonSociale || '',
        structureSiret: company.siret || '',
        structureAdresse: company.adresse || '',
        structureCodePostal: company.codePostal || '',
        structureVille: company.ville || '',
        structureType: company.statutJuridique || '',
        structurePays: company.pays || 'France'
      }));
    } else {
      // Réinitialiser les champs structure
      formHook.setFormData(prev => ({
        ...prev,
        structureId: '',
        structureNom: '',
        structureRaisonSociale: '',
        structureSiret: '',
        structureAdresse: '',
        structureCodePostal: '',
        structureVille: '',
        structureType: '',
        structurePays: 'France'
      }));
    }
  }, [formHook]);
  
  // Enrichir formData avec l'id de l'entité pour exposer contact.id
  const contactDataWithId = { ...formHook.formData, id: formHook.entityId };
  
  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques aux contacts
    isNewContact,
    handleSelectStructure,
    sectionsVisibility,
    toggleSection,
    handleCancel, // Ajout de la fonction handleCancel
    // Raccourcis pour une meilleure DX
    contact: contactDataWithId,
    // TODO: Gérer les entités liées différemment car relatedData n'existe pas dans useGenericEntityForm
    structure: null,
    selectedStructure: null,
    handleStructureChange
  };
};

export default useContactForm;