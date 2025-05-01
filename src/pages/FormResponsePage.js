import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import ProgrammateurForm from '@/components/programmateurs/ProgrammateurForm.js';

// Import modular components
import PublicFormLayout from '@/components/forms/public/PublicFormLayout';
import PublicFormContainer from '@/components/forms/public/PublicFormContainer';
import AdminFormValidation from '@/components/forms/public/AdminFormValidation';

// Import custom hooks
import useFormTokenValidation from '@/hooks/forms/useFormTokenValidation';
import useAdminFormValidation from '@/hooks/forms/useAdminFormValidation';

/**
 * FormResponsePage handles both public form access with token and admin validation
 */
const FormResponsePage = () => {
  const { concertId, token, id } = useParams();
  const navigate = useNavigate();
  
  // Déterminer si nous sommes en mode public ou en mode admin
  const isPublicForm = !!concertId && !!token;
  const isAdminValidation = !!id;

  // Call hooks unconditionally but with null/empty values when not needed
  const publicForm = useFormTokenValidation(
    isPublicForm ? concertId : null, 
    isPublicForm ? token : null
  );

  const adminForm = useAdminFormValidation(
    isAdminValidation ? id : null
  );

  // Extract values from the active form state
  const {
    loading = false,
    error = null,
    expired = false,
    completed = false,
    formData = null,
    formLinkId = null,
    concert = null,
    lieu = null,
    toggleCompleted = () => {},
  } = isPublicForm ? publicForm : adminForm;

  // Handle form validation in admin mode
  const handleValidateSubmission = async () => {
    if (!isAdminValidation || !formData) return;

    try {
      // Update the submission status
      await updateDoc(doc(db, 'formSubmissions', id), {
        validated: true,
        validatedAt: new Date(),
      });
      
      // Navigate back to concerts list with success message
      navigate('/concerts', { 
        state: { message: 'Les informations ont été validées avec succès.' } 
      });
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      // Handle error appropriately in your UI
    }
  };

  // Render public form
  const renderPublicForm = () => (
    <PublicFormContainer
      loading={loading}
      error={error}
      expired={expired}
      completed={completed}
      concert={concert}
      lieu={lieu}
      onEditRequest={() => toggleCompleted(false)}
      isSubmitting={false}
      formContent={
        <ProgrammateurForm 
          token={token}
          concertId={concertId}
          formLinkId={formLinkId}
          initialLieuData={lieu}
          onSubmitSuccess={() => toggleCompleted(true)}
        />
      }
    />
  );

  // Render admin validation interface
  const renderAdminValidation = () => (
    <AdminFormValidation
      loading={loading}
      error={error}
      formData={formData}
      concert={concert}
      lieu={lieu}
      onValidate={handleValidateSubmission}
    />
  );

  // Render based on mode
  if (isPublicForm) {
    return <PublicFormLayout>{renderPublicForm()}</PublicFormLayout>;
  }
  
  // For admin validation, return without the public layout
  return renderAdminValidation();
};

export default FormResponsePage;
