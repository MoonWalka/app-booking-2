import React, { useState } from 'react';
import { useFormTokenValidation } from '@/hooks/forms/useFormTokenValidation';
import preContratService from '@/services/preContratService';
import FormLoadingState from './FormLoadingState';
import FormErrorPanel from './FormErrorPanel';
import PreContratFormPublic from './PreContratFormPublic';
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
    organizationData,
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

  // Debug des données avant de les passer au formulaire
  console.log('[PreContratFormContainer] Données disponibles:', {
    existingSubmission,
    formLinkData,
    'existingSubmission?.adresse': existingSubmission?.adresse,
    'formLinkData?.adresse': formLinkData?.adresse,
    'existingData passé': existingSubmission || formLinkData
  });

  return (
    <div className={styles.container}>
      <PreContratFormPublic
        concertData={concertData}
        organizationData={organizationData}
        existingData={existingSubmission || formLinkData}
        onSubmit={async (formData, action) => {
          try {
            // Mapper les données du formulaire public vers le format attendu
            const mappedData = {
              // Organisateur
              raisonSociale: formData.raisonSociale,
              adresse: formData.adresseOrga,
              suiteAdresse: formData.suiteAdresseOrga,
              cp: formData.codePostalOrga,
              ville: formData.villeOrga,
              pays: formData.paysOrga,
              tel: formData.telOrga,
              fax: formData.faxOrga,
              email: formData.emailOrga,
              site: formData.siteWebOrga,
              siret: formData.siret,
              codeActivite: formData.codeAPE,
              numeroTvaIntracommunautaire: formData.tvaIntracom,
              numeroLicence: formData.licences,
              nomSignataire: formData.signataire,
              qualiteSignataire: formData.qualiteSignataire,
              
              // Négociation
              contratPropose: formData.contratPropose,
              montantHT: formData.cachetMinimum,
              moyenPaiement: formData.modePaiement,
              devise: formData.devise,
              acompte: formData.acompte,
              frais: formData.frais,
              precisionsNegoc: formData.precisionNego,
              
              // Concert
              debut: concertData?.date || '',
              horaireDebut: formData.heureDebut,
              horaireFin: formData.heureFin,
              payant: formData.payant === 'payant',
              nbRepresentations: formData.nombreRepresentations,
              salle: formData.salle,
              capacite: formData.capacite,
              nbAdmins: formData.nombreAdmis,
              invitations: formData.invitationsExos,
              festival: formData.festivalEvenement,
              
              // Régie
              responsableRegie: formData.nomRegie,
              emailProRegie: formData.emailRegie,
              telProRegie: formData.telRegie,
              mobileProRegie: formData.mobileRegie,
              horaires: formData.horairesRegie,
              
              // Promo
              responsablePromo: formData.nomPromo,
              emailProPromo: formData.emailPromo,
              telProPromo: formData.telPromo,
              mobileProPromo: formData.mobilePromo,
              demandePromo: formData.demandePromo,
              
              // Autres
              prixPlaces: formData.prixPlaces,
              divers: formData.divers,
              
              // Métadonnées
              publicFormCompleted: true,
              publicFormCompletedAt: new Date(),
              publicFormEmail: formData.emailOrga
            };

            // Sauvegarder ou valider selon l'action
            if (action === 'send') {
              // Valider et marquer comme complété
              await preContratService.validatePreContrat(
                formLinkData.id,
                mappedData
              );
              setSubmissionStatus('completed');
            } else {
              // Sauvegarder seulement (brouillon)
              await preContratService.savePublicFormData(
                formLinkData.id,
                mappedData
              );
              alert('Formulaire enregistré avec succès');
            }
          } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            alert('Une erreur est survenue lors de l\'enregistrement');
          }
        }}
      />
    </div>
  );
}

export default PreContratFormContainer;