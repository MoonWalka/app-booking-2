import React from 'react';
import FormPageHeader from './FormPageHeader';
import FormLoadingState from './FormLoadingState';
import FormErrorPanel from './FormErrorPanel';
import ConcertInfoSection from './ConcertInfoSection';
import FormContentWrapper from './FormContentWrapper';
import FormSubmitBlock from './FormSubmitBlock';
import styles from './PublicFormContainer.module.css';

/**
 * Container component for public form pages
 * Handles different form states and wraps child components
 */
const PublicFormContainer = ({ 
  loading,
  error,
  expired,
  completed,
  concert,
  lieu,
  onEditRequest,
  formContent,
  isSubmitting = false,
  legalFooter
}) => {
  // Display appropriate state based on props
  if (loading) {
    return <FormLoadingState />;
  }

  if (error) {
    return (
      <FormErrorPanel 
        type="error"
        message={error}
      />
    );
  }

  if (expired) {
    return (
      <FormErrorPanel 
        type="warning"
        message="Ce lien de formulaire a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien."
      />
    );
  }

  if (completed && !onEditRequest) {
    return (
      <FormErrorPanel 
        type="success"
        message="Vous avez déjà complété ce formulaire. Merci pour votre participation."
      />
    );
  }
  
  // Show completed state with edit option
  if (completed && onEditRequest) {
    return (
      <FormErrorPanel 
        type="success"
        message="Vous avez déjà complété ce formulaire. Merci pour votre participation."
        actionButton={
          <button 
            className="tc-btn-primary mt-3"
            onClick={onEditRequest}
          >
            <i className="bi bi-pencil-square me-2"></i>
            Modifier vos informations
          </button>
        }
      />
    );
  }

  // Main form content
  return (
    <div className={styles.formContainer}>
      <FormPageHeader 
        title="Formulaire programmateur" 
      />
      
      {concert && (
        <ConcertInfoSection 
          concert={concert} 
          lieu={lieu} 
        />
      )}
      
      <FormContentWrapper 
        title="Vos informations" 
        subtitle="Veuillez remplir le formulaire ci-dessous avec vos informations de contact."
      >
        {formContent}
      </FormContentWrapper>
      
      <FormSubmitBlock 
        isSubmitting={isSubmitting}
        footer={
          <p className="text-muted text-center">
            {legalFooter || "Les informations recueillies sur ce formulaire sont enregistrées dans un fichier informatisé à des fins de gestion des concerts. Conformément à la loi « informatique et libertés », vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier."}
          </p>
        }
      />
    </div>
  );
};

export default PublicFormContainer;