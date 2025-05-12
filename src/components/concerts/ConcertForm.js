import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ConcertForm.module.css';

// Hooks personnalisés
import { useConcertFormV2 } from '@/hooks/concerts';
import useEntitySearch from '@/hooks/concerts/useEntitySearch';
import useFormSubmission from '@/hooks/concerts/useFormSubmission';

// Sections du formulaire
import ConcertFormHeader from './sections/ConcertFormHeader';
import ConcertFormActions from './sections/ConcertFormActions';
import ConcertInfoSection from './sections/ConcertInfoSection';
import LieuSearchSection from './sections/LieuSearchSection';
import ProgrammateurSearchSection from './sections/ProgrammateurSearchSection';
import ArtisteSearchSection from './sections/ArtisteSearchSection';
import NotesSection from './sections/NotesSection';
import DeleteConfirmModal from './sections/DeleteConfirmModal';

/**
 * ConcertForm - Composant principal pour le formulaire de concert
 * Version refactorisée avec des sous-composants et des hooks personnalisés
 */
const ConcertForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewConcert = id === 'nouveau';

  // Hook pour gérer les états du formulaire
  const{
    loading,
    formData,
    handleChange,
    selectedLieu,
    setSelectedLieu,
    selectedProgrammateur,
    setSelectedProgrammateur,
    selectedArtiste,
    setSelectedArtiste,
    initialProgrammateurId,
    initialArtisteId
  } = useConcertFormV2(id);

  // Recherche de lieux
  const {
    searchTerm: lieuSearchTerm,
    setSearchTerm: setLieuSearchTerm,
    results: lieuResults,
    showResults: showLieuResults,
    setShowResults: setShowLieuResults,
    isSearching: isSearchingLieux,
    dropdownRef: lieuDropdownRef,
    handleCreate: handleCreateLieu
  } = useEntitySearch({
    entityType: 'lieux',
    searchField: 'nom',
    additionalSearchFields: ['ville', 'codePostal'],
    maxResults: 10
  });

  // Recherche de programmateurs
  const {
    searchTerm: progSearchTerm,
    setSearchTerm: setProgSearchTerm,
    results: progResults,
    showResults: showProgResults,
    setShowResults: setShowProgResults,
    isSearching: isSearchingProgs,
    dropdownRef: progDropdownRef,
    handleCreate: handleCreateProgrammateur
  } = useEntitySearch({
    entityType: 'programmateurs',
    searchField: 'nom',
    additionalSearchFields: ['raisonSociale'],
    maxResults: 10
  });

  // Recherche d'artistes
  const {
    searchTerm: artisteSearchTerm,
    setSearchTerm: setArtisteSearchTerm,
    results: artisteResults,
    showResults: showArtisteResults,
    setShowResults: setShowArtisteResults,
    isSearching: isSearchingArtistes,
    dropdownRef: artisteDropdownRef,
    handleCreate: handleCreateArtiste
  } = useEntitySearch({
    entityType: 'artistes',
    searchField: 'nom',
    additionalSearchFields: ['style'],
    maxResults: 10
  });

  // Hook pour gérer la soumission et la suppression
  const {
    isSubmitting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSubmit,
    handleDelete
  } = useFormSubmission(
    id, 
    formData, 
    navigate,
    {
      selectedLieu,
      selectedProgrammateur,
      selectedArtiste,
      initialProgrammateurId,
      initialArtisteId
    }
  );

  // Gérer la sélection des entités
  const handleSelectLieu = (lieu) => {
    setSelectedLieu(lieu);
    setShowLieuResults(false);
    setLieuSearchTerm('');
  };

  const handleRemoveLieu = () => {
    setSelectedLieu(null);
  };

  const handleSelectProgrammateur = (programmateur) => {
    setSelectedProgrammateur(programmateur);
    setShowProgResults(false);
    setProgSearchTerm('');
  };

  const handleRemoveProgrammateur = () => {
    setSelectedProgrammateur(null);
  };

  const handleSelectArtiste = (artiste) => {
    setSelectedArtiste(artiste);
    setShowArtisteResults(false);
    setArtisteSearchTerm('');
  };

  const handleRemoveArtiste = () => {
    setSelectedArtiste(null);
  };

  // Gérer les notes
  const handleNotesChange = (newNotes) => {
    handleChange({ target: { name: 'notes', value: newNotes } });
  };

  // Afficher l'indicateur de chargement si en cours de chargement
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className={styles.loadingText}>Chargement du concert...</p>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      {/* En-tête du formulaire */}
      <ConcertFormHeader 
        id={id} 
        formData={formData} 
        navigate={navigate} 
      />
      
      {/* Actions en haut du formulaire */}
      <ConcertFormActions
        id={id}
        isSubmitting={isSubmitting}
        onDelete={() => setShowDeleteConfirm(true)}
        navigate={navigate}
        position="top"
      />
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Section d'informations principales */}
        <ConcertInfoSection 
          formData={formData}
          onChange={handleChange}
        />
        
        {/* Section de recherche de lieu */}
        <LieuSearchSection 
          lieuSearchTerm={lieuSearchTerm}
          setLieuSearchTerm={setLieuSearchTerm}
          lieuResults={lieuResults}
          showLieuResults={showLieuResults}
          isSearchingLieux={isSearchingLieux}
          lieuDropdownRef={lieuDropdownRef}
          selectedLieu={selectedLieu}
          handleSelectLieu={handleSelectLieu}
          handleRemoveLieu={handleRemoveLieu}
          handleCreateLieu={handleCreateLieu}
        />
        
        {/* Section de recherche de programmateur */}
        <ProgrammateurSearchSection 
          progSearchTerm={progSearchTerm}
          setProgSearchTerm={setProgSearchTerm}
          progResults={progResults}
          showProgResults={showProgResults}
          isSearchingProgs={isSearchingProgs}
          progDropdownRef={progDropdownRef}
          selectedProgrammateur={selectedProgrammateur}
          handleSelectProgrammateur={handleSelectProgrammateur}
          handleRemoveProgrammateur={handleRemoveProgrammateur}
          handleCreateProgrammateur={handleCreateProgrammateur}
        />
        
        {/* Section de recherche d'artiste */}
        <ArtisteSearchSection 
          artisteSearchTerm={artisteSearchTerm}
          setArtisteSearchTerm={setArtisteSearchTerm}
          artisteResults={artisteResults}
          showArtisteResults={showArtisteResults}
          isSearchingArtistes={isSearchingArtistes}
          artisteDropdownRef={artisteDropdownRef}
          selectedArtiste={selectedArtiste}
          handleSelectArtiste={handleSelectArtiste}
          handleRemoveArtiste={handleRemoveArtiste}
          handleCreateArtiste={handleCreateArtiste}
        />
        
        {/* Section des notes */}
        <NotesSection 
          notes={formData.notes}
          onChange={handleNotesChange}
        />
        
        {/* Actions en bas du formulaire */}
        <ConcertFormActions
          id={id}
          isSubmitting={isSubmitting}
          onDelete={() => setShowDeleteConfirm(true)}
          onSubmit={handleSubmit}
          navigate={navigate}
          position="bottom"
        />
      </form>
      
      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          isSubmitting={isSubmitting}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default ConcertForm;
