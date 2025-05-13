import React from 'react';
import { useParams } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap';
// MIGRATION: Utilisation du hook optimisé au lieu de l'ancien hook
import { useStructureFormOptimized, useStructureValidation } from '@/hooks/structures';
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
  } = useStructureFormOptimized(id);

  // Use validation hook
  const { errors } = useStructureValidation(formData);

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
        {/* Identity information */}
        <StructureIdentitySection 
          formData={formData}
          handleChange={handleChange} 
        />
        
        {/* Address and contact information */}
        <StructureAddressSection 
          formData={formData}
          handleChange={handleChange} 
        />
        
        {/* Billing information */}
        <StructureBillingSection
          formData={formData}
          handleChange={handleChange}
        />
        
        {/* Primary contact person */}
        <StructureContactSection 
          contact={formData.contact}
          handleChange={handleChange} 
        />
        
        {/* Notes */}
        <StructureNotesSection 
          notes={formData.notes}
          handleChange={handleChange} 
        />
        
        {/* Form actions (buttons) */}
        <StructureFormActions 
          isEditMode={isEditMode}
          submitting={submitting}
          handleCancel={handleCancel}
        />
      </Form>
    </div>
  );
};

export default StructureForm;