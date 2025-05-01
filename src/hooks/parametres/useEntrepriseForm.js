import { useState, useEffect } from 'react';
import { useParametres } from '@/context/ParametresContext';

/**
 * Custom hook to manage enterprise form state and submission
 * @returns {Object} Form state, handlers, and submission functions
 */
export const useEntrepriseForm = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState({
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
  
  const [success, setSuccess] = useState('');

  // Initialize form data from context
  useEffect(() => {
    if (parametres.entreprise) {
      setLocalState(parametres.entreprise);
    }
  }, [parametres.entreprise]);

  /**
   * Update form data with a partial update
   * @param {Object} partialUpdate - The partial update to apply to the form data
   */
  const updateFormData = (partialUpdate) => {
    setLocalState(prev => ({
      ...prev,
      ...partialUpdate
    }));
  };

  /**
   * Handle input field change
   * @param {Object} e - The DOM event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  /**
   * Handle selection of a company from search results
   * @param {Object} company - The selected company
   */
  const handleSelectCompany = (company) => {
    updateFormData({
      nom: company.nom,
      adresse: company.adresse,
      codePostal: company.codePostal,
      ville: company.ville,
      siret: company.siret,
      codeAPE: company.codeAPE
    });
  };

  /**
   * Handle form submission
   * @param {Object} e - The DOM event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await sauvegarderParametres('entreprise', localState);
    if (success) {
      setSuccess('Company information saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return {
    formData: localState,
    loading,
    success,
    updateFormData,
    handleChange,
    handleSelectCompany,
    handleSubmit
  };
};

export default useEntrepriseForm;