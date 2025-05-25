import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '@/components/ui/Alert';
import styles from './ConcertForm.module.css';

// Hooks personnalisés
import useConcertForm from '@/hooks/concerts/useConcertForm';
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
  const isNewConcert = id === 'nouveau';
  
  // Log pour déboguer l'ID passé et le mode édition/création
  console.log(`[ConcertFormDesktop] id=${id}, isNewConcert=${isNewConcert}`);
  console.log("[ConcertForm] Monté. ID depuis useParams:", id);
  console.log("[ConcertForm] isNewConcert (basé sur useParams id === 'nouveau'):", isNewConcert, "ID actuel:", id);

  // Hook optimisé pour gérer état, chargement, soumission
  const formHook = useConcertForm(id);
  console.log("[ConcertForm] Hook useConcertForm initialisé. ID passé au hook:", id);
  
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
    concert,
    lieu,
    artiste,
    programmateur,
    handleLieuChange,
    handleArtisteChange,
    updateFormData,
    loadRelatedEntity
  } = formHook;

  console.log("[ConcertForm] Données du hook: loading:", loading, "formData:", formData, 
    "concert:", concert, "concert ID:", concert?.id);

  // Gestion programmateur via optimized hook
  const handleProgrammateurChange = (prog) => {
    if (prog) {
      updateFormData(prev => ({ ...prev, programmateurId: prog.id, programmateurNom: prog.nom }));
      loadRelatedEntity('programmateur', prog.id);
    } else {
      updateFormData(prev => ({ ...prev, programmateurId: null, programmateurNom: '' }));
    }
  };

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

  const removeLieu = () => {
    handleLieuChange(null);
    console.log('[ConcertFormDesktop] Lieu supprimé, selectedLieu est maintenant null');
  };

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
  const handleNotesChange = (newNotes) => {
    handleChange({ target: { name: 'notes', value: newNotes } });
  };

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

  console.log("[ConcertForm] Rendu. ID:", id, "isNewConcert (variable locale):", isNewConcert, "formData:", formData);
  
  return (
    <div className={styles.deskConcertFormContainer}>
      {/* Affichage d'une erreur de validation */}
      {formHook.error && (
        <Alert variant="danger" className={styles.errorAlert}>
          {formHook.error}
        </Alert>
      )}
      
      {/* En-tête du formulaire */}
      <ConcertFormHeader 
        id={id} 
        formData={formData} 
        navigate={navigate} 
      />
      
      {/* Actions en haut du formulaire */}
      <ConcertFormActions
        id={id}
        isSubmitting={isSubmitting || isDeleting}
        onDelete={id !== 'nouveau' ? () => setShowDeleteConfirm(true) : undefined}
        onCancel={handleCancel}
        navigate={navigate}
        position="top"
      />
      
      <form onSubmit={(e) => {
        console.log("[ConcertForm] Soumission du formulaire. ID:", id, "formData:", formData);
        handleSubmit(e);
      }} className={styles.deskModernForm}>
        {/* Section d'informations principales */}
        <ConcertInfoSection 
          formData={formData}
          onChange={handleChange}
          formErrors={formHook.formErrors}
        />
        
        {/* Section de recherche de lieu */}
        <LieuSearchSection 
          lieuSearchTerm={lieuSearchTerm}
          setLieuSearchTerm={setLieuSearchTerm}
          lieuResults={lieuResults}
          showLieuResults={showLieuResults}
          setShowLieuResults={setShowLieuResults}
          isSearchingLieux={isSearchingLieux}
          lieuDropdownRef={lieuDropdownRef}
          selectedLieu={formData.lieuId ? lieu : null}
          handleSelectLieu={handleLieuChange}
          handleRemoveLieu={removeLieu}
          handleCreateLieu={handleCreateLieu}
        />
        
        {/* Section de recherche de programmateur */}
        <ProgrammateurSearchSection 
          progSearchTerm={progSearchTerm}
          setProgSearchTerm={setProgSearchTerm}
          progResults={progResults}
          showProgResults={showProgResults}
          setShowProgResults={setShowProgResults}
          isSearchingProgs={isSearchingProgs}
          progDropdownRef={progDropdownRef}
          selectedProgrammateur={formData.programmateurId ? programmateur : null}
          handleSelectProgrammateur={handleProgrammateurChange}
          handleRemoveProgrammateur={() => handleProgrammateurChange(null)}
          handleCreateProgrammateur={handleCreateProgrammateur}
        />
        {/* Section de recherche d'artiste */}
        <ArtisteSearchSection 
          artisteSearchTerm={artisteSearchTerm}
          setArtisteSearchTerm={setArtisteSearchTerm}
          artisteResults={artisteResults}
          showArtisteResults={showArtisteResults}
          setShowArtisteResults={setShowArtisteResults}
          isSearchingArtistes={isSearchingArtistes}
          artisteDropdownRef={artisteDropdownRef}
          selectedArtiste={formData.artisteId ? artiste : null}
          handleSelectArtiste={handleArtisteChange}
          handleRemoveArtiste={() => handleArtisteChange(null)}
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
          isSubmitting={isSubmitting || isDeleting}
          onDelete={id !== 'nouveau' ? () => setShowDeleteConfirm(true) : undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          navigate={navigate}
          position="bottom"
        />
      </form>
      
      {/* Modal de confirmation de suppression */}
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
