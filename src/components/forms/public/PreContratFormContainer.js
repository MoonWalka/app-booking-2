import React, { useState } from 'react';
import { useFormTokenValidation } from '@/hooks/forms/useFormTokenValidation';
import FormLoadingState from './FormLoadingState';
import FormErrorPanel from './FormErrorPanel';
import PreContratForm from './PreContratForm';
import styles from './PreContratFormContainer.module.css';

/**
 * Container pour le formulaire de pré-contrat public
 * Gère la validation du token et les états du formulaire
 */
function PreContratFormContainer({ concertId, token }) {
  const {
    isLoading,
    isValid,
    isExpired,
    isCompleted,
    concertData,
    formLinkData,
    existingSubmission,
    error
  } = useFormTokenValidation(concertId, token);

  const [submissionStatus, setSubmissionStatus] = useState(null);

  // Gestion des états d'affichage
  if (isLoading) {
    return <FormLoadingState message="Vérification du lien de pré-contrat..." />;
  }

  if (error) {
    return (
      <FormErrorPanel
        type="error"
        title="Erreur de chargement"
        message="Une erreur s'est produite lors du chargement du formulaire de pré-contrat."
        details={error}
      />
    );
  }

  if (!isValid) {
    return (
      <FormErrorPanel
        type="error"
        title="Lien invalide"
        message="Ce lien de pré-contrat n'est pas valide ou a été désactivé."
      />
    );
  }

  if (isExpired) {
    return (
      <FormErrorPanel
        type="warning"
        title="Lien expiré"
        message="Ce lien de pré-contrat a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien."
      />
    );
  }

  if (isCompleted && submissionStatus !== 'editing') {
    return (
      <FormErrorPanel
        type="success"
        title="Pré-contrat déjà soumis"
        message="Vous avez déjà soumis ce pré-contrat. Merci pour votre participation."
        actionButton={{
          label: "Modifier ma réponse",
          onClick: () => setSubmissionStatus('editing'),
          variant: "outline-primary"
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      <PreContratForm
        concertId={concertId}
        token={token}
        concertData={concertData}
        formLinkData={formLinkData}
        existingSubmission={existingSubmission}
        onSubmissionComplete={(status) => setSubmissionStatus(status)}
      />
    </div>
  );
}

export default PreContratFormContainer;