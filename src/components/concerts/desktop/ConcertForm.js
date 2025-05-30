import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '@/components/ui/Alert';
import styles from './ConcertForm.module.css';

// Hooks personnalisés
import useConcertFormWithRelations from '@/hooks/concerts/useConcertFormWithRelations';
import useConcertDelete from '@/hooks/concerts/useConcertDelete';
import { useEntitySearch } from '@/hooks/common';

// Sections du formulaire
import ConcertFormHeader from '../sections/ConcertFormHeader';
import ConcertFormActions from '../sections/ConcertFormActions';
import ConcertInfoSection from '../sections/ConcertInfoSection';
import LieuSearchSection from '../sections/LieuSearchSection';
import ProgrammateurSearchSection from '../sections/ProgrammateurSearchSection';
import ArtisteSearchSection from '../sections/ArtisteSearchSection';
import NotesSection from '../sections/NotesSection';
import DeleteConfirmModal from '../sections/DeleteConfirmModal';



/**
 * ConcertForm - Composant desktop pour le formulaire de concert
 * Version refactorisée avec des sous-composants et des hooks personnalisés
 */
const ConcertFormDesktop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Hook optimisé pour gérer état, chargement, soumission avec relations
  const formHook = useConcertFormWithRelations(id);
  
  // Hook optimisé pour gérer la suppression
  const {
    isDeleting,
    handleDeleteConcert
  } = useConcertDelete(() => navigate('/concerts'));
  
  const {
    loading,
    formData,
    handleChange,
    handleSubmit,
    handleCancel,
    isSubmitting,
    lieu,
    artiste,
    programmateur,
    handleLieuChange,
    handleArtisteChange,
    handleProgrammateurChange
  } = formHook;

  const removeLieu = useCallback(() => {
    handleLieuChange(null);
  }, [handleLieuChange]);

  // RESTAURER la déstructuration pour useEntitySearch (lieux)
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

  // Gestion de la modale de suppression locale
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Gérer les notes
  const handleNotesChange = useCallback((newNotes) => {
    handleChange({ target: { name: 'notes', value: newNotes } });
  }, [handleChange]);

  // DÉFINIR LES CALLBACKS DE SUPPRESSION ICI
  const handleRemoveProgrammateurCallback = useCallback(() => {
    handleProgrammateurChange(null);
  }, [handleProgrammateurChange]);

  const handleRemoveArtisteCallback = useCallback(() => {
    handleArtisteChange(null);
  }, [handleArtisteChange]);



  // Afficher l'indicateur de chargement si en cours de chargement
  if (loading) {
    return (
      <div className={styles.loadingSpinner}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p>Chargement du concert...</p>
      </div>
    );
  }

  return (
    <div className={styles.deskConcertFormContainer}>
      {formHook.error && (
        <Alert variant="danger" className={styles.errorAlert}>
          {formHook.error}
        </Alert>
      )}
      
      <ConcertFormHeader 
        id={id} 
        formData={formData} 
        navigate={navigate}
        isSubmitting={isSubmitting}
        onDelete={id !== 'nouveau' ? () => setShowDeleteConfirm(true) : undefined}
        onCancel={handleCancel}
      />
      
        <form id="concertForm" onSubmit={(e) => {
          console.log("[ConcertForm] Soumission du formulaire. ID:", id, "formData:", formData);
          handleSubmit(e);
        }} className={styles.deskModernForm}>
          
          <ConcertInfoSection 
            formData={formData}
            onChange={handleChange}
            formErrors={formHook.formErrors}
          />
          
          <LieuSearchSection 
              lieuSearchTerm={lieuSearchTerm}
              setLieuSearchTerm={setLieuSearchTerm}
              lieuResults={lieuResults}
              showLieuResults={showLieuResults}
              setShowLieuResults={setShowLieuResults}
              isSearchingLieux={isSearchingLieux}
              lieuDropdownRef={lieuDropdownRef}
              selectedLieu={lieu || (formData.lieuId ? { id: formData.lieuId, nom: formData.lieuNom || 'Lieu sélectionné' } : null)}
              handleSelectLieu={handleLieuChange}
              handleRemoveLieu={removeLieu}
              handleCreateLieu={handleCreateLieu}
            />
          
          <ProgrammateurSearchSection 
              progSearchTerm={progSearchTerm}
              setProgSearchTerm={setProgSearchTerm}
              progResults={progResults}
              showProgResults={showProgResults}
              setShowProgResults={setShowProgResults}
              isSearchingProgs={isSearchingProgs}
              progDropdownRef={progDropdownRef}
              selectedProgrammateur={programmateur || (formData.programmateurId ? { id: formData.programmateurId, nom: formData.programmateurNom || 'Programmateur sélectionné' } : null)}
              handleSelectProgrammateur={handleProgrammateurChange}
              handleRemoveProgrammateur={handleRemoveProgrammateurCallback}
              handleCreateProgrammateur={handleCreateProgrammateur}
            />
          
          <ArtisteSearchSection 
              artisteSearchTerm={artisteSearchTerm}
              setArtisteSearchTerm={setArtisteSearchTerm}
              artisteResults={artisteResults}
              showArtisteResults={showArtisteResults}
              setShowArtisteResults={setShowArtisteResults}
              isSearchingArtistes={isSearchingArtistes}
              artisteDropdownRef={artisteDropdownRef}
              selectedArtiste={artiste || (formData.artisteId ? { id: formData.artisteId, nom: formData.artisteNom || 'Artiste sélectionné' } : null)}
              handleSelectArtiste={handleArtisteChange}
              handleRemoveArtiste={handleRemoveArtisteCallback}
              handleCreateArtiste={handleCreateArtiste}
            />
          
          <NotesSection 
            notes={formData.notes}
            onChange={handleNotesChange}
          />
          
          <ConcertFormActions
              id={id}
              isSubmitting={isSubmitting || isDeleting}
              onDelete={id !== 'nouveau' ? () => setShowDeleteConfirm(true) : undefined}
              onCancel={handleCancel}
              navigate={navigate}
              position="bottom"
            />
        </form>
        
        {showDeleteConfirm && (
          <DeleteConfirmModal
            isSubmitting={isSubmitting || isDeleting}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={() => {
              console.log('[ConcertForm] Appel de handleDeleteConcert avec ID:', id);
              handleDeleteConcert(id);
              setShowDeleteConfirm(false);
            }}
          />
        )}
      </div>
  );
};

export default ConcertFormDesktop;
