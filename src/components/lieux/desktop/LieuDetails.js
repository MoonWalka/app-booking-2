import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '@/firebaseInit';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

// Import custom hooks
import useLieuDetails from './hooks/useLieuDetails';
import useProgrammateurSearch from './hooks/useProgrammateurSearch';
import useAddressSearch from './hooks/useAddressSearch';

// Import section components
import { LieuHeader } from './sections/LieuHeader';
import LieuGeneralInfo from './sections/LieuGeneralInfo';
import LieuAddressSection from './sections/LieuAddressSection';
import LieuOrganizerSection from './sections/LieuOrganizerSection';
import LieuContactSection from './sections/LieuContactSection';
import LieuInfoSection from './sections/LieuInfoSection';
import { LieuConcertsSection } from './sections/LieuConcertsSection';
import { LieuStructuresSection } from './sections/LieuStructuresSection';
import DeleteLieuModal from './sections/DeleteLieuModal';

// Import styles
import styles from './LieuDetails.module.css';

/**
 * LieuDetails component - displays and manages a venue's details
 */
const LieuDetails = () => {
  const { id: lieuId } = useParams();
  const navigate = useNavigate();

  // Use custom hooks
  const {
    lieu,
    loading,
    error,
    isEditing,
    isSubmitting,
    formData,
    isDeleting,
    showDeleteModal,
    hasAssociatedConcerts,
    setFormData,
    handleChange,
    handleEdit,
    handleCancel,
    handleSave,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete
  } = useLieuDetails(lieuId);

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    programmateur,
    loadingProgrammateur,
    selectedProgrammateur,
    handleSelectProgrammateur,
    handleRemoveProgrammateur
  } = useProgrammateurSearch(lieuId);

  const {
    addressSuggestions,
    isSearchingAddress,
    isAddressFieldActive,
    setAddressFieldActive,
    handleSelectAddress
  } = useAddressSearch(formData, handleChange);

  // Handle programmateur creation link
  const handleCreateProgrammateur = () => {
    // Stocker temporairement le formulaire actuel en localStorage
    if (isEditing) {
      localStorage.setItem('lieuFormData', JSON.stringify(formData));
      localStorage.setItem('lieuEditingId', lieuId);
    }
    
    navigate('/programmateurs/nouveau', { state: { returnTo: `/lieux/${lieuId}` } });
  };

  // Add the programmateur ID to the form data when changed
  React.useEffect(() => {
    if (selectedProgrammateur) {
      setFormData(prev => ({
        ...prev,
        programmateurId: selectedProgrammateur.id
      }));
    } else if (isEditing) {
      setFormData(prev => ({
        ...prev,
        programmateurId: null
      }));
    }
  }, [selectedProgrammateur, isEditing, setFormData]);

  // If loading, show a spinner
  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <Spinner variant="primary" message="Chargement du lieu..." />
      </div>
    );
  }

  // If error, show an error message
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/lieux')}
          icon={<i className="bi bi-arrow-left"></i>}
        >
          Retour à la liste des lieux
        </Button>
      </div>
    );
  }

  // If no lieu or lieu not found, show a message
  if (!lieu) {
    return (
      <div className={styles.errorContainer}>
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Ce lieu n'existe pas ou n'a pas pu être chargé.
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/lieux')}
          icon={<i className="bi bi-arrow-left"></i>}
        >
          Retour à la liste des lieux
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.lieuDetailsContainer}>
      {/* Header with title and action buttons */}
      <LieuHeader 
        lieu={lieu}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDeleteClick}
      />

      <div className={styles.twoColumnsLayout}>
        <div className={styles.leftColumn}>
          {/* General information section */}
          <LieuGeneralInfo
            lieu={lieu}
            formData={formData}
            isEditing={isEditing}
            handleChange={handleChange}
          />

          {/* Address section */}
          <LieuAddressSection
            lieu={lieu}
            formData={formData}
            isEditing={isEditing}
            handleChange={handleChange}
            addressSuggestions={addressSuggestions}
            isSearchingAddress={isSearchingAddress}
            handleSelectAddress={handleSelectAddress}
            setAddressFieldActive={setAddressFieldActive}
          />

          {/* Additional information section (created/updated) */}
          <LieuInfoSection lieu={lieu} />
        </div>

        <div className={styles.rightColumn}>
          {/* Contact information section */}
          <LieuContactSection
            lieu={lieu}
            formData={formData}
            isEditing={isEditing}
            handleChange={handleChange}
          />

          {/* Programmateur section */}
          <LieuOrganizerSection
            isEditing={isEditing}
            programmateur={programmateur}
            loadingProgrammateur={loadingProgrammateur}
            selectedProgrammateur={selectedProgrammateur}
            lieu={lieu}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            isSearching={isSearching}
            handleSelectProgrammateur={handleSelectProgrammateur}
            handleRemoveProgrammateur={handleRemoveProgrammateur}
            handleCreateProgrammateur={handleCreateProgrammateur}
          />

          {/* Associated concerts section */}
          <LieuConcertsSection lieu={lieu} isEditing={isEditing} />
          
          {/* Associated structures section - New section */}
          <LieuStructuresSection lieu={lieu} isEditing={isEditing} />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteLieuModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        lieu={lieu}
        isDeleting={isDeleting}
        hasAssociatedConcerts={hasAssociatedConcerts}
      />
    </div>
  );
};

export default LieuDetails;
