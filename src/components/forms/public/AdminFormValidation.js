import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormLoadingState from './FormLoadingState';
import FormErrorPanel from './FormErrorPanel';
import styles from './AdminFormValidation.module.css';

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

  return (
    <div className={styles.validationContainer}>
      <h2>Validation des informations soumises</h2>
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Validation du formulaire</h3>
        </div>
        <div className="card-body">
          <p>Cette interface vous permet de valider les informations soumises par le programmateur.</p>
          
          {formData && (
            <div className={styles.formDataPreview}>
              {/* Affichez les données selon votre implémentation spécifique */}
              {/* À personnaliser selon les champs de votre formulaire */}
            </div>
          )}
          
          <div className="mt-4">
            <button className="tc-btn-secondary me-2" onClick={() => navigate('/concerts')}>
              Retour
            </button>
            <button className="tc-btn-primary" onClick={onValidate}>
              Valider les informations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFormValidation;