#!/bin/bash

# Script to generate modular components for ProgrammateurDetails

# Set the base paths
COMPONENTS_PATH="./src/components/programmateurs/desktop"
HOOKS_PATH="./src/hooks/programmateurs"

# Create directories if they don't exist
mkdir -p $COMPONENTS_PATH
mkdir -p $HOOKS_PATH

# List of components to create
declare -a components=(
  "ProgrammateurHeader"
  "ProgrammateurGeneralInfo"
  "ProgrammateurAddressSection"
  "ProgrammateurLegalSection"
  "ProgrammateurContactSection"
  "ProgrammateurLieuxSection"
  "DeleteProgrammateurModal"
)

# Create component files
for component in "${components[@]}"; do
  echo "Creating $component..."
  
  # Create JS file
  cat > "$COMPONENTS_PATH/$component.js" << EOL
import React from 'react';
import styles from './$component.module.css';

const $component = (props) => {
  return <div className={styles.container}>$component</div>;
};

export default $component;
EOL

  # Create CSS Module
  cat > "$COMPONENTS_PATH/$component.module.css" << EOL
.container {
  /* Base styles for $component */
  margin-bottom: 1rem;
}
EOL

  echo "$component files created successfully."
done

# List of hooks to create
declare -a hooks=(
  "useProgrammateurDetails"
  "useLieuSearch"
  "useAdresseValidation"
)

# Create hook files
for hook in "${hooks[@]}"; do
  echo "Creating $hook..."
  
  # Create JS file
  cat > "$HOOKS_PATH/$hook.js" << EOL
import { useState, useEffect } from 'react';
import { db } from '@/firebaseInit';
import { doc, getDoc } from 'firebase/firestore';

const $hook = (id) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Hook implementation will go here
    console.log('$hook initialized');
  }, [id]);
  
  return {
    loading,
    error,
    data
  };
};

export default $hook;
EOL

  echo "$hook created successfully."
done

# Create a new main ProgrammateurDetails file that uses the modular components
cat > "$COMPONENTS_PATH/ProgrammateurDetails.js.new" << EOL
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
EOL

echo "New ProgrammateurDetails.js.new file created."
echo "Make sure to implement each component and hook with the corresponding logic from the original ProgrammateurDetails.js file."
echo "You can start by migrating the functionality from ProgrammateurDetails.js to the modular components."
echo "After implementing the components, review and rename ProgrammateurDetails.js.new to replace ProgrammateurDetails.js"

echo "Script completed successfully!"