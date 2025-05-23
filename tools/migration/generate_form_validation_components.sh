#!/bin/bash

# Script to generate the file structure for modularizing FormValidationInterface
# Created: May 1, 2025

echo "🚀 Generating form validation components..."

# Base directories
COMPONENT_DIR="/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/components/forms/validation"
HOOKS_DIR="/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/hooks/forms"

# Create directories if they don't exist
mkdir -p "$COMPONENT_DIR"
mkdir -p "$HOOKS_DIR"

# Function to create a component file with basic structure
create_component() {
  local fileName="$1"
  local componentName="$2"
  
  cat > "$fileName" << EOF
import React from 'react';
import styles from './${componentName}.module.css';

const ${componentName} = (props) => {
  return (
    <div className={styles.container}>
      ${componentName}
    </div>
  );
};

export default ${componentName};
EOF

  echo "✅ Created component: $fileName"
}

# Function to create a CSS module file
create_css_module() {
  local fileName="$1"
  local componentName="$2"
  
  cat > "$fileName" << EOF
/* ${componentName} Styles */
.container {
  /* Base container styles */
}
EOF

  echo "✅ Created CSS module: $fileName"
}

# Function to create a hook file
create_hook() {
  local fileName="$1"
  local hookName="$2"
  
  cat > "$fileName" << EOF
import { useState, useEffect } from 'react';

const ${hookName} = () => {
  // Hook implementation
  
  return {
    // Return values and functions
  };
};

export default ${hookName};
EOF

  echo "✅ Created hook: $fileName"
}

# Step 1: Create Components
echo "📂 Creating components..."

# FormHeader
create_component "$COMPONENT_DIR/FormHeader.js" "FormHeader"
create_css_module "$COMPONENT_DIR/FormHeader.module.css" "FormHeader"

# ValidationSummary
create_component "$COMPONENT_DIR/ValidationSummary.js" "ValidationSummary"
create_css_module "$COMPONENT_DIR/ValidationSummary.module.css" "ValidationSummary"

# ValidationSection
create_component "$COMPONENT_DIR/ValidationSection.js" "ValidationSection"
create_css_module "$COMPONENT_DIR/ValidationSection.module.css" "ValidationSection"

# FieldValidationRow
create_component "$COMPONENT_DIR/FieldValidationRow.js" "FieldValidationRow"
create_css_module "$COMPONENT_DIR/FieldValidationRow.module.css" "FieldValidationRow"

# ValidationActionBar
create_component "$COMPONENT_DIR/ValidationActionBar.js" "ValidationActionBar"
create_css_module "$COMPONENT_DIR/ValidationActionBar.module.css" "ValidationActionBar"

# ValidationModal
create_component "$COMPONENT_DIR/ValidationModal.js" "ValidationModal"
create_css_module "$COMPONENT_DIR/ValidationModal.module.css" "ValidationModal"

# Step 2: Create Hooks
echo "🪝 Creating hooks..."

# useFormValidationData
create_hook "$HOOKS_DIR/useFormValidationData.js" "useFormValidationData"

# useFieldActions
create_hook "$HOOKS_DIR/useFieldActions.js" "useFieldActions"

# useValidationBatchActions
create_hook "$HOOKS_DIR/useValidationBatchActions.js" "useValidationBatchActions"

# Create main orchestrator file
echo "🎭 Creating main orchestrator component..."

cat > "$COMPONENT_DIR/FormValidationInterfaceNew.js" << EOF
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormHeader from './FormHeader';
import ValidationSummary from './ValidationSummary';
import ValidationSection from './ValidationSection';
import ValidationActionBar from './ValidationActionBar';
import ValidationModal from './ValidationModal';
import useFormValidationData from '../../hooks/forms/useFormValidationData';
import useFieldActions from '../../hooks/forms/useFieldActions';
import useValidationBatchActions from '../../hooks/forms/useValidationBatchActions';

const FormValidationInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    formData,
    concert,
    loading,
    error,
    validated,
    validatedFields,
    programmateur,
    lieu
  } = useFormValidationData(id);
  
  const { handleValidateField, copyFormValueToFinal } = useFieldActions();
  
  const { validateForm, validationInProgress } = useValidationBatchActions({
    formId: formData?.id,
    concertId: id,
    validatedFields
  });
  
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

  if (error) {
    return (
      <div className="error-container text-center my-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate(\`/concerts/\${id}\`)}
        >
          Retour à la fiche concert
        </button>
      </div>
    );
  }

  if (!formData || !concert) {
    return (
      <div className="not-found-container text-center my-5">
        <div className="alert alert-warning">
          <i className="bi bi-question-circle-fill me-2"></i>
          Formulaire non trouvé.
        </div>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate(\`/concerts/\${id}\`)}
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
        isValidated={isAlreadyValidated}
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
        isValidated={isAlreadyValidated}
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
        isValidated={isAlreadyValidated}
        structureFieldsMapping={true}
      />
      
      {/* Validation buttons */}
      {!isAlreadyValidated && !validated && (
        <ValidationActionBar
          onValidate={validateForm}
          isValidating={validationInProgress}
        />
      )}
    </div>
  );
};

export default FormValidationInterface;
EOF

echo "✨ All files generated successfully!"
echo "🔄 Next steps:"
echo "1. Review and populate the generated files"
echo "2. Implement the logic in each component and hook"
echo "3. Make sure to handle props properly between components"
echo "4. Update imports in the main app to point to the new refactored component"