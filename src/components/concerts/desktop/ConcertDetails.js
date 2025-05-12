import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import styles from './ConcertDetails.module.css';

// Import des hooks personnalisés - Modification pour utiliser la version V2
import { useConcertDetailsV2 } from '@/hooks/concerts';

// Import des composants
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertArtistSection from './ConcertArtistSection';
import ConcertStructureSection from './ConcertStructureSection';
import DeleteConcertModal from './DeleteConcertModal';
// import FormGenerator (removed, unused)

const ConcertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // État pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Utilisation du hook V2 qui est basé sur useGenericEntityDetails
  const {
    // Données principales du hook (renommées pour garder la compatibilité)
    entity: concert,
    isLoading: loading,
    isSubmitting,
    error,
    
    // Entités liées
    relatedData: {
      lieu,
      programmateur,
      artiste, 
      structure
    },
    
    // Données du formulaire
    formData: formState,
    isEditing: isEditMode,
    
    // Données des formulaires spécifiques aux concerts
    formData,
    
    // Fonctions de gestion
    handleChange,
    toggleEditMode,
    handleDelete,
    handleSubmit,
    validateForm,
    
    // Fonctions spécifiques aux concerts
    handleFormGenerated,
    getStatusInfo,
    
    // Fonctions utilitaires
    copyToClipboard,
    formatDate,
    formatMontant,
    isDatePassed,
    
    // Objets de recherche pour les entités liées
    lieuSearch,
    programmateurSearch,
    artisteSearch,
    structureSearch
    
  } = useConcertDetailsV2(id, location);

  // Fonction pour initialiser les valeurs de recherche
  useEffect(() => {
    if (lieu && !lieuSearch.selectedEntity) {
      lieuSearch.setSelectedEntity(lieu);
      lieuSearch.setSearchTerm && lieuSearch.setSearchTerm(lieu.nom);
    }
    
    if (programmateur && !programmateurSearch.selectedEntity) {
      programmateurSearch.setSelectedEntity(programmateur);
      programmateurSearch.setSearchTerm && programmateurSearch.setSearchTerm(programmateur.nom);
    }
    
    if (artiste && !artisteSearch.selectedEntity) {
      artisteSearch.setSelectedEntity(artiste);
      artisteSearch.setSearchTerm && artisteSearch.setSearchTerm(artiste.nom);
    }

    if (structure && !structureSearch.selectedEntity) {
      structureSearch.setSelectedEntity(structure);
      structureSearch.setSearchTerm && structureSearch.setSearchTerm(structure.nom || structure.raisonSociale || '');
    }
  }, [lieu, programmateur, artiste, structure, lieuSearch, programmateurSearch, artisteSearch, structureSearch]);

  // Fonction pour soumettre le formulaire
  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    handleSubmit(e);
  };

  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du concert...</span>
          </div>
          <p className="mt-2">Chargement du concert...</p>
        </div>
      </div>
    );
  }

  if (!concert) {
    return <Alert variant="danger">Concert non trouvé</Alert>;
  }

  const statusInfo = getStatusInfo();

  // Handle structure deletion
  const confirmDelete = () => {
    handleDelete(concert);
  };

  return (
    <div className={styles.concertDetailsContainer}>
      {/* En-tête avec titre et boutons d'action */}
      <ConcertHeader 
        concert={concert}
        onEdit={() => navigate(`/concerts/${id}/edit`)}
        onDelete={() => setShowDeleteConfirm(true)}
        isEditMode={false}
        isSubmitting={isSubmitting}
        canSave={false}
        formatDate={formatDate}
        navigateToList={() => navigate('/concerts')}
      />

      {/* Always display view mode */}
      <>
        {/* Informations générales */}
        <ConcertGeneralInfo 
          concert={concert}
          isEditMode={isEditMode}
          formatDate={formatDate}
          formatMontant={formatMontant}
          isDatePassed={isDatePassed}
          statusInfo={statusInfo}
          artiste={artiste}
        />

        {/* Lieu */}
        <ConcertLocationSection 
          concertId={id}
          lieu={lieu}
          isEditMode={isEditMode}
          navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
        />

        {/* Programmateur */}
        <ConcertOrganizerSection 
          concertId={id}
          programmateur={programmateur}
          isEditMode={isEditMode}
          navigateToProgrammateurDetails={(progId) => navigate(`/programmateurs/${progId}`)}
          formData={formData}
          handleFormGenerated={handleFormGenerated}
          copyToClipboard={copyToClipboard}
          formatDate={formatDate}
          concert={concert}
        />

        {/* Structure */}
        <ConcertStructureSection 
          concertId={id}
          structure={structure}
          isEditMode={isEditMode}
          navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
        />

        {/* Artiste */}
        {artiste && (
          <ConcertArtistSection 
            concertId={id}
            artiste={artiste}
            isEditMode={isEditMode}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
          />
        )}
      </>

      {/* FormGenerator block removed (unused after unification) */}

      {/* Modale de confirmation de suppression */}
      <DeleteConcertModal
        show={showDeleteConfirm}
        concertNom={concert.titre || formatDate(concert.date)}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default ConcertDetails;
