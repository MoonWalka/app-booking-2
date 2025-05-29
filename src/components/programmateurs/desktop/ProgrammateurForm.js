import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '@/services/firebase-service';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// Import des composants UI standardisés
import LoadingSpinner from '@components/ui/LoadingSpinner';
import Button from '@components/ui/Button';
import ErrorMessage from '@components/ui/ErrorMessage';

// MIGRATION: Utilisation du hook optimisé
import { useProgrammateurForm } from '@/hooks/programmateurs';
import { useCompanySearch } from '@/hooks/common';
import { useAddressSearch } from '@/hooks/common';
import useDeleteProgrammateur from '@/hooks/programmateurs/useDeleteProgrammateur';

// Import section components
import { ProgrammateurHeader } from './sections/ProgrammateurHeader';
import ProgrammateurContactSection from './sections/ProgrammateurContactSection';
import ProgrammateurStructureSection from './sections/ProgrammateurStructureSection';
import ProgrammateurLieuxSectionWrapper from './sections/ProgrammateurLieuxSectionWrapper';
import ProgrammateurConcertsSectionWrapper from './sections/ProgrammateurConcertsSectionWrapper';
import DeleteProgrammateurModal from './sections/DeleteProgrammateurModal';

// Import des styles CSS Module
import styles from './ProgrammateurForm.module.css';

/**
 * ProgrammateurForm component - displays a programmer's details in edit mode
 * Peut fonctionner en mode normal (édition) ou en mode public (soumission de formulaire)
 */
