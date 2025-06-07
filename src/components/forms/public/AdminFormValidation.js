import React from 'react';
import { useNavigate } from 'react-router-dom';
import FlexContainer from '@/components/ui/FlexContainer';
import FormLoadingState from './FormLoadingState';
import FormErrorPanel from './FormErrorPanel';
import styles from './AdminFormValidation.module.css';
import Card from '@/components/ui/Card';

/**
 * Component for admin validation of submitted forms
 */
const AdminFormValidation = ({ 
  loading, 
  error, 
  formData, 
  concert, 
  lieu, 
  onValidate 
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <FormLoadingState message="Chargement des données..." />;
  }

  if (error) {
    return (
      <FormErrorPanel 
        type="error"
        message={error}
        actionButton={
          <button className="tc-btn-primary" onClick={() => navigate('/concerts')}>
            Retour à la liste des concerts
          </button>
        }
      />
    );
  }

  const footerContent = (
    <FlexContainer justify="flex-end">
      <button className="tc-btn-secondary me-2" onClick={() => navigate('/concerts')}>
        Retour
      </button>
      <button className="tc-btn-primary" onClick={onValidate}>
        Valider les informations
      </button>
    </FlexContainer>
  );

  return (
    <div className={styles.validationContainer}>
      <h2>Validation des informations soumises</h2>
      
      <Card
        title="Validation du formulaire"
        variant="primary"
        className="mb-4"
        footerContent={footerContent}
      >
        <p>Cette interface vous permet de valider les informations soumises par le contact.</p>
        
        {formData && (
          <div className={styles.formDataPreview}>
            {/* Affichez les données selon votre implémentation spécifique */}
            {/* À personnaliser selon les champs de votre formulaire */}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminFormValidation;