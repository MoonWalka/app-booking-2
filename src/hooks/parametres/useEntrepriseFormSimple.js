import { useState, useCallback, useEffect } from 'react';
import { useParametres } from '@/context/ParametresContext';

/**
 * Version simplifiée du hook useEntrepriseForm
 * Sans les hooks génériques complexes pour éviter les boucles infinies
 */
export const useEntrepriseFormSimple = () => {
  const { parametres, sauvegarderParametres, loading: contextLoading } = useParametres();
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Données du formulaire - Initialisation vide puis mise à jour via useEffect
  const [formData, setFormData] = useState({
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
  });

  // Synchroniser avec les données du contexte quand elles sont disponibles
  useEffect(() => {
    if (parametres.entreprise) {
      setFormData({
        nom: parametres.entreprise.nom || '',
        adresse: parametres.entreprise.adresse || '',
        codePostal: parametres.entreprise.codePostal || '',
        ville: parametres.entreprise.ville || '',
        telephone: parametres.entreprise.telephone || '',
        email: parametres.entreprise.email || '',
        siteWeb: parametres.entreprise.siteWeb || '',
        siret: parametres.entreprise.siret || '',
        codeAPE: parametres.entreprise.codeAPE || '',
        logo: parametres.entreprise.logo || '',
        mentionsLegales: parametres.entreprise.mentionsLegales || '',
        latitude: parametres.entreprise.latitude || null,
        longitude: parametres.entreprise.longitude || null
      });
    }
  }, [parametres.entreprise]);

  // Validation simple
  const validateForm = useCallback((data) => {
    const newErrors = {};
    
    if (!data.nom) {
      newErrors.nom = 'Le nom de l\'entreprise est obligatoire';
    }
    
    if (!data.adresse) {
      newErrors.adresse = 'L\'adresse est obligatoire';
    }
    
    if (!data.codePostal) {
      newErrors.codePostal = 'Le code postal est obligatoire';
    }
    
    if (!data.ville) {
      newErrors.ville = 'La ville est obligatoire';
    }
    
    if (data.siret && !/^\d{14}$/.test(data.siret.replace(/\s/g, ''))) {
      newErrors.siret = 'Le numéro SIRET doit contenir 14 chiffres';
    }
    
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    return newErrors;
  }, []);

  // Gestionnaire de changement de champ
  const handleFieldChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Soumission du formulaire
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    setLoading(true);
    setErrors({});
    setSuccess('');
    
    try {
      // Validation
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return { success: false, errors: validationErrors };
      }
      
      // Sauvegarde
      const success = await sauvegarderParametres('entreprise', formData);
      if (success) {
        setSuccess('Informations de l\'entreprise enregistrées avec succès !');
        setTimeout(() => setSuccess(''), 3000);
        return { success: true, id: 'entreprise' };
      }
      
      return { success: false, error: 'Erreur lors de la sauvegarde' };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      setErrors({ general: error.message });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, sauvegarderParametres]);

  // Sélection d'une entreprise depuis les résultats de recherche
  const handleSelectCompany = useCallback((company) => {
    setFormData(prev => ({
      ...prev,
      nom: company.nom || prev.nom,
      adresse: company.adresse || prev.adresse,
      codePostal: company.codePostal || prev.codePostal,
      ville: company.ville || prev.ville,
      siret: company.siret || prev.siret,
      codeAPE: company.codeAPE || prev.codeAPE
    }));
  }, []);

  return {
    // Données du formulaire
    formData,
    setFormData,
    
    // États
    loading: contextLoading || loading,
    errors,
    success,
    
    // Actions
    handleFieldChange,
    handleSubmit,
    handleSelectCompany,
    
    // Validation
    validateForm,
    
    // Compatibilité avec l'ancienne interface
    updateFormData: setFormData,
    validationErrors: errors,
    isValid: Object.keys(errors).length === 0
  };
};

export default useEntrepriseFormSimple; 