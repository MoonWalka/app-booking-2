import { useState } from 'react';

/**
 * Hook for validating structure form data
 * 
 * @param {Object} formData - The structure form data to validate
 * @returns {Object} - Validation state and functions
 */
export const useStructureValidation = (formData) => {
  const [errors, setErrors] = useState({});

  // Validate the SIRET number
  const validateSiret = (siret) => {
    if (!siret) return true; // Optional field
    return /^\d{14}$/.test(siret);
  };

  // Validate email format
  const validateEmail = (email) => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate URL format
  const validateUrl = (url) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Full form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.type) newErrors.type = 'Le type de structure est requis';
    
    // Format validation
    if (formData.siret && !validateSiret(formData.siret)) {
      newErrors.siret = 'Le SIRET doit contenir exactement 14 chiffres';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (formData.siteWeb && !validateUrl(formData.siteWeb)) {
      newErrors.siteWeb = 'URL invalide';
    }
    
    // Contact validation
    if (formData.contact.email && !validateEmail(formData.contact.email)) {
      newErrors['contact.email'] = 'Format d\'email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    errors,
    validateForm,
    validateSiret,
    validateEmail,
    validateUrl
  };
};

export default useStructureValidation;