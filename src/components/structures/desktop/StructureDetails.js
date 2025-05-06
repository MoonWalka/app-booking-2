import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './StructureDetails.module.css';

// Import custom hooks - Utilisation de la nouvelle version V2 du hook
import { useStructureDetailsV2 } from '@/hooks/structures';
import { useDeleteStructure } from '@/hooks/structures';

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
 * Refactorisé pour utiliser le hook générique via useStructureDetailsV2
 */
const StructureDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Utilisation du hook migré V2 au lieu du hook déprécié
  const {
    entity: structure,  // Renommé entity en structure pour compatibilité
    isLoading: loading, // Renommé isLoading en loading pour compatibilité
    error,
    relatedData: { programmateurs = [] }, // Extraction des données liées
    loadingRelated: { programmateurs: loadingProgrammateurs = false }, // État de chargement des données liées
    formatValue
  } = useStructureDetailsV2(id);
  
  const {
    showDeleteModal,
    setShowDeleteModal,
    deleting,
    handleDelete
  } = useDeleteStructure();

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