import React from 'react';
import FormHeader from '@/components/ui/FormHeader';
import Alert from '@/components/ui/Alert';

/**
 * Header component for Enterprise settings page
 * @param {Object} props - Component props
 * @param {string} props.success - Success message to display
 */
const EntrepriseHeader = ({ success }) => {
  // Préparer les actions pour le header
  const actions = success ? [
    <Alert key="success" variant="success">
      {success}
    </Alert>
  ] : [];

  return (
    <FormHeader
      title="Company Information"
      subtitle="This information will appear in the headers and footers of generated contracts."
      icon={<i className="bi bi-building"></i>}
      actions={actions}
      roundedTop={true}
    />
  );
};

export default EntrepriseHeader;