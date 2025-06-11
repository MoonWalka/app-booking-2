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
import LieuAddressInputSection from './sections/LieuAddressInputSection';
import LieuContactSearchSection from './sections/LieuContactSearchSection';
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
    submitting,
    validationErrors
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
    <div className={styles.pageWrapper}>
      <form onSubmit={(e) => {
        e.preventDefault();
        console.log('Form submit - Données actuelles:', lieu);
        handleSubmit(e);
      }}>
        <div className={styles.formContainer}>
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
            roundedTop={true}
          />

          <div className={styles.sectionBody}>
            <div className={styles.sectionsStack}>
              {/* General information section - Même ordre que LieuDetails */}
              <LieuGeneralInfo
                lieu={lieu}
                formData={lieu}
                isEditMode={true}
                onChange={handleChange}
              />

              {/* Address section avec AddressInput */}
              <LieuAddressInputSection 
                lieu={lieu}
                isEditing={true}
                handleChange={handleChange}
              />

              {/* Contact section avec recherche bidirectionnelle */}
              <LieuContactSearchSection 
                lieu={lieu}
                isEditing={true}
                onContactsChange={(contactIds) => {
                  console.log('[LieuForm] onContactsChange appelé avec:', contactIds);
                  handleChange({ target: { name: 'contactIds', value: contactIds } });
                }}
              />
              
              {/* DEBUG: Afficher les données du lieu */}
              {process.env.NODE_ENV === 'development' && (
                <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', fontSize: '12px' }}>
                  <strong>DEBUG - Données du lieu:</strong>
                  <pre>{JSON.stringify({ id: lieu.id, contactIds: lieu.contactIds }, null, 2)}</pre>
                </div>
              )}


              {/* Affichage des erreurs de validation */}
              {validationErrors && Object.keys(validationErrors).length > 0 && (
                <Alert variant="danger" className="shadow-sm rounded-3 mb-4">
                  <FlexContainer direction="column" gap="sm">
                    <div><strong>Veuillez corriger les erreurs suivantes :</strong></div>
                    {Object.entries(validationErrors).map(([field, errorMsg]) => (
                      <div key={field}>• {errorMsg}</div>
                    ))}
                  </FlexContainer>
                </Alert>
              )}
              
              {/* Affichage des erreurs générales */}
              {error && (
                <Alert variant="danger" className="shadow-sm rounded-3 mb-4">
                  <FlexContainer align="center" gap="sm">
                    <div>{error}</div>
                  </FlexContainer>
                </Alert>
              )}
            </div>
          </div>
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
