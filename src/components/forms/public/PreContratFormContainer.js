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
        actionButton={
          <button 
            onClick={() => setSubmissionStatus('editing')}
            style={{
              padding: '10px 20px',
              border: '1px solid #28a745',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: '#28a745',
              cursor: 'pointer'
            }}
          >
            Modifier ma réponse
          </button>
        }
      />
    );
  }

  // Afficher le message de succès après soumission
  if (submissionStatus === 'completed') {
    return (
      <FormErrorPanel
        type="success"
        title="Pré-contrat envoyé avec succès"
        message="Votre pré-contrat a été envoyé avec succès. Vous recevrez une confirmation par email à l'adresse indiquée."
        actionButton={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              onClick={() => setSubmissionStatus('editing')}
              style={{
                padding: '10px 20px',
                border: '1px solid #28a745',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: '#28a745',
                cursor: 'pointer'
              }}
            >
              Modifier ma réponse
            </button>
            <button 
              onClick={() => window.close()}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#28a745',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Fermer cette fenêtre
            </button>
          </div>
        }
      />
    );
  }

  // Debug des données avant de les passer au formulaire
  console.log('[WORKFLOW_TEST] 5. Passage des données au formulaire public - PreContratFormContainer');
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
            console.log('[DEBUG PreContratFormContainer] Données reçues du formulaire:', {
              codePostalOrga: formData.codePostalOrga,
              adresseOrga: formData.adresseOrga,
              villeOrga: formData.villeOrga
            });
            
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

            console.log('[DEBUG PreContratFormContainer] Données mappées à sauvegarder:', {
              cp: mappedData.cp,
              adresse: mappedData.adresse,
              ville: mappedData.ville
            });

            // Sauvegarder les données dans tous les cas
            // La validation réelle se fait dans ConfirmationPage
            await preContratService.savePublicFormData(
              formLinkData.id,
              mappedData
            );
            
            if (action === 'send') {
              // Marquer comme envoyé (mais pas validé)
              setSubmissionStatus('completed');
            } else {
              // Sauvegarder comme brouillon
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