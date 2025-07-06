import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '@/components/ui/Alert';
import styles from './DateForm.module.css';

// Hooks personnalisés
import useDateFormWithRelations from '@/hooks/dates/useDateFormWithRelations';
import useDateDelete from '@/hooks/dates/useDateDelete';
import { useEntitySearch } from '@/hooks/common';

// Sections du formulaire
import DateFormHeader from '../sections/DateFormHeader';
import DateFormActions from '../sections/DateFormActions';
import DateInfoSection from '../sections/DateInfoSection';
import LieuSearchSection from '../sections/LieuSearchSection';
import ContactSelectorRelational from '@/components/common/ContactSelectorRelational';
import ArtisteSearchSection from '../sections/ArtisteSearchSection';
// import ArtisteSearchSectionWithFallback from '../sections/ArtisteSearchSectionWithFallback';
import StructureSearchSection from '../../contacts/sections/StructureSearchSection';
import NotesSection from '../sections/NotesSection';
import ConfirmationModal from '@/components/ui/ConfirmationModal';



/**
 * DateForm - Composant desktop pour le formulaire de date
 * Version refactorisée avec des sous-composants et des hooks personnalisés
 */
const DateFormDesktop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Hook optimisé pour gérer état, chargement, soumission avec relations
  const formHook = useDateFormWithRelations(id);
  
  // Hook optimisé pour gérer la suppression
  const {
    isDeleting,
    handleDeleteDate
  } = useDateDelete(() => navigate('/dates'));
  
  const {
    loading,
    formData,
    handleChange,
    handleSubmit,
    handleCancel,
    isSubmitting,
    lieu,
    artiste,
    structure,
    handleLieuChange,
    handleArtisteChange,
    handleContactsChange,  // Pour multi-contacts
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

  // La recherche de contacts est maintenant gérée par ContactSelectorRelational

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
  // Le callback de suppression n'est plus nécessaire car ContactSelectorRelational gère cela en interne

  const handleRemoveArtisteCallback = useCallback(() => {
    handleArtisteChange(null);
  }, [handleArtisteChange]);

  const handleRemoveStructureCallback = useCallback(() => {
    console.log('[WORKFLOW_TEST] 1. Sélection de structure dans le formulaire de date - suppression');
    handleStructureChange(null);
  }, [handleStructureChange]);



  // Afficher l'indicateur de chargement si en cours de chargement
  if (loading) {
    return (
      <div className={styles.loadingSpinner}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p>Chargement du date...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <form id="dateForm" onSubmit={(e) => {
        console.log("[DateForm] Soumission du formulaire. ID:", id, "formData:", formData);
        handleSubmit(e);
      }}>
        <div className={styles.formContainer}>
          {/* Header avec FormHeader et roundedTop */}
          <DateFormHeader 
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
          
          <DateInfoSection 
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
          
          <ContactSelectorRelational
            multiple={true}  // Activer le mode multi-contacts
            value={formData.contactIds || (formData.contactId ? [formData.contactId] : [])}
            onChange={handleContactsChange}
            isEditing={true}
            entityId={formData.id}
            entityType="date"
            label="Organisateurs"
            required={false}
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
              handleSelectStructure={(structure) => {
                console.log('[WORKFLOW_TEST] 1. Sélection de structure dans le formulaire de date:', structure);
                handleStructureChange(structure);
              }}
              handleRemoveStructure={handleRemoveStructureCallback}
              handleCreateStructure={handleCreateStructure}
            />
          
          <NotesSection 
            notes={formData.notes}
            onChange={handleNotesChange}
          />
          
          <DateFormActions
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
          console.log('[DateForm] Appel de handleDeleteDate avec ID:', id);
          handleDeleteDate(id);
          setShowDeleteConfirm(false);
        }}
        title="Supprimer le date"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce date ?"
        entityName={formData.nom}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
        isLoading={isSubmitting || isDeleting}
      />
    </div>
  );
};

export default DateFormDesktop;
