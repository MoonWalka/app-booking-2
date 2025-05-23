import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '@/firebaseInit';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

// Import custom hooks depuis les emplacements standardisés
// MIGRATION: Utilisation du hook optimisé au lieu du hook migré
import { useLieuDetails } from '@/hooks/lieux';
import { useProgrammateurSearch } from '@/hooks/programmateurs';
import { useAddressSearch } from '@/hooks/common';

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

  // Use custom hooks - NOUVEAU: Utilisation du hook optimisé
  const{
    lieu,
    loading,
    error,
    isEditing,
    isSubmitting,
    formData,
    isDeleting,
    showDeleteModal,
    handleChange,
    handleEdit,
    handleCancel,
    handleSubmit: handleSave,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleProgrammateurChange,
    addEquipement,
    removeEquipement
  } = useLieuDetails(lieuId);

  // Les noms peuvent différer légèrement entre les hooks, récupération des données liées
  const hasAssociatedConcerts = false; // Cette information devrait être récupérée du hook ou d'une autre source

  const{
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
      console.log('[LOG][LieuDetails] Appel handleProgrammateurChange(selectedProgrammateur)', selectedProgrammateur);
      handleProgrammateurChange(selectedProgrammateur);
    }
    // Ne rien faire si pas de programmateur sélectionné : on laisse le champ vide
  }, [selectedProgrammateur, handleProgrammateurChange]);

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

  // If no lieu or lieu not found after loading is complete, show a message
  if (!lieu && !loading) {
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
  
  // La condition supplémentaire de sécurité pour éviter une erreur si lieu est null
  if (!lieu) {
    return null;
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

      <div className={styles.sectionsStack}>
        {/* General information section */}
        <LieuGeneralInfo
          lieu={lieu}
          formData={formData}
          isEditing={isEditing}
          handleChange={handleChange}
          addEquipement={addEquipement}
          removeEquipement={removeEquipement}
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

        {/* Additional information section (created/updated) */}
        <LieuInfoSection lieu={lieu} />
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
