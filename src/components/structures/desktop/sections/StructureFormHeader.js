import React from 'react';
import FormHeader from '@/components/ui/FormHeader';

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
    <FormHeader
      title={title}
      icon={<i className="bi bi-building"></i>}
      subtitle={
        <span style={{ cursor: 'pointer' }} onClick={() => navigate(isEditMode ? `/structures/${id}` : '/structures')}>
          ← Retour aux structures
        </span>
      }
      actions={[]}
    />
  );
};

export default StructureFormHeader;