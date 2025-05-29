import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Import custom hooks
import { useFormValidationData } from '@/hooks/forms';
import { useValidationBatchActions } from '@/hooks/forms';

// Import components
import Button from '@ui/Button';
import Alert from '@ui/Alert';
import FormGenerator from '@/components/forms/FormGenerator';
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
    lieuFields
  } = useFormValidationData(id);
  
  // Fonctions pour gérer la validation des champs - SIMPLIFIÉ
  const handleValidateField = (category, fieldId, value) => {
    const fieldPath = `${category}.${fieldId}`;
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: value
    }));
  };
  
  const copyFormValueToFinal = (fieldPath, formValue) => {
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: formValue
    }));
  };
  
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
        <Alert variant="danger">
          {error}
        </Alert>
        <Button 
          variant="primary"
          className="mt-3"
          onClick={() => navigate(`/concerts/${id}`)}
        >
          Retour à la fiche concert
        </Button>
      </div>
    );
  }

  // Not found state - show FormGenerator instead
  if (!formData || !concert) {
    return (
      <div className="form-generation-container container mt-4">
        <FormHeader 
          concertId={id}
          isValidated={false}
          navigate={navigate}
        />
        
        <Alert variant="info" className="mb-4">
          <i className="bi bi-info-circle me-2"></i>
          Aucun formulaire n'a encore été envoyé pour ce concert.
        </Alert>
        
        <FormGenerator
          concertId={id}
          programmateurId={concert?.programmateurId}
          onFormGenerated={(formLinkId, formUrl) => {
            // Optionnel : afficher un message de succès
            console.log('Formulaire généré avec succès:', formUrl);
          }}
        />
        
        <div className="mt-4">
          <Button 
            variant="outline-secondary"
            onClick={() => navigate(`/concerts/${id}`)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Retour à la fiche concert
          </Button>
        </div>
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
      
      {/* Affichage du FormGenerator par défaut pour montrer le lien existant - MODIFIÉ */}
      <div className="mb-4">
        <FormGenerator
          concertId={id}
          programmateurId={concert?.programmateurId}
          onFormGenerated={(formLinkId, formUrl) => {
            console.log('Nouveau formulaire généré:', formUrl);
            // Optionnel : rafraîchir les données
          }}
        />
      </div>
      
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
        formData={formData.signataireData || formData.programmateurData || formData.data}
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
        formData={formData.structureData || formData.programmateurData || formData.data}
        validatedFields={validatedFields}
        onValidateField={handleValidateField}
        onCopyValue={copyFormValueToFinal}
        isValidated={isAlreadyValidated || validated}
        structureFieldsMapping={true}
      />
      
      {/* Validation buttons - Toujours visibles pour permettre les modifications */}
      <ValidationActionBar
        onValidate={handleValidateRequest}
        isValidating={validationInProgress}
        isAlreadyValidated={isAlreadyValidated || validated}
      />

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