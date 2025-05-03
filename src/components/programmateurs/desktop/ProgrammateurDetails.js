import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './ProgrammateurDetails.module.css';

// Import custom hooks
import useProgrammateurDetails from '@/hooks/programmateurs/useProgrammateurDetails';

// Import component modules
import ProgrammateurHeader from './ProgrammateurHeader';
import ProgrammateurGeneralInfo from './ProgrammateurGeneralInfo';
import ProgrammateurAddressSection from './ProgrammateurAddressSection';
import ProgrammateurLegalSection from './ProgrammateurLegalSection';
import ProgrammateurContactSection from './ProgrammateurContactSection';
import ProgrammateurLieuxSection from './ProgrammateurLieuxSection';
import ProgrammateurStructuresSection from './ProgrammateurStructuresSection';
import DeleteProgrammateurModal from './DeleteProgrammateurModal';

// Import common components
import Spinner from '@/components/common/Spinner';

const ProgrammateurDetails = () => {
  const { id } = useParams();
  const { 
    programmateur, 
    loading, 
    error, 
    isEditing, 
    setIsEditing,
    formData,
    handleChange,
    handleSubmit,
    handleDelete,
    isSubmitting
  } = useProgrammateurDetails(id);

  if (loading) {
    return <Spinner message="Chargement des données..." contentOnly={true} />;
  }

  if (error) {
    return <div className={styles.alertWrapper}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <ProgrammateurHeader
        programmateur={programmateur}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
      
      {isEditing ? (
        // Edit Mode
        <form onSubmit={handleSubmit}>
          <ProgrammateurContactSection
            formData={formData}
            handleChange={handleChange}
            isEditing={true}
          />
          
          <ProgrammateurLegalSection
            formData={formData}
            handleChange={handleChange}
            isEditing={true}
          />
          
          <ProgrammateurLieuxSection
            programmateur={programmateur}
            isEditing={true}
          />
          
          <div className={styles.formActions}>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              <i className="bi bi-x-circle me-2"></i>
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        // View Mode
        <>
          <ProgrammateurContactSection
            programmateur={programmateur}
            isEditing={false}
          />
          
          <ProgrammateurLegalSection
            programmateur={programmateur}
            isEditing={false}
          />
          
          <ProgrammateurStructuresSection
            programmateur={programmateur}
          />
          
          <ProgrammateurLieuxSection
            programmateur={programmateur}
            isEditing={false}
          />
        </>
      )}
      
      <DeleteProgrammateurModal
        programmateur={programmateur}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default ProgrammateurDetails;
