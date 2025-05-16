import { useState, useEffect, useCallback } from 'react';
import { useParametres } from '@/context/ParametresContext';
import { useGenericEntityForm } from '@/hooks/common/useGenericEntityForm';

/**
 * Custom hook pour gérer le formulaire d'entreprise
 * Version migrée qui utilise useGenericEntityForm tout en préservant l'utilisation du contexte ParametresContext
 * 
 * @returns {Object} État du formulaire, handlers et fonctions de soumission
 */
export const useEntrepriseForm = () => {
  const { parametres, sauvegarderParametres, loading: contextLoading } = useParametres();
  const [success, setSuccess] = useState('');
  
  // Données initiales du formulaire
  const initialData = {
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    telephone: '',
    email: '',
    siteWeb: '',
    siret: '',
    codeAPE: '',
    logo: '',
    mentionsLegales: '',
    latitude: null,
    longitude: null
  };

  // Fonction de validation spécifique aux données d'entreprise
  const validateEntrepriseForm = (data) => {
    const errors = {};
    
    if (!data.nom) {
      errors.nom = 'Le nom de l\'entreprise est obligatoire';
    }
    
    if (!data.adresse) {
      errors.adresse = 'L\'adresse est obligatoire';
    }
    
    if (!data.codePostal) {
      errors.codePostal = 'Le code postal est obligatoire';
    }
    
    if (!data.ville) {
      errors.ville = 'La ville est obligatoire';
    }
    
    // Validation conditionnelle du SIRET (si présent, doit avoir le bon format)
    if (data.siret && !/^\d{14}$/.test(data.siret.replace(/\s/g, ''))) {
      errors.siret = 'Le numéro SIRET doit contenir 14 chiffres';
    }
    
    // Validation conditionnelle de l'email (si présent, doit avoir le bon format)
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Transformation des données avant sauvegarde
  const transformEntrepriseData = (data) => {
    // Pour ce cas spécifique, pas besoin de transformation particulière
    return data;
  };

  // Adaptation de la soumission pour utiliser le contexte au lieu de Firebase directement
  const customSubmitHandler = useCallback(async (formData) => {
    try {
      const success = await sauvegarderParametres('entreprise', formData);
      if (success) {
        setSuccess('Informations de l\'entreprise enregistrées avec succès !');
        setTimeout(() => setSuccess(''), 3000);
        return { success: true, id: 'entreprise' }; // Simuler un ID pour compatibilité
      }
      return { success: false, error: 'Erreur lors de la sauvegarde' };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      return { success: false, error: error.message };
    }
  }, [sauvegarderParametres]);

  // Utiliser le hook générique avec une configuration spécifique pour les paramètres d'entreprise
  const genericFormHook = useGenericEntityForm({
    entityType: 'parametresEntreprise',
    entityId: 'entreprise', // ID fixe pour ce cas particulier
    initialData,
    collectionName: 'parametres', // Pas réellement utilisé dans ce cas
    validateForm: validateEntrepriseForm,
    transformData: transformEntrepriseData,
    customSubmit: customSubmitHandler, // Remplace l'accès Firebase standard par notre fonction personnalisée
    relatedEntities: [] // Pas d'entités liées pour les paramètres d'entreprise
  });

  // Surcharger handleSubmit pour éviter la navigation automatique
  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    await genericFormHook.handleSubmit(e);
  };

  // Synchroniser les données du formulaire avec le contexte
  useEffect(() => {
    if (parametres.entreprise) {
      genericFormHook.setFormData(parametres.entreprise);
    }
  }, [parametres.entreprise]);

  /**
   * Handle selection of a company from search results
   * @param {Object} company - The selected company
   */
  const handleSelectCompany = (company) => {
    genericFormHook.setFormData(prev => ({
      ...prev,
      nom: company.nom,
      adresse: company.adresse,
      codePostal: company.codePostal,
      ville: company.ville,
      siret: company.siret,
      codeAPE: company.codeAPE
    }));
  };

  return {
    ...genericFormHook,
    // Propriétés spécifiques à ce hook pour maintenir la compatibilité
    formData: genericFormHook.formData, // Alias pour la clarté
    loading: contextLoading || genericFormHook.loading,
    success,
    updateFormData: genericFormHook.setFormData,
    handleSubmit,
    handleSelectCompany
  };
};

export default useEntrepriseForm;