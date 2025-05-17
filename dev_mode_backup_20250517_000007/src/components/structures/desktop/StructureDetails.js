import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './StructureDetails.module.css';

// MIGRATION: Utilisation des hooks optimisés au lieu des versions V2/déprécié
import { useStructureDetailsOptimized, useDeleteStructureOptimized } from '@/hooks/structures';

// Import section components
import StructureHeader from './sections/StructureHeader';
import StructureGeneralInfo from './sections/StructureGeneralInfo';
import StructureContactSection from './sections/StructureContactSection';
import StructureAddressSection from './sections/StructureAddressSection';
import StructureAssociationsSection from './sections/StructureAssociationsSection';
import StructureNotesSection from './sections/StructureNotesSection';
import StructureDeleteModal from './sections/StructureDeleteModal';

/**
 * Component for displaying structure details
 * Refactorisé pour utiliser le hook optimisé
 */
const StructureDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // MIGRATION: Utilisation du hook optimisé
  const {
    structure,
    loading,
    error,
    programmateurs,
    loadingProgrammateurs,
    formatValue
  } = useStructureDetailsOptimized(id);
  
  const {
    deleting,
    showDeleteModal,
    setShowDeleteModal,
    handleDelete
  } = useDeleteStructureOptimized(() => {
    // Callback après suppression réussie
    navigate('/structures');
  });

  // Loading state
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className={styles.spinner} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.alertInfo}>
        <i className="bi bi-exclamation-triangle"></i>
        {error.message || error}
      </div>
    );
  }

  // Handle structure deletion
  const confirmDelete = () => {
    handleDelete(structure);
  };

  return (
    <div className={styles.detailsContainer}>
      {/* Structure Header with Actions */}
      <StructureHeader 
        structure={structure} 
        onEdit={() => navigate(`/structures/${id}/edit`)} 
        onDelete={() => setShowDeleteModal(true)}
        navigateToList={() => navigate('/structures')}
      />

      <div className={styles.detailsContent}>
        {/* General Information Section */}
        <StructureGeneralInfo 
          structure={structure} 
          formatValue={formatValue}
        />

        {/* Address Section */}
        <StructureAddressSection 
          structure={structure} 
          formatValue={formatValue} 
        />

        {/* Contact Information Section */}
        <StructureContactSection 
          structure={structure} 
          formatValue={formatValue} 
        />

        {/* Associated Programmateurs Section */}
        <StructureAssociationsSection 
          programmateurs={programmateurs}
          loadingProgrammateurs={loadingProgrammateurs} 
        />

        {/* Notes Section - if present */}
        {structure?.notes && <StructureNotesSection notes={structure.notes} />}
      </div>

      {/* Confirmation Modal for Structure Deletion */}
      <StructureDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        isDeleting={deleting}
        structure={structure}
      />
    </div>
  );
};

export default StructureDetails;