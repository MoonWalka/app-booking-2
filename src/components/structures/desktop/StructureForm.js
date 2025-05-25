import React from 'react';
import { useParams } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap';
import FlexContainer from '@/components/ui/FlexContainer';
// MIGRATION: Utilisation du hook optimisé au lieu de l'ancien hook
import { useStructureForm, useStructureValidation } from '@/hooks/structures';
import useDeleteStructure from '@/hooks/structures/useDeleteStructure';
import styles from './StructureForm.module.css';

// Import modular section components
import StructureFormHeader from './sections/StructureFormHeader';
import StructureIdentitySection from './sections/StructureIdentitySection';
import StructureAddressSection from './sections/StructureAddressSection';
import StructureBillingSection from './sections/StructureBillingSection';
import StructureContactSection from './sections/StructureContactSection';
import StructureNotesSection from './sections/StructureNotesSection';
import StructureFormActions from './sections/StructureFormActions';

/**
 * StructureForm Component - Refactored with modular architecture
 * Handles creating and editing structure entities
 */
const StructureForm = () => {
  const { id } = useParams();
  
  // MIGRATION: Utilisation du hook optimisé
  const {
    isEditMode,
    loading,
    submitting,
    error,
    validated,
    formData,
    handleChange,
    handleSubmit,
    handleCancel
  } = useStructureForm(id);

  // Use validation hook - NOUVEAU: Finalisation intelligente avec validation temps réel
  const { errors, validateForm } = useStructureValidation(formData);

  // Ajout du hook de suppression optimisé
  const {
    isDeleting,
    handleDelete
  } = useDeleteStructure(() => window.location.assign('/structures'));

  // Show loading state
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className={styles.spinner} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      {/* Form header with title and back button */}
      <StructureFormHeader 
        id={id} 
        formData={formData} 
        navigate={handleCancel} 
      />

      {/* Error display */}
      {error && (
        <Alert variant="danger" className={styles.alertError}>
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </Alert>
      )}

      {/* Main form */}
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        {/* NOUVEAU: Affichage du résumé des erreurs de validation */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="warning" className={styles.validationAlert}>
            <FlexContainer align="center" className="mb-2">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Veuillez corriger les erreurs suivantes :</strong>
            </FlexContainer>
            <ul className="mb-0">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Identity information */}
        <StructureIdentitySection 
          formData={formData}
          handleChange={handleChange}
          errors={errors} // NOUVEAU: Transmission des erreurs pour validation temps réel
        />
        
        {/* Address and contact information */}
        <StructureAddressSection 
          formData={formData}
          handleChange={handleChange}
          errors={errors} // NOUVEAU: Transmission des erreurs
        />
        
        {/* Billing information */}
        <StructureBillingSection
          formData={formData}
          handleChange={handleChange}
          errors={errors} // NOUVEAU: Transmission des erreurs
        />
        
        {/* Primary contact person */}
        <StructureContactSection 
          contact={formData.contact}
          handleChange={handleChange}
          errors={errors} // NOUVEAU: Transmission des erreurs
        />
        
        {/* Notes */}
        <StructureNotesSection 
          notes={formData.notes}
          handleChange={handleChange} 
        />
        
        {/* Form actions (buttons) */}
        <StructureFormActions 
          isEditMode={isEditMode}
          submitting={submitting || isDeleting}
          handleCancel={handleCancel}
          onDelete={id !== 'nouveau' ? () => handleDelete(id) : undefined}
          isDeleting={isDeleting}
          validateForm={validateForm} // NOUVEAU: Fonction de validation pour le bouton Sauvegarder
          hasErrors={Object.keys(errors).length > 0} // NOUVEAU: Indicateur d'erreurs
        />
      </Form>
    </div>
  );
};

export default StructureForm;