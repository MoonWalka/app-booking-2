import React from 'react';
import styles from './StructureFormHeader.module.css';

/**
 * Header component for structure form
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Structure ID if editing
 * @param {Object} props.formData - Form data
 * @param {Function} props.navigate - Navigation function
 * @returns {JSX.Element} - Rendered component
 */
const StructureFormHeader = ({ id, formData, navigate }) => {
  const isEditMode = !!id;
  const title = isEditMode ? `Modifier "${formData.nom}"` : 'Nouvelle structure';

  return (
    <div className={styles.formHeader}>
      <h2>{title}</h2>
      <button
        className={styles.backButton}
        onClick={() => navigate(isEditMode ? `/structures/${id}` : '/structures')}
      >
        <i className="bi bi-arrow-left"></i>
        Retour
      </button>
    </div>
  );
};

export default StructureFormHeader;