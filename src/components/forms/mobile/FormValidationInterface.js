import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Alert, Button } from 'react-bootstrap';
import styles from './FormValidationInterface.module.css';

// Import custom hooks
import { 
  useFormValidationData, 
  useFieldActions, 
  useValidationBatchActions 
} from '@/hooks/forms';

// Import components
import FormHeader from './sections/FormHeader';
import ValidationSummary from './sections/ValidationSummary';
import ValidationSection from './sections/ValidationSection';
import ValidationActionBar from './sections/ValidationActionBar';
import ValidationModal from './sections/ValidationModal';

/**
 * FormValidationInterface - Interface mobile de validation des formulaires
 * 
 * Version adaptée pour les appareils mobiles qui utilise les mêmes hooks
 * que la version desktop mais avec une interface optimisée pour mobile.
 */
const FormValidationInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Use the same custom hooks as desktop version
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
    lieuFields,
    formatDate,
    formatCurrency
  } = useFormValidationData(id);
  
  // Hook for field validation actions
  const { handleValidateField, copyFormValueToFinal } = useFieldActions(
    validatedFields,
    setValidatedFields
  );
  
  // Hook for batch validation actions
  const { validateForm, validationInProgress } = useValidationBatchActions({
    formId: formData?.id,
    concertId: id,
    validatedFields,
    setValidated
  });

  // Handle validation confirmation
  const handleConfirmValidation = async () => {
    const success = await validateForm();
    if (success) {
      setShowConfirmModal(false);
    }
  };

  // Handle validation request
  const handleValidateRequest = () => {
    setShowConfirmModal(true);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="primary" />
        <p className={styles.loadingText}>Chargement des données...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
        <Button 
          variant="primary"
          className={styles.backButton}
          onClick={() => navigate(`/concerts/${id}`)}
        >
          Retour à la fiche concert
        </Button>
      </div>
    );
  }

  // Not found state
  if (!formData || !concert) {
    return (
      <div className={styles.notFoundContainer}>
        <Alert variant="warning">
          <i className="bi bi-question-circle-fill me-2"></i>
          Formulaire non trouvé.
        </Alert>
        <Button 
          variant="primary"
          className={styles.backButton}
          onClick={() => navigate(`/concerts/${id}`)}
        >
          Retour à la fiche concert
        </Button>
      </div>
    );
  }
  
  const isAlreadyValidated = formData.status === 'validated';

  return (
    <div className={styles.formValidation}>
      <FormHeader 
        concertId={id}
        isValidated={isAlreadyValidated || validated}
        navigate={navigate}
      />
      
      {(isAlreadyValidated || validated) && (
        <ValidationSummary />
      )}
      
      {/* Concert information - Mobile version */}
      <ValidationSection
        title="Informations du concert"
        headerClass={styles.concertSectionHeader}
        concert={concert}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
      
      {/* Lieu information - Mobile version */}
      <ValidationSection
        title="Informations du lieu"
        headerClass={styles.lieuSectionHeader}
        fields={lieuFields}
        category="lieu"
        existingData={lieu}
        formData={formData.lieuData}
        validatedFields={validatedFields}
        onValidateField={handleValidateField}
        onCopyValue={copyFormValueToFinal}
        isValidated={isAlreadyValidated || validated}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
      
      {/* Contact information - Mobile version */}
      <ValidationSection
        title="Informations du contact"
        headerClass={styles.contactSectionHeader}
        fields={contactFields}
        category="contact"
        existingData={contact || programmateur}
        formData={formData.programmateurData || formData.contactData || formData.data}
        validatedFields={validatedFields}
        onValidateField={handleValidateField}
        onCopyValue={copyFormValueToFinal}
        isValidated={isAlreadyValidated || validated}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
      
      {/* Structure information - Mobile version */}
      <ValidationSection
        title="Informations de la structure"
        headerClass={styles.structureSectionHeader}
        fields={structureFields}
        category="structure"
        existingData={contact || programmateur}
        formData={formData.programmateurData || formData.contactData || formData.data}
        validatedFields={validatedFields}
        onValidateField={handleValidateField}
        onCopyValue={copyFormValueToFinal}
        isValidated={isAlreadyValidated || validated}
        structureFieldsMapping={true}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
      
      {/* Validation button - Mobile version */}
      {!isAlreadyValidated && !validated && (
        <ValidationActionBar
          onValidate={handleValidateRequest}
          isValidating={validationInProgress}
        />
      )}

      {/* Confirmation modal - Mobile version */}
      <ValidationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmValidation}
        title="Confirmer la validation"
        message="Êtes-vous sûr de vouloir valider ce formulaire ? Les données seront enregistrées dans la fiche du concert."
        isProcessing={validationInProgress}
      />
    </div>
  );
};

export default FormValidationInterface;