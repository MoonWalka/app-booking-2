import React from 'react';
import { useParams } from 'react-router-dom';
import PreContratFormContainer from '@/components/forms/public/PreContratFormContainer';
import PublicFormLayout from '@/components/forms/public/PublicFormLayout';

/**
 * Page publique pour le formulaire de pré-contrat
 * Route: /pre-contrat/:concertId/:token
 */
function PreContratFormResponsePage() {
  const { concertId, token } = useParams();

  return (
    <PublicFormLayout>
      <PreContratFormContainer concertId={concertId} token={token} />
    </PublicFormLayout>
  );
}

export default PreContratFormResponsePage;