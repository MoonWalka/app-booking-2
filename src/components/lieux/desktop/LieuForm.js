import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/ui/Alert';
import FlexContainer from '@/components/ui/FlexContainer';
import styles from './LieuForm.module.css';

// MIGRATION: Utilisation du hook optimisé au lieu du hook complet
import { useLieuForm } from '@/hooks/lieux';
import useLieuDelete from '@/hooks/lieux/useLieuDelete';

// Import sections
import LieuFormHeader from './sections/LieuFormHeader';
import LieuGeneralInfo from './sections/LieuGeneralInfo';
import LieuAddressSection from './sections/LieuAddressSection';
import LieuOrganizerSection from './sections/LieuOrganizerSection';
import LieuContactSection from './sections/LieuContactSection';
import LieuInfoSection from './sections/LieuInfoSection';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const LieuForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // État local pour gérer la modal de suppression
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  
  // MIGRATION: Utilisation du hook optimisé
  const {
    lieu,
    loading,
    error,
    handleChange,
    handleSubmit,
    addressSearch,
    programmateurSearch,
    submitting
  } = useLieuForm(id);

  // Ajout du hook de suppression optimisé
  const {
    isDeleting,
    handleDeleteLieu
  } = useLieuDelete(() => navigate('/lieux'));

  // Fonction pour ouvrir la modal
  const handleOpenDeleteModal = React.useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  // Fonction pour fermer la modal
  const handleCloseDeleteModal = React.useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  // Fonction pour confirmer la suppression
  const handleConfirmDelete = React.useCallback(async () => {
    await handleDeleteLieu(id);
    setShowDeleteModal(false);
  }, [handleDeleteLieu, id]);

  if (loading && id !== 'nouveau') {
    return <Spinner message="Chargement du lieu..." contentOnly={true} />;
  }

  return (
    <div className={styles.lieuFormContainer}>
      {/* Header avec le style qui te plaisait */}
      <LieuFormHeader 
        id={id} 
        lieuNom={lieu.nom} 
        lieu={lieu}
        navigate={navigate}
        isSubmitting={submitting || loading || isDeleting}
        onSave={handleSubmit}
        onDelete={id !== 'nouveau' ? handleOpenDeleteModal : undefined}
        canSave={true}
      />

      <form onSubmit={handleSubmit} className={styles.modernForm}>
        <div className={styles.sectionsStack}>
          {/* General information section - Même ordre que LieuDetails */}
          <LieuGeneralInfo
            lieu={lieu}
            formData={lieu}
            isEditMode={true}
            onChange={handleChange}
          />

          {/* Address section */}
          <LieuAddressSection 
            lieu={lieu}
            isEditing={true}
            handleChange={handleChange}
            addressSearch={addressSearch}
          />

          {/* Organizer section - Même nom que dans LieuDetails */}
          <LieuOrganizerSection
            isEditMode={true}
            programmateur={programmateurSearch?.selectedEntity}
            lieu={lieu}
            formData={lieu}
            onChange={handleChange}
            onProgrammateurChange={programmateurSearch?.setSelectedEntity}
          />

          {/* Contact section - Déplacé vers le bas comme dans LieuDetails */}
          <LieuContactSection 
            lieu={lieu}
            contact={lieu.contact} 
            isEditing={true}
            handleChange={handleChange} 
          />

          {/* Additional information section - En bas comme dans LieuDetails */}
          <LieuInfoSection 
            lieu={lieu}
            isEditing={true}
            handleChange={handleChange}
          />

          {error && (
            <Alert variant="danger" className="shadow-sm rounded-3 mb-4">
              <FlexContainer align="center" gap="sm">
                <div>{error}</div>
              </FlexContainer>
            </Alert>
          )}
        </div>
      </form>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Supprimer le lieu"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce lieu ?"
        entityName={lieu.nom}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LieuForm;
