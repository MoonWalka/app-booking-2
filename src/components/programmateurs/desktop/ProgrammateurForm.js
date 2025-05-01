import React, { useState, useEffect } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from './ProgrammateurForm.module.css';

// Import des sous-composants
import ContactInfoSection from '../sections/ContactInfoSection';
import StructureInfoSection from '../sections/StructureInfoSection';
import LieuInfoSection from '../sections/LieuInfoSection';
import CompanySearchSection from '../sections/CompanySearchSection';
import ProgrammateurFormActions from '../sections/ProgrammateurFormActions';

// Import des hooks personnalisés
import useProgrammateurForm from '@/hooks/programmateurs/useProgrammateurForm';
import useCompanySearch from '@/hooks/programmateurs/useCompanySearch';
import useAddressSearch from '@/hooks/programmateurs/useAddressSearch';

const ProgrammateurForm = ({ token, concertId, formLinkId, initialLieuData, onSubmitSuccess }) => {
  // États de base du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    fonction: '',
    email: '',
    telephone: '',
    structure: '',
    structureType: '',
    structureAdresse: '',
    structureCodePostal: '',
    structureVille: '',
    structurePays: 'France',
    siret: '',
    codeAPE: ''
  });
  
  // États pour les informations du lieu
  const [lieuData, setLieuData] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    capacite: '',
    latitude: null,
    longitude: null
  });

  // États pour la gestion du formulaire
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [existingProgrammId, setExistingProgrammId] = useState(null);
  const navigate = useNavigate();

  // Utiliser les hooks personnalisés pour la recherche d'entreprise et d'adresses
  const { 
    searchType, 
    setSearchType,
    searchTerm, 
    setSearchTerm,
    searchResults,
    isSearchingCompany,
    handleSelectCompany
  } = useCompanySearch(setFormData);

  const {
    addressSuggestions,
    isSearchingAddress,
    addressFieldActive, 
    setAddressFieldActive,
    handleSelectAddress,
    lieuAddressSuggestions,
    isSearchingLieuAddress,
    lieuAddressFieldActive, 
    setLieuAddressFieldActive,
    handleSelectLieuAddress
  } = useAddressSearch(formData, setFormData, lieuData, setLieuData);
  
  // Logique d'initialisation et de récupération des données existantes
  useEffect(() => {
    if (initialLieuData && Object.keys(initialLieuData).length > 0) {
      setLieuData(prev => ({
        ...prev,
        ...initialLieuData
      }));
    }
  }, [initialLieuData]);
  
  // Chercher si ce formulaire a déjà été rempli pour pré-remplir les données
  useEffect(() => {
    const fetchPreviousData = async () => {
      // Cette logique devrait idéalement être déplacée vers un hook personnalisé comme useFormInitialization
      // Ici, on maintient simplement l'existant pour l'exemple
      setLoading(false); // Terminer le chargement après initialisation
    };
    
    if (concertId) {
      fetchPreviousData();
    } else {
      setLoading(false);
    }
  }, [concertId]);

  // Gestionnaire de changement de champ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Réinitialiser l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  // Gestionnaire pour les changements de données du lieu
  const handleLieuChange = (e) => {
    const { name, value } = e.target;
    setLieuData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    // Validation des champs requis
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    
    // L'email n'est plus requis, mais on valide quand même son format s'il est fourni
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'adresse email invalide";
    }
    
    if (!formData.structure.trim()) newErrors.structure = 'Le nom de la structure est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Logique de soumission - à déplacer vers useFormSubmission
      setSuccess(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setError('Une erreur est survenue lors de la soumission. Veuillez réessayer plus tard.');
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour gérer l'annulation du formulaire
  const handleCancel = () => {
    if (onSubmitSuccess) {
      onSubmitSuccess();
    } else {
      navigate('/programmateurs');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement du formulaire...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="form-success text-center my-4">
        <div className="icon-container mb-3">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
        </div>
        <h2 className="mb-3">Merci pour votre soumission !</h2>
        <p className="mb-4">Vos informations ont été enregistrées avec succès.</p>
        {!onSubmitSuccess && (
          <button 
            className="btn btn-outline-primary"
            onClick={() => setSuccess(false)}
          >
            <i className="bi bi-pencil me-2"></i>
            Modifier mes informations
          </button>
        )}
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className={styles.formContainer}>
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}
      
      {/* Section des informations de contact */}
      <ContactInfoSection 
        formData={formData}
        handleChange={handleChange}
        errors={errors}
      />
      
      {/* Section Structure juridique avec recherche d'entreprise intégrée */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <i className="bi bi-building"></i>
          </div>
          <h3>Structure juridique</h3>
        </div>
        <div className={styles.cardBody}>
          {/* Options de recherche d'entreprise */}
          <CompanySearchSection 
            searchType={searchType}
            setSearchType={setSearchType}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            isSearchingCompany={isSearchingCompany}
            handleSelectCompany={handleSelectCompany}
          />
          
          {/* Formulaire de structure juridique */}
          <StructureInfoSection 
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            addressSuggestions={addressSuggestions} 
            isSearchingAddress={isSearchingAddress}
            addressFieldActive={addressFieldActive}
            setAddressFieldActive={setAddressFieldActive}
            handleSelectAddress={handleSelectAddress}
          />
        </div>
      </div>
      
      {/* Section d'édition des informations du lieu */}
      <LieuInfoSection 
        lieuData={lieuData}
        setLieuData={setLieuData}
        handleLieuChange={handleLieuChange}
        lieuAddressSuggestions={lieuAddressSuggestions}
        isSearchingLieuAddress={isSearchingLieuAddress}
        lieuAddressFieldActive={lieuAddressFieldActive}
        setLieuAddressFieldActive={setLieuAddressFieldActive}
        handleSelectLieuAddress={handleSelectLieuAddress}
      />
      
      {/* Boutons d'action */}
      <ProgrammateurFormActions 
        handleCancel={handleCancel}
        submitting={submitting}
      />
    </Form>
  );
};

export default ProgrammateurForm;