const ProgrammateurForm = ({ 
  // Props pour le mode public
  token,
  concertId,
  formLinkId,
  initialLieuData,
  onSubmitSuccess
}) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Détecter le mode public vs normal
  const isPublicMode = !!(token && concertId);
  
  // En mode public, on n'utilise pas l'ID de l'URL
  const programmateurId = isPublicMode ? null : id;
  
  // Détecter le mode "nouveau" via l'URL (seulement en mode normal)
  const isNewFromUrl = !isPublicMode && location.pathname.endsWith('/nouveau');

  // MIGRATION: Utilisation du hook optimisé
  const{ 
    programmateur, 
    structure,
    loading, 
    error,
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    isSubmitting,
    formatValue,
    handleStructureChange,
    handleCancel: hookHandleCancel
  } = useProgrammateurForm(programmateurId);

  // Hooks pour la recherche d'entreprise et d'adresses
  const companySearch = useCompanySearch({
    onCompanySelect: (company) => {
      handleStructureChange(company);
    }
  });

  const addressSearch = useAddressSearch(
    formData, 
    setFormData, 
    { nom: '', adresse: '', codePostal: '', ville: '', capacite: '', latitude: null, longitude: null }, 
    () => {}
  );
  
  // Hook de suppression optimisé (seulement en mode normal)
  const deleteHook = useDeleteProgrammateur(() => navigate('/programmateurs'));
  const {
    isDeleting,
    showDeleteModal,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete
  } = isPublicMode ? {} : deleteHook;

  // Information sur les concerts associés (seulement en mode normal)
  const hasAssociatedConcerts = !isPublicMode && (programmateur?.concertsAssocies?.length > 0 || false);

  // Handlers avec notifications
  const handleSaveWithNotification = async (e) => {
    try {
      if (isPublicMode) {
        // Mode public : créer une soumission de formulaire
        await handlePublicSubmit(e);
        toast.success('Formulaire envoyé avec succès !', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
        });
        // Appeler le callback de succès
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        // Mode normal : enregistrer le programmateur
        await handleSubmit(e);
        toast.success('Programmateur enregistré avec succès !', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      const message = isPublicMode ? 'Erreur lors de l\'envoi du formulaire' : 'Erreur lors de l\'enregistrement';
      toast.error(message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };

  // Fonction pour gérer la soumission en mode public
  const handlePublicSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Soumission publique:', { token, concertId, formLinkId, formData });
      
      // Créer la soumission de formulaire
      const submissionData = {
        // Métadonnées
        concertId,
        formLinkId,
        token,
        submittedAt: serverTimestamp(),
        status: 'pending', // pending, validated, rejected
        
        // Données du programmateur
        programmateurData: {
          contact: formData.contact || {},
          structure: formData.structure || {},
          structureId: formData.structureId || null
        },
        
        // Données du lieu si modifiées
        lieuData: initialLieuData || {},
        
        // Données brutes complètes pour référence
        rawData: formData
      };
      
      // Créer le document dans formSubmissions
      const submissionRef = await addDoc(collection(db, 'formSubmissions'), submissionData);
      
      console.log('Soumission créée avec ID:', submissionRef.id);
      
      // Marquer le lien de formulaire comme complété
      if (formLinkId) {
        await updateDoc(doc(db, 'formLinks', formLinkId), {
          completed: true,
          completedAt: serverTimestamp(),
          submissionId: submissionRef.id
        });
      }
      
      // Optionnel : mettre à jour le concert avec la référence de soumission
      await updateDoc(doc(db, 'concerts', concertId), {
        lastFormSubmissionId: submissionRef.id,
        hasFormSubmission: true,
        updatedAt: serverTimestamp()
      });
      
      console.log('Formulaire soumis avec succès');
      return submissionRef.id;
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      throw error;
    }
  };

  const handleCancelWithNotification = () => {
    if (isPublicMode) {
      // En mode public, on ne fait rien ou on peut rappeler onSubmitSuccess avec un flag d'annulation
      toast.info('Formulaire annulé', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
    } else {
      // Mode normal
      toast.info('Édition annulée', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
      hookHandleCancel();
    }
  };

  // En mode public, on n'affiche pas les erreurs et chargements de la même façon
  // If loading, show a spinner
  if (loading && !isPublicMode) {
    return (
      <div className={styles.spinnerContainer}>
        <LoadingSpinner variant="primary" message="Chargement du programmateur..." />
      </div>
    );
  }

  // If error, show an error message (seulement en mode normal)
  if (error && !isPublicMode) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage variant="danger" icon="exclamation-triangle-fill">
          {error.message || error}
        </ErrorMessage>
        <Button 
          variant="primary" 
          onClick={() => navigate('/programmateurs')}
          iconStart="arrow-left"
        >
          Retour à la liste des programmateurs
        </Button>
      </div>
    );
  }

  // If no programmateur and not creating new one (seulement en mode normal)
  if (!programmateur && !isNewFromUrl && !loading && !isPublicMode) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage variant="warning" icon="exclamation-triangle-fill">
          Ce programmateur n'existe pas ou n'a pas pu être chargé.
        </ErrorMessage>
        <Button 
          variant="primary" 
          onClick={() => navigate('/programmateurs')}
          iconStart="arrow-left"
        >
          Retour à la liste des programmateurs
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveWithNotification}>
      <div className={styles.formContainer}>
        {/* Header with title and action buttons - seulement en mode normal */}
        {!isPublicMode && (
          <ProgrammateurHeader 
            programmateur={programmateur}
            isEditMode={true}
            isNewFromUrl={isNewFromUrl}
            onEdit={() => {}}
            onSave={handleSaveWithNotification}
            onCancel={handleCancelWithNotification}
            onDelete={() => handleDeleteClick(programmateur)}
            isSubmitting={isSubmitting}
            canSave={true}
            navigateToList={() => navigate('/programmateurs')}
          />
        )}

        {/* Sections empilées verticalement en mode édition */}
        <div className={styles.sectionsStack}>
          <ProgrammateurContactSection 
            programmateur={programmateur}
            isEditMode={true}
            formData={formData}
            onChange={handleChange}
            errors={{}}
          />
          
          <ProgrammateurStructureSection
            programmateur={programmateur}
            structure={structure}
            isEditMode={true}
            formData={formData}
            onChange={handleChange}
            onStructureChange={handleStructureChange}
            companySearch={companySearch}
            addressSearch={addressSearch}
            formatValue={formatValue}
            errors={{}}
          />
          
          {/* Sections lieux et concerts seulement en mode normal */}
          {!isPublicMode && (
            <>
              <ProgrammateurLieuxSectionWrapper
                programmateur={programmateur}
                isEditMode={true}
                formData={formData}
                onChange={handleChange}
              />
              
              <ProgrammateurConcertsSectionWrapper
                programmateur={programmateur}
                isEditMode={true}
                concertsAssocies={programmateur?.concertsAssocies || []}
              />
            </>
          )}
          
          {/* En mode public, ajouter un bouton de soumission */}
          {isPublicMode && (
            <div className="mt-4 text-center">
              <Button 
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                iconStart={isSubmitting ? "spinner" : "check"}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le formulaire'}
              </Button>
            </div>
          )}
        </div>

        {/* Delete confirmation modal - seulement en mode normal */}
        {!isPublicMode && (
          <DeleteProgrammateurModal
            show={showDeleteModal}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            programmateur={programmateur}
            isDeleting={isDeleting}
            hasAssociatedConcerts={hasAssociatedConcerts}
          />
        )}
      </div>
    </form>
  );
};

export default ProgrammateurForm;
