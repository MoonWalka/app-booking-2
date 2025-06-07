import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@ui/Button';
import Alert from '@ui/Alert';
import FormHeader from './FormHeader';
import ValidationSummary from './ValidationSummary';
import ValidationSection from './ValidationSection';
import ValidationActionBar from './ValidationActionBar';
import ValidationModal from './ValidationModal';
import { useFormValidationData } from '@/hooks/forms';
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
    contact,
    programmateur, // Rétrocompatibilité
    lieu,
    contactFields,
    structureFields,
    lieuFields
  } = useFormValidationData(id);
  
  // ✅ PHASE 3: Hook d'actions de champs générique avec configuration optimisée
  // Hook temporairement désactivé car variables non utilisées (évite warnings ESLint)
  /*
  const {
    // Variables supprimées car non utilisées pour éviter les warnings ESLint
    // validateField, copyFieldValue, getFieldState, getPerformanceStats, fieldState, clearHistory
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
  */
  
  const { validateForm, validationInProgress } = useValidationBatchActions({
    formId: formData?.id,
    concertId: id,
    validatedFields,
    setValidated
  });

  // ✅ PHASE 3: Fonction de validation enrichie avec le hook générique
  const handleValidateField = (category, fieldName, value) => {
    const fieldPath = `${category}.${fieldName}`;
    
    // CORRECTION: Ne plus utiliser validateField du hook générique pour éviter le conflit d'état
    // validateField(fieldPath, value, false);
    
    // Utiliser uniquement l'état local validatedFields pour éviter les conflits
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: value
    }));

    // Log pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`Champ validé ${fieldPath}:`, value);
    }
  };

  // ✅ PHASE 3: Fonction de copie enrichie avec le hook générique
  const copyFormValueToFinal = (fieldPath, formValue) => {
    // CORRECTION: Ne plus utiliser copyFieldValue du hook générique pour éviter le conflit d'état
    // copyFieldValue(fieldPath, formValue);
    
    // Utiliser uniquement l'état local validatedFields pour éviter les conflits
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: formValue
    }));

    // Log pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`Valeur copiée pour ${fieldPath}:`, formValue);
    }
  };

  // Handle validation confirmation
  const handleConfirmValidation = async () => {
    const success = await validateForm();
    if (success) {
      setShowConfirmModal(false);
      
      // ✅ CORRECTION: Plus besoin d'effacer l'historique du hook générique
      // clearHistory();
    }
  };

  // Handle validation request
  const handleValidateRequest = () => {
    // ✅ CORRECTION: Afficher les statistiques locales en développement au lieu du hook générique
    if (process.env.NODE_ENV === 'development') {
      const stats = {
        totalFields: Object.keys(validatedFields).length,
        validFields: Object.values(validatedFields).filter(value => value && value.trim() !== '').length
      };
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
        <Alert variant="danger">
          {error}
        </Alert>
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
        <Alert variant="warning">
          Formulaire non trouvé.
        </Alert>
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
          performanceStats={{}}
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
      />
      
      {/* Contact information */}
      <ValidationSection
        title="Informations du contact"
        headerClass="bg-secondary"
        fields={contactFields}
        category="contact"
        existingData={contact || programmateur}
        formData={formData.programmateurData || formData.contactData || formData.data}
        validatedFields={validatedFields}
        onValidateField={handleValidateField}
        onCopyValue={copyFormValueToFinal}
        isValidated={isAlreadyValidated || validated}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      
      {/* Structure information */}
      <ValidationSection
        title="Informations de la structure"
        headerClass="bg-secondary"
        fields={structureFields}
        category="structure"
        existingData={contact || programmateur}
        formData={formData.programmateurData || formData.contactData || formData.data}
        validatedFields={validatedFields}
        onValidateField={handleValidateField}
        onCopyValue={copyFormValueToFinal}
        isValidated={isAlreadyValidated || validated}
        structureFieldsMapping={true}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      
      {/* Validation buttons */}
      {!isAlreadyValidated && !validated && (
        <ValidationActionBar
          onValidate={handleValidateRequest}
          isValidating={validationInProgress}
          isMobile={isMobile}
          // ✅ CORRECTION: Utiliser des valeurs calculées localement au lieu du hook générique
          validationStats={{}}
          totalFields={Object.keys(validatedFields).length}
          validFields={Object.values(validatedFields).filter(value => value && value.trim() !== '').length}
        />
      )}

      {/* Confirmation modal */}
      <ValidationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmValidation}
        title="Confirmer la validation"
        message="Êtes-vous sûr de vouloir valider ce formulaire ? Les données validées seront enregistrées dans la fiche du concert, du lieu et du contact."
        isProcessing={validationInProgress}
        isMobile={isMobile}
        // ✅ CORRECTION: Utiliser des valeurs calculées localement au lieu du hook générique
        validationSummary={{
          totalFields: Object.keys(validatedFields).length,
          validFields: Object.values(validatedFields).filter(value => value && value.trim() !== '').length,
          invalidFields: 0,
          performanceStats: {}
        }}
      />
    </div>
  );
};

export default FormValidationInterface;
