import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import ProgrammateurLegalSectionWrapper from './sections/ProgrammateurLegalSectionWrapper';
import ProgrammateurStructureSection from './sections/ProgrammateurStructureSection';
import ProgrammateurLieuxSectionWrapper from './sections/ProgrammateurLieuxSectionWrapper';
import ProgrammateurConcertsSectionWrapper from './sections/ProgrammateurConcertsSectionWrapper';
import DeleteProgrammateurModal from './sections/DeleteProgrammateurModal';

// Import des styles CSS Module
import styles from './ProgrammateurForm.module.css';

/**
 * ProgrammateurForm component - displays a programmer's details in edit mode
 * Utilise la même structure que LieuView mais en mode édition
 */
const ProgrammateurForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Détecter le mode "nouveau" via l'URL
  const isNewFromUrl = location.pathname.endsWith('/nouveau');

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
  } = useProgrammateurForm(id);

  // Hooks pour la recherche d'entreprise et d'adresses
  const companySearch = useCompanySearch((company) => {
    handleStructureChange(company);
  });

  const addressSearch = useAddressSearch(
    formData, 
    setFormData, 
    { nom: '', adresse: '', codePostal: '', ville: '', capacite: '', latitude: null, longitude: null }, 
    () => {}
  );
  
  // Hook de suppression optimisé
  const {
    isDeleting,
    showDeleteModal,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete
  } = useDeleteProgrammateur(() => navigate('/programmateurs'));

  // Information sur les concerts associés
  const hasAssociatedConcerts = programmateur?.concertsAssocies?.length > 0 || false;

  // Handlers avec notifications
  const handleSaveWithNotification = async (e) => {
    try {
      await handleSubmit(e);
      toast.success('Programmateur enregistré avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };

  const handleCancelWithNotification = () => {
    toast.info('Édition annulée', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: true,
    });
    hookHandleCancel();
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <LoadingSpinner variant="primary" message="Chargement du programmateur..." />
      </div>
    );
  }

  // If error, show an error message
  if (error) {
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

  // If no programmateur and not creating new one
  if (!programmateur && !isNewFromUrl && !loading) {
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
        {/* Header with title and action buttons */}
        <ProgrammateurHeader 
          programmateur={programmateur}
          isEditMode={true}
          isNewFromUrl={isNewFromUrl}
          onEdit={() => {}}
          onSave={handleSaveWithNotification}
          onCancel={handleCancelWithNotification}
          onDelete={handleDeleteClick}
          isSubmitting={isSubmitting}
          canSave={true}
          navigateToList={() => navigate('/programmateurs')}
        />

        {/* Sections empilées verticalement en mode édition */}
        <div className={styles.sectionsStack}>
          <ProgrammateurContactSection 
            programmateur={programmateur}
            isEditMode={true}
            formData={formData}
            onChange={handleChange}
            errors={{}}
          />
          
          <ProgrammateurLegalSectionWrapper
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
        </div>

        {/* Delete confirmation modal */}
        <DeleteProgrammateurModal
          show={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          programmateur={programmateur}
          isDeleting={isDeleting}
          hasAssociatedConcerts={hasAssociatedConcerts}
        />
      </div>
    </form>
  );
};

export default ProgrammateurForm;
