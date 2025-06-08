/**
 * @fileoverview Hook autonome pour le formulaire d'entreprise - VERSION ROBUSTE
 * Version complètement autonome sans dépendances sur les hooks génériques
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Option 2 - Hooks Autonomes
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParametres } from '@context/ParametresContext';

/**
 * Hook autonome pour le formulaire d'entreprise
 * 
 * ✅ CARACTÉRISTIQUES :
 * - Aucune dépendance sur useGenericEntityForm
 * - Aucune dépendance sur useGenericAction
 * - Aucune dépendance sur useGenericValidation
 * - Logique de validation intégrée
 * - Gestion d'état simplifiée
 * - Zéro boucle infinie garantie
 */
export const useEntrepriseFormRobuste = () => {
  const { parametres, sauvegarderParametres } = useParametres();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const isMountedRef = useRef(true);

  // ✅ État du formulaire avec données initiales stables
  const [formData, setFormData] = useState(() => ({
    nom: parametres?.entreprise?.nom || '',
    siret: parametres?.entreprise?.siret || '',
    adresse: parametres?.entreprise?.adresse || '',
    ville: parametres?.entreprise?.ville || '',
    codePostal: parametres?.entreprise?.codePostal || '',
    telephone: parametres?.entreprise?.telephone || '',
    email: parametres?.entreprise?.email || '',
    siteWeb: parametres?.entreprise?.siteWeb || '',
    description: parametres?.entreprise?.description || '',
    secteurActivite: parametres?.entreprise?.secteurActivite || '',
    formeJuridique: parametres?.entreprise?.formeJuridique || '',
    numeroTVA: parametres?.entreprise?.numeroTVA || '',
    codeAPE: parametres?.entreprise?.codeAPE || '',
    capitalSocial: parametres?.entreprise?.capitalSocial || '',
    dateCreation: parametres?.entreprise?.dateCreation || '',
    effectifs: parametres?.entreprise?.effectifs || ''
  }));

  // ✅ Nettoyage au démontage
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ✅ Validation intégrée simple
  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'nom':
        if (!value || value.trim().length < 2) {
          newErrors.nom = 'Le nom de l\'entreprise doit contenir au moins 2 caractères';
        } else {
          delete newErrors.nom;
        }
        break;
      case 'siret':
        if (value && !/^\d{14}$/.test(value.replace(/\s/g, ''))) {
          newErrors.siret = 'Le SIRET doit contenir 14 chiffres';
        } else {
          delete newErrors.siret;
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Format d\'email invalide';
        } else {
          delete newErrors.email;
        }
        break;
      case 'telephone':
        if (value && !/^(?:\+33|0)[1-9](?:[0-9]{8})$/.test(value.replace(/\s/g, ''))) {
          newErrors.telephone = 'Format de téléphone invalide';
        } else {
          delete newErrors.telephone;
        }
        break;
      case 'codePostal':
        if (value && !/^\d{5}$/.test(value)) {
          newErrors.codePostal = 'Le code postal doit contenir 5 chiffres';
        } else {
          delete newErrors.codePostal;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors]);

  // ✅ Mise à jour des données du formulaire
  const updateFormData = useCallback((updates) => {
    if (!isMountedRef.current) return;
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // ✅ Gestionnaire de changement de champ
  const handleChange = useCallback((event) => {
    if (!isMountedRef.current) return;
    
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Validation en temps réel
    validateField(name, fieldValue);
  }, [validateField]);

  // ✅ Sélection d'entreprise depuis la recherche
  const handleSelectCompany = useCallback((company) => {
    if (!isMountedRef.current) return;
    
    const updates = {
      nom: company.nom || company.denomination || '',
      siret: company.siret || '',
      adresse: company.adresse || '',
      ville: company.ville || '',
      codePostal: company.codePostal || '',
      secteurActivite: company.secteurActivite || '',
      formeJuridique: company.formeJuridique || '',
      codeAPE: company.codeAPE || '',
      dateCreation: company.dateCreation || ''
    };
    
    updateFormData(updates);
  }, [updateFormData]);

  // ✅ Soumission du formulaire
  const handleSubmit = useCallback(async (event) => {
    if (event) event.preventDefault();
    if (!isMountedRef.current) return;

    setLoading(true);
    setSuccess(false);

    try {
      // Validation complète
      let isValid = true;
      Object.entries(formData).forEach(([name, value]) => {
        if (!validateField(name, value)) {
          isValid = false;
        }
      });

      if (!isValid) {
        setLoading(false);
        return;
      }

      // Sauvegarde via le contexte
      const updatedParametres = {
        ...parametres,
        entreprise: {
          ...parametres?.entreprise,
          ...formData,
          updatedAt: new Date().toISOString()
        }
      };

      await sauvegarderParametres(updatedParametres);

      if (isMountedRef.current) {
        setSuccess(true);
        setTimeout(() => {
          if (isMountedRef.current) setSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [formData, parametres, sauvegarderParametres, validateField]);

  // ✅ Interface de retour stable
  return {
    formData,
    loading,
    success,
    errors,
    updateFormData,
    handleChange,
    handleSelectCompany,
    handleSubmit,
    validateField,
    isValid: Object.keys(errors).length === 0
  };
}; 