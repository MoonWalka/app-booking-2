import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParametres } from '@/context/ParametresContext';
import useGenericEntityForm from '@/hooks/generics/forms/useGenericEntityForm';

console.log('[UEF] Hook useEntrepriseForm importé');

/**
 * Custom hook pour gérer le formulaire d'entreprise
 * Version migrée qui utilise useGenericEntityForm tout en préservant l'utilisation du contexte ParametresContext
 * 
 * @returns {Object} État du formulaire, handlers et fonctions de soumission
 */
export const useEntrepriseForm = () => {
  console.log('[UEF] Appel de useEntrepriseForm');
  const { parametres, sauvegarderParametres, loading: contextLoading } = useParametres();
  const [success, setSuccess] = useState('');
  
  console.log('[UEF] ParametresContext:', { entreprise: parametres.entreprise, loading: contextLoading });

  const initialData = useMemo(() => ({
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
  }), []);
  console.log('[UEF] initialData créé', initialData);

  const validateEntrepriseForm = useCallback((data) => {
    console.log('[UEF] validateEntrepriseForm appelé avec:', data);
    const errors = {};
    if (!data.nom) errors.nom = 'Le nom de l\'entreprise est obligatoire';
    if (!data.adresse) errors.adresse = 'L\'adresse est obligatoire';
    if (!data.codePostal) errors.codePostal = 'Le code postal est obligatoire';
    if (!data.ville) errors.ville = 'La ville est obligatoire';
    if (data.siret && !/^\d{14}$/.test(data.siret.replace(/\s/g, ''))) errors.siret = 'Le numéro SIRET doit contenir 14 chiffres';
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Format d\'email invalide';
    console.log('[UEF] validateEntrepriseForm erreurs:', errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  }, []);

  const transformEntrepriseData = useCallback((data) => {
    console.log('[UEF] transformEntrepriseData appelé avec:', data);
    return data;
  }, []);

  const customSubmitHandler = useCallback(async (formData) => {
    console.log('[UEF] customSubmitHandler appelé avec:', formData);
    try {
      const submitSuccess = await sauvegarderParametres('entreprise', formData);
      if (submitSuccess) {
        setSuccess('Informations de l\'entreprise enregistrées avec succès !');
        setTimeout(() => setSuccess(''), 3000);
        return { success: true, id: 'entreprise' };
      }
      return { success: false, error: 'Erreur lors de la sauvegarde' };
    } catch (error) {
      console.error('[UEF] Erreur customSubmitHandler:', error);
      return { success: false, error: error.message };
    }
  }, [sauvegarderParametres]);

  const genericFormOptions = useMemo(() => ({
    entityType: 'parametresEntreprise',
    entityId: 'entreprise',
    initialData,
    collectionName: 'parametres',
    validateForm: validateEntrepriseForm,
    transformData: transformEntrepriseData,
    customSubmit: customSubmitHandler,
    relatedEntities: [],
    enableValidation: false,
    validateOnChange: false,
    validateOnBlur: false
  }), [initialData, validateEntrepriseForm, transformEntrepriseData, customSubmitHandler]);
  console.log('[UEF] genericFormOptions créées:', genericFormOptions);

  const genericFormHook = useGenericEntityForm(genericFormOptions.entityType, genericFormOptions.entityId, genericFormOptions);
  console.log('[UEF] useGenericEntityForm appelé, retour:', { loading: genericFormHook.loading, formData: genericFormHook.formData });

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    console.log('[UEF] handleSubmit appelé');
    await genericFormHook.handleSubmit(e);
  }, [genericFormHook]);

  // ✅ CORRECTION: Stabiliser la référence pour éviter les boucles infinies
  const setFormDataRef = useRef();
  setFormDataRef.current = genericFormHook.setFormData;

  useEffect(() => {
    console.log('[UEF] useEffect [parametres.entreprise] exécuté. parametres.entreprise existe:', !!parametres.entreprise);
    if (parametres.entreprise && setFormDataRef.current) {
      console.log('[UEF] useEffect - Appel de setFormData avec:', parametres.entreprise);
      setFormDataRef.current(parametres.entreprise);
    }
  }, [parametres.entreprise]); // Dépendances réduites et stables

  const handleSelectCompany = useCallback((company) => {
    console.log('[UEF] handleSelectCompany appelé avec:', company);
    if (setFormDataRef.current) {
      setFormDataRef.current(prev => ({
        ...prev,
        nom: company.nom,
        adresse: company.adresse,
        codePostal: company.codePostal,
        ville: company.ville,
        siret: company.siret,
        codeAPE: company.codeAPE
      }));
    }
  }, []); // Dépendances stables
  
  const returnValues = useMemo(() => ({
    ...genericFormHook,
    formData: genericFormHook.formData,
    loading: contextLoading || genericFormHook.loading,
    success,
    updateFormData: genericFormHook.setFormData,
    handleSubmit,
    handleSelectCompany
  }), [genericFormHook, contextLoading, success, handleSubmit, handleSelectCompany]);

  console.log('[UEF] useEntrepriseForm retourne:', { loading: returnValues.loading, formData: returnValues.formData, success: returnValues.success });

  return returnValues;
};

export default useEntrepriseForm;