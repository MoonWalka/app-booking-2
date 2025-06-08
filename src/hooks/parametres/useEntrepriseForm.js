import { useState, useEffect, useCallback } from 'react';
import { useParametres } from '@/context/ParametresContext';
import { useOrganization } from '@/context/OrganizationContext';
import { doc, setDoc, getDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

console.log('[UEF] Hook useEntrepriseForm importé');

/**
 * Hook autonome pour gérer le formulaire d'entreprise
 * Version simplifiée sans dépendance sur useGenericEntityForm
 * 
 * @returns {Object} État du formulaire, handlers et fonctions de soumission
 */
export const useEntrepriseForm = () => {
  console.log('[UEF] Appel de useEntrepriseForm');
  const { parametres, sauvegarderParametres, loading: contextLoading } = useParametres();
  const { currentOrganization } = useOrganization();
  
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
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  
  console.log('[UEF] ParametresContext:', { entreprise: parametres.entreprise, loading: contextLoading });

  // Charger les données d'entreprise depuis l'organisation
  useEffect(() => {
    const loadEntrepriseData = async () => {
      if (!currentOrganization?.id) return;
      
      try {
        const entrepriseRef = doc(db, 'organizations', currentOrganization.id, 'settings', 'entreprise');
        const entrepriseDoc = await getDoc(entrepriseRef);
        
        if (entrepriseDoc.exists()) {
          const entrepriseData = entrepriseDoc.data();
          console.log('[UEF] Données entreprise chargées depuis l\'organisation:', entrepriseData);
          setFormData(entrepriseData);
        } else if (parametres.entreprise && Object.keys(parametres.entreprise).length > 0) {
          // Fallback sur les paramètres du contexte
          console.log('[UEF] Fallback sur parametres.entreprise:', parametres.entreprise);
          setFormData(parametres.entreprise);
        }
      } catch (error) {
        console.error('[UEF] Erreur lors du chargement des données entreprise:', error);
        // Fallback sur les paramètres du contexte
        if (parametres.entreprise) {
          setFormData(parametres.entreprise);
        }
      }
    };

    loadEntrepriseData();
  }, [currentOrganization?.id, parametres.entreprise]);

  // Validation des données
  const validateForm = useCallback((data) => {
    console.log('[UEF] validateForm appelé avec:', data);
    const errors = {};
    if (!data.nom) errors.nom = 'Le nom de l\'entreprise est obligatoire';
    if (!data.adresse) errors.adresse = 'L\'adresse est obligatoire';
    if (!data.codePostal) errors.codePostal = 'Le code postal est obligatoire';
    if (!data.ville) errors.ville = 'La ville est obligatoire';
    if (data.siret && !/^\d{14}$/.test(data.siret.replace(/\s/g, ''))) errors.siret = 'Le numéro SIRET doit contenir 14 chiffres';
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Format d\'email invalide';
    console.log('[UEF] validateForm erreurs:', errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  }, []);

  // Gestion des changements de champs
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
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

  // Mise à jour directe des données du formulaire
  const updateFormData = useCallback((newData) => {
    if (typeof newData === 'function') {
      setFormData(prev => newData(prev));
    } else {
      setFormData(newData);
    }
  }, []);

  // Soumission du formulaire
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    console.log('[UEF] handleSubmit appelé avec formData:', formData);
    
    setLoading(true);
    setErrors({});
    
    try {
      if (!currentOrganization?.id) {
        throw new Error('Aucune organisation sélectionnée');
      }

      // Validation
      const validation = validateForm(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Sauvegarder les informations d'entreprise dans l'organisation
      const entrepriseRef = doc(db, 'organizations', currentOrganization.id, 'settings', 'entreprise');
      const entrepriseData = {
        ...formData,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current-user' // TODO: Récupérer l'ID utilisateur actuel
      };

      await setDoc(entrepriseRef, entrepriseData);
      
      // Aussi sauvegarder dans le contexte global pour compatibilité
      await sauvegarderParametres('entreprise', formData);
      
      setSuccess('Informations de l\'entreprise enregistrées avec succès !');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('[UEF] Erreur lors de la sauvegarde:', error);
      setErrors({ submit: error.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  }, [formData, currentOrganization?.id, validateForm, sauvegarderParametres]);

  // Sélection d'entreprise depuis la recherche
  const handleSelectCompany = useCallback((company) => {
    console.log('[UEF] handleSelectCompany appelé avec:', company);
    setFormData(prev => ({
      ...prev,
      nom: company.nom || '',
      adresse: company.adresse || '',
      codePostal: company.codePostal || '',
      ville: company.ville || '',
      siret: company.siret || '',
      codeAPE: company.codeAPE || ''
    }));
  }, []);

  const returnValues = {
    formData,
    loading: contextLoading || loading,
    success,
    errors,
    handleChange,
    updateFormData,
    handleSubmit,
    handleSelectCompany
  };

  console.log('[UEF] useEntrepriseForm retourne:', { loading: returnValues.loading, formData: returnValues.formData, success: returnValues.success });

  return returnValues;
};

export default useEntrepriseForm;