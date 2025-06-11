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
import ContactSearchSection from '../sections/ContactSearchSection';
import ArtisteSearchSection from '../sections/ArtisteSearchSection';
// import ArtisteSearchSectionWithFallback from '../sections/ArtisteSearchSectionWithFallback';
import StructureSearchSection from '../sections/StructureSearchSection';
import NotesSection from '../sections/NotesSection';
import ConfirmationModal from '@/components/ui/ConfirmationModal';



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
    contact,
    structure,
    handleLieuChange,
    handleArtisteChange,
    handleContactChange,
    handleStructureChange
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

  // Recherche de contacts
  const {
    searchTerm: progSearchTerm,
    setSearchTerm: setProgSearchTerm,
    results: progResults,
    showResults: showProgResults,
    setShowResults: setShowProgResults,
    isSearching: isSearchingProgs,
    dropdownRef: progDropdownRef,
    handleCreate: handleCreateContact
  } = useEntitySearch({
    entityType: 'contacts',
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

  // Recherche de structures
  const {
    searchTerm: structureSearchTerm,
    setSearchTerm: setStructureSearchTerm,
    results: structureResults,
    showResults: showStructureResults,
    setShowResults: setShowStructureResults,
    isSearching: isSearchingStructures,
    dropdownRef: structureDropdownRef,
    handleCreate: handleCreateStructure
  } = useEntitySearch({
    entityType: 'structures',
    searchField: 'nom',
    additionalSearchFields: ['raisonSociale', 'siret'],
    maxResults: 10
  });

  // Gestion de la modale de suppression locale
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Gérer les notes
  const handleNotesChange = useCallback((newNotes) => {
    handleChange({ target: { name: 'notes', value: newNotes } });
  }, [handleChange]);

  // DÉFINIR LES CALLBACKS DE SUPPRESSION ICI
  const handleRemoveContactCallback = useCallback(() => {
    handleContactChange(null);
  }, [handleContactChange]);

  const handleRemoveArtisteCallback = useCallback(() => {
    handleArtisteChange(null);
  }, [handleArtisteChange]);

  const handleRemoveStructureCallback = useCallback(() => {
    handleStructureChange(null);
  }, [handleStructureChange]);



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
    <div className={styles.pageWrapper}>
      <form id="concertForm" onSubmit={(e) => {
        console.log("[ConcertForm] Soumission du formulaire. ID:", id, "formData:", formData);
        handleSubmit(e);
      }}>
        <div className={styles.formContainer}>
          {/* Header avec FormHeader et roundedTop */}
          <ConcertFormHeader 
            id={id} 
            formData={formData} 
            navigate={navigate}
            isSubmitting={isSubmitting}
            onDelete={id !== 'nouveau' ? () => setShowDeleteConfirm(true) : undefined}
            onCancel={handleCancel}
            roundedTop={true}
          />

          {formHook.error && (
            <Alert variant="danger" className={styles.errorAlert}>
              {formHook.error}
            </Alert>
          )}

          <div className={styles.sectionBody}>
          
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
          
          <ContactSearchSection 
              progSearchTerm={progSearchTerm}
              setProgSearchTerm={setProgSearchTerm}
              progResults={progResults}
              showProgResults={showProgResults}
              setShowProgResults={setShowProgResults}
              isSearchingProgs={isSearchingProgs}
              progDropdownRef={progDropdownRef}
              selectedContact={contact || (formData.contactId ? { id: formData.contactId, nom: formData.contactNom || 'Contact sélectionné' } : null)}
              handleSelectContact={handleContactChange}
              handleRemoveContact={handleRemoveContactCallback}
              handleCreateContact={handleCreateContact}
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
          
          <StructureSearchSection 
              structureSearchTerm={structureSearchTerm}
              setStructureSearchTerm={setStructureSearchTerm}
              structureResults={structureResults}
              showStructureResults={showStructureResults}
              setShowStructureResults={setShowStructureResults}
              isSearchingStructures={isSearchingStructures}
              structureDropdownRef={structureDropdownRef}
              selectedStructure={structure || (formData.structureId ? { id: formData.structureId, nom: formData.structureNom || 'Structure sélectionnée' } : null)}
              handleSelectStructure={handleStructureChange}
              handleRemoveStructure={handleRemoveStructureCallback}
              handleCreateStructure={handleCreateStructure}
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
          </div>
        </div>
      </form>
        
      <ConfirmationModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          console.log('[ConcertForm] Appel de handleDeleteConcert avec ID:', id);
          handleDeleteConcert(id);
          setShowDeleteConfirm(false);
        }}
        title="Supprimer le concert"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce concert ?"
        entityName={formData.nom}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
        isLoading={isSubmitting || isDeleting}
      />
    </div>
  );
};

export default ConcertFormDesktop;
