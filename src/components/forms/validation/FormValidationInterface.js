import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Import custom hooks
import useFormValidationData from '../../../hooks/forms/useFormValidationData';
import useFieldActions from '../../../hooks/forms/useFieldActions';
import useValidationBatchActions from '../../../hooks/forms/useValidationBatchActions';

// Import components
import FormHeader from './FormHeader';
import ValidationSummary from './ValidationSummary';
import ValidationSection from './ValidationSection';
import ValidationActionBar from './ValidationActionBar';
import ValidationModal from './ValidationModal';

const FormValidationInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Use the custom hooks to manage data and actions
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
      <div className="loading-container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement des données du formulaire...</span>
        </div>
        <p className="mt-3">Chargement des données du formulaire...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container text-center my-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate(`/concerts/${id}`)}
        >
          Retour à la fiche concert
        </button>
      </div>
    );
  }

  // Not found state
  if (!formData || !concert) {
    return (
      <div className="not-found-container text-center my-5">
        <div className="alert alert-warning">
          <i className="bi bi-question-circle-fill me-2"></i>
          Formulaire non trouvé.
        </div>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate(`/concerts/${id}`)}
        >
          Retour à la fiche concert
        </button>
      </div>
    );
  }
  
  const isAlreadyValidated = formData.status === 'validated';

  return (
    <div className="form-validation container mt-4">
      <FormHeader 
        concertId={id}
        isValidated={isAlreadyValidated || validated}
        navigate={navigate}
      />
      
      {(isAlreadyValidated || validated) && (
        <ValidationSummary />
      )}
      
      {/* Concert information */}
      <ValidationSection
        title="Informations du concert"
        headerClass="bg-primary"
        concert={concert}
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
      />
      
      {/* Validation buttons */}
      {!isAlreadyValidated && !validated && (
        <ValidationActionBar
          onValidate={handleValidateRequest}
          isValidating={validationInProgress}
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
      />
    </div>
  );
};

export default FormValidationInterface;