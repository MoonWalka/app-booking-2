import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import styles from './ConcertDetails.module.css';

// Import des hooks personnalisés - Modification pour utiliser la version V2
import { useConcertDetailsV2, useConcertForm } from '@/hooks/concerts';

// Import des composants
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertArtistSection from './ConcertArtistSection';
import ConcertStructureSection from './ConcertStructureSection';
import DeleteConcertModal from './DeleteConcertModal';
import FormGenerator from '@/components/forms/FormGenerator';

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

  const {
    formDataStatus,
    showFormGenerator,
    setShowFormGenerator,
    generatedFormLink,
    setGeneratedFormLink
  } = useConcertForm(id, programmateur?.id);

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
        onEdit={toggleEditMode}
        onDelete={() => setShowDeleteConfirm(true)}
        isEditMode={isEditMode}
        onSave={handleFormSubmit}
        onCancel={toggleEditMode}
        isSubmitting={isSubmitting}
        canSave={validateForm()}
        formatDate={formatDate}
        navigateToList={() => navigate('/concerts')}
      />

      {isEditMode ? (
        /* Mode édition */
        <form className="modern-form" onSubmit={handleFormSubmit}>
          {/* Informations générales */}
          <ConcertGeneralInfo 
            concert={concert}
            isEditMode={isEditMode}
            formData={formState}
            onChange={handleChange}
            formatDate={formatDate}
            formatMontant={formatMontant}
            isDatePassed={isDatePassed}
            statusInfo={statusInfo}
            artiste={artiste}
            formDataStatus={formDataStatus}
          />

          {/* Lieu */}
          <ConcertLocationSection 
            concertId={id}
            lieu={lieu}
            isEditMode={isEditMode}
            selectedLieu={lieuSearch.selectedEntity}
            lieuSearchTerm={lieuSearch.searchTerm}
            setLieuSearchTerm={lieuSearch.setSearchTerm}
            showLieuResults={lieuSearch.showResults}
            lieuResults={lieuSearch.results}
            isSearchingLieux={lieuSearch.isSearching}
            handleSelectLieu={lieuSearch.handleSelect}
            handleRemoveLieu={lieuSearch.handleRemove}
            handleCreateLieu={lieuSearch.handleCreate}
            navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
          />

          {/* Programmateur */}
          <ConcertOrganizerSection 
            concertId={id}
            programmateur={programmateur}
            isEditMode={isEditMode}
            selectedProgrammateur={programmateurSearch.selectedEntity}
            progSearchTerm={programmateurSearch.searchTerm}
            setProgSearchTerm={programmateurSearch.setSearchTerm}
            showProgResults={programmateurSearch.showResults}
            progResults={programmateurSearch.results}
            isSearchingProgs={programmateurSearch.isSearching}
            handleSelectProgrammateur={programmateurSearch.handleSelect}
            handleRemoveProgrammateur={programmateurSearch.handleRemove}
            handleCreateProgrammateur={programmateurSearch.handleCreate}
            navigateToProgrammateurDetails={(progId) => navigate(`/programmateurs/${progId}`)}
            formData={formData}
            showFormGenerator={showFormGenerator}
            setShowFormGenerator={setShowFormGenerator}
            generatedFormLink={generatedFormLink}
            setGeneratedFormLink={setGeneratedFormLink}
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
            selectedStructure={structureSearch.selectedEntity}
            structureSearchTerm={structureSearch.searchTerm}
            setStructureSearchTerm={structureSearch.setSearchTerm}
            showStructureResults={structureSearch.showResults}
            structureResults={structureSearch.results}
            isSearchingStructures={structureSearch.isSearching}
            handleSelectStructure={structureSearch.handleSelect}
            handleRemoveStructure={structureSearch.handleRemove}
            handleCreateStructure={() => navigate('/structures/new')}
            navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
          />

          {/* Artiste */}
          <ConcertArtistSection 
            concertId={id}
            artiste={artiste}
            isEditMode={isEditMode}
            selectedArtiste={artisteSearch.selectedEntity}
            artisteSearchTerm={artisteSearch.searchTerm}
            setArtisteSearchTerm={artisteSearch.setSearchTerm}
            showArtisteResults={artisteSearch.showResults}
            artisteResults={artisteSearch.results}
            isSearchingArtistes={artisteSearch.isSearching}
            handleSelectArtiste={artisteSearch.handleSelect}
            handleRemoveArtiste={artisteSearch.handleRemove}
            handleCreateArtiste={artisteSearch.handleCreate}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
          />
        </form>
      ) : (
        /* Mode vue */
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
            formDataStatus={formDataStatus}
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
            showFormGenerator={showFormGenerator}
            setShowFormGenerator={setShowFormGenerator}
            generatedFormLink={generatedFormLink}
            setGeneratedFormLink={setGeneratedFormLink}
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
      )}

      {/* Composant pour l'envoi de formulaire */}
      {showFormGenerator && !generatedFormLink && !isEditMode && (
        <div className="p-3 border rounded mb-3">
          <FormGenerator
            concertId={id}
            programmateurId={concert.programmateurId}
            onFormGenerated={handleFormGenerated}
          />
        </div>
      )}

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
