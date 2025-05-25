import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@ui/Button';
import FormHeader from './FormHeader';
import ValidationSummary from './ValidationSummary';
import ValidationSection from './ValidationSection';
import ValidationActionBar from './ValidationActionBar';
import ValidationModal from './ValidationModal';
import { useFormValidationData } from '@/hooks/forms';
import { useGenericFieldActions } from '@/hooks/generics/actions/useGenericFieldActions';
import { useValidationBatchActions } from '@/hooks/forms';
import { useGenericResponsive } from '@/hooks/generics/utils/useGenericResponsive';

/**
 * Interface de validation de formulaires - Version optimisée Phase 3
 * 
 * ✅ MIGRATION PHASE 3 APPLIQUÉE :
 * - useFieldActions → useGenericFieldActions (utilisation directe)
 * - useResponsive → useGenericResponsive (utilisation directe)
 * - Configuration optimisée pour les performances
 * - API enrichie avec nouvelles fonctionnalités
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 3 - Optimisation et adoption généralisée
 */
const FormValidationInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // ✅ PHASE 3: Hook responsive générique avec configuration avancée
  const { isMobile, isTablet, currentBreakpoint } = useGenericResponsive({
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    },
    enableOrientation: true,
    onBreakpointChange: (newBreakpoint) => {
      console.log('Breakpoint changé:', newBreakpoint);
    }
  }, {
    debounceDelay: 100,
    enablePerformanceMode: true
  });
  
  const {
    formData,
    concert,
    loading,
    error,
    validated,
    setValidated,
    validatedFields,
    setValidatedFields,
    programmateur,
    lieu,
    contactFields,
    structureFields,
    lieuFields
  } = useFormValidationData(id);
  
  // ✅ PHASE 3: Hook d'actions de champs générique avec configuration optimisée
  const {
    validateField,
    copyFieldValue,
    getFieldState,
    getPerformanceStats,
    fieldState,
    clearHistory
  } = useGenericFieldActions({
    entityType: 'formValidation',
    validationRules: {
      // Règles de validation pour les champs de contact
      'contact.nom': { required: true, minLength: 2 },
      'contact.email': { required: true, type: 'email' },
      'contact.telephone': { type: 'phone' },
      
      // Règles de validation pour les champs de lieu
      'lieu.nom': { required: true, minLength: 2 },
      'lieu.adresse': { required: true, minLength: 5 },
      'lieu.ville': { required: true, minLength: 2 },
      'lieu.codePostal': { required: true, minLength: 5, maxLength: 5 },
      
      // Règles de validation pour les champs de structure
      'structure.raisonSociale': { required: true, minLength: 2 },
      'structure.siret': { minLength: 14, maxLength: 14 }
    },
    onFieldChange: (fieldPath, value) => {
      console.log(`Champ ${fieldPath} modifié:`, value);
    },
    onValidationComplete: (fieldPath, isValid, errorMessage, duration) => {
      console.log(`Validation ${fieldPath}: ${isValid ? 'OK' : 'KO'} (${duration}ms)`);
    }
  }, {
    enableHistory: true,
    enablePerformance: true,
    enableLogging: process.env.NODE_ENV === 'development',
    maxHistorySize: 30,
    validationDelay: 200
  });
  
  const { validateForm, validationInProgress } = useValidationBatchActions({
    formId: formData?.id,
    concertId: id,
    validatedFields,
    setValidated
  });

  // ✅ PHASE 3: Fonction de validation enrichie avec le hook générique
  const handleValidateField = (category, fieldName, value) => {
    const fieldPath = `${category}.${fieldName}`;
    
    // Utiliser la validation générique avec tracking
    validateField(fieldPath, value, false);
    
    // Maintenir la compatibilité avec l'ancien système
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: value
    }));
  };

  // ✅ PHASE 3: Fonction de copie enrichie avec le hook générique
  const copyFormValueToFinal = (fieldPath, formValue) => {
    // Utiliser la copie générique avec tracking
    copyFieldValue(fieldPath, formValue);
    
    // Maintenir la compatibilité avec l'ancien système
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: formValue
    }));
  };

  // Handle validation confirmation
  const handleConfirmValidation = async () => {
    const success = await validateForm();
    if (success) {
      setShowConfirmModal(false);
      
      // ✅ PHASE 3: Effacer l'historique après validation réussie
      clearHistory();
    }
  };

  // Handle validation request
  const handleValidateRequest = () => {
    // ✅ PHASE 3: Afficher les statistiques de performance en développement
    if (process.env.NODE_ENV === 'development') {
      const stats = getPerformanceStats();
      console.log('Statistiques de validation:', stats);
    }
    
    setShowConfirmModal(true);
  };
  
  // Loading state - Adapté selon la taille d'écran
  if (loading) {
    return (
      <div className={`loading-container text-center my-5 ${isMobile ? 'px-3' : ''}`}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement des données du formulaire...</span>
        </div>
        <p className="mt-3">
          {isMobile ? 'Chargement...' : 'Chargement des données du formulaire...'}
        </p>
      </div>
    );
  }

  // Error state - Adapté selon la taille d'écran
  if (error) {
    return (
      <div className={`error-container text-center my-5 ${isMobile ? 'px-3' : ''}`}>
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <Button 
          variant="primary"
          className="mt-3"
          size={isMobile ? 'sm' : 'md'}
          onClick={() => navigate(`/concerts/${id}`)}
        >
          {isMobile ? 'Retour' : 'Retour à la fiche concert'}
        </Button>
      </div>
    );
  }

  // Not found state - Adapté selon la taille d'écran
  if (!formData || !concert) {
    return (
      <div className={`not-found-container text-center my-5 ${isMobile ? 'px-3' : ''}`}>
        <div className="alert alert-warning">
          <i className="bi bi-question-circle-fill me-2"></i>
          Formulaire non trouvé.
        </div>
        <Button 
          variant="primary"
          className="mt-3"
          size={isMobile ? 'sm' : 'md'}
          onClick={() => navigate(`/concerts/${id}`)}
        >
          {isMobile ? 'Retour' : 'Retour à la fiche concert'}
        </Button>
      </div>
    );
  }
  
  const isAlreadyValidated = formData.status === 'validated';

  return (
    <div className={`form-validation container mt-4 ${isMobile ? 'px-2' : ''}`}>
      <FormHeader 
        concertId={id}
        isValidated={isAlreadyValidated || validated}
        navigate={navigate}
        isMobile={isMobile}
        currentBreakpoint={currentBreakpoint}
      />
      
      {(isAlreadyValidated || validated) && (
        <ValidationSummary 
          isMobile={isMobile}
          performanceStats={getPerformanceStats()}
        />
      )}
      
      {/* Concert information */}
      <ValidationSection
        title="Informations du concert"
        headerClass="bg-primary"
        concert={concert}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      
      {/* Lieu information */}
      <ValidationSection
        title="Informations du lieu"
        headerClass="bg-info"
        fields={lieuFields}
        category="lieu"
        existingData={lieu}
        formData={formData.lieuData}
        validatedFields={validatedFields}
        onValidateField={handleValidateField}
        onCopyValue={copyFormValueToFinal}
        isValidated={isAlreadyValidated || validated}
        isMobile={isMobile}
        isTablet={isTablet}
        // ✅ PHASE 3: Nouvelles props avec état des champs
        fieldState={fieldState}
        getFieldState={getFieldState}
      />
      
      {/* Contact information */}
      <ValidationSection
        title="Informations du contact"
        headerClass="bg-secondary"
        fields={contactFields}
        category="contact"
        existingData={programmateur}
        formData={formData.programmateurData || formData.data}
        validatedFields={validatedFields}
        onValidateField={handleValidateField}
        onCopyValue={copyFormValueToFinal}
        isValidated={isAlreadyValidated || validated}
        isMobile={isMobile}
        isTablet={isTablet}
        // ✅ PHASE 3: Nouvelles props avec état des champs
        fieldState={fieldState}
        getFieldState={getFieldState}
      />
      
      {/* Structure information */}
      <ValidationSection
        title="Informations de la structure"
        headerClass="bg-secondary"
        fields={structureFields}
        category="structure"
        existingData={programmateur}
        formData={formData.programmateurData || formData.data}
        validatedFields={validatedFields}
        onValidateField={handleValidateField}
        onCopyValue={copyFormValueToFinal}
        isValidated={isAlreadyValidated || validated}
        structureFieldsMapping={true}
        isMobile={isMobile}
        isTablet={isTablet}
        // ✅ PHASE 3: Nouvelles props avec état des champs
        fieldState={fieldState}
        getFieldState={getFieldState}
      />
      
      {/* Validation buttons */}
      {!isAlreadyValidated && !validated && (
        <ValidationActionBar
          onValidate={handleValidateRequest}
          isValidating={validationInProgress}
          isMobile={isMobile}
          // ✅ PHASE 3: Nouvelles props avec statistiques
          validationStats={getPerformanceStats()}
          totalFields={Object.keys(fieldState.values).length}
          validFields={Object.values(fieldState.validationStatus).filter(status => status === 'valid').length}
        />
      )}

      {/* Confirmation modal */}
      <ValidationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmValidation}
        title="Confirmer la validation"
        message="Êtes-vous sûr de vouloir valider ce formulaire ? Les données validées seront enregistrées dans la fiche du concert, du lieu et du programmateur."
        isProcessing={validationInProgress}
        isMobile={isMobile}
        // ✅ PHASE 3: Nouvelles props avec informations détaillées
        validationSummary={{
          totalFields: Object.keys(fieldState.values).length,
          validFields: Object.values(fieldState.validationStatus).filter(status => status === 'valid').length,
          invalidFields: Object.values(fieldState.validationStatus).filter(status => status === 'invalid').length,
          performanceStats: getPerformanceStats()
        }}
      />
    </div>
  );
};

export default FormValidationInterface;
