import React, { useCallback, useEffect, Profiler } from 'react';
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

// Importer la fonction d'enregistrement des données
import { recordProfilerData } from '@/components/debug/ProfilerMonitor';

// Compteur pour ConcertFormDesktop
const concertFormRenderCounts = {};

// Fonction de callback pour le Profiler
const onRenderCallback = (
  id, // l'identifiant "id" du Profiler
  phase, // soit "mount" soit "update"
  actualDuration, // temps passé à faire le rendu
  baseDuration, // temps estimé sans mémoïsation
  startTime, // quand React a commencé
  commitTime, // quand React a appliqué
) => {
  console.log(`🎭 Profiler [${id}]:`, {
    phase,
    actualDuration: `${actualDuration.toFixed(2)}ms`,
    baseDuration: `${baseDuration.toFixed(2)}ms`,
    startTime: `${startTime.toFixed(2)}ms`,
    commitTime: `${commitTime.toFixed(2)}ms`,
  });
  
  // Enregistrer les données pour le monitoring
  recordProfilerData(id, phase, actualDuration);
  
  // Alerte si le temps de rendu est anormalement élevé
  if (actualDuration > 50) {
    console.warn(`⚠️ Rendu lent détecté dans ${id}: ${actualDuration.toFixed(2)}ms`);
  }
};

/**
 * ConcertForm - Composant desktop pour le formulaire de concert
 * Version refactorisée avec des sous-composants et des hooks personnalisés
 */
const ConcertFormDesktop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewConcert = id === 'nouveau';
  
  // Hook optimisé pour gérer état, chargement, soumission
  const formHook = useConcertForm(id);
  
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

  // Gestion programmateur via optimized hook
  const handleProgrammateurChange = useCallback((prog) => {
    if (prog) {
      updateFormData(prev => ({ ...prev, programmateurId: prog.id, programmateurNom: prog.nom }));
      loadRelatedEntity('programmateur', prog.id);
    } else {
      updateFormData(prev => ({ ...prev, programmateurId: null, programmateurNom: '' }));
    }
  }, [updateFormData, loadRelatedEntity]);

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

  // useEffect pour compter les rendus de ConcertFormDesktop
  useEffect(() => {
    const currentId = id || 'form';
    if (!concertFormRenderCounts[currentId]) {
      concertFormRenderCounts[currentId] = 0;
    }
    concertFormRenderCounts[currentId]++;
    console.log(`⚛️ [ConcertFormDesktop RENDER] ID: ${currentId}, Count: ${concertFormRenderCounts[currentId]}`);
  }); // Pas de dépendances pour se déclencher à chaque rendu

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
    <Profiler id="ConcertFormDesktop-Root" onRender={onRenderCallback}>
      <div className={styles.deskConcertFormContainer} style={{ backgroundColor: 'lightblue' }}>
        {formHook.error && (
          <Alert variant="danger" className={styles.errorAlert}>
            {formHook.error}
          </Alert>
        )}
        
        <Profiler id="ConcertForm-Header" onRender={onRenderCallback}>
          <ConcertFormHeader 
            id={id} 
            formData={formData} 
            navigate={navigate} 
          />
        </Profiler>
        
        <Profiler id="ConcertForm-Actions-Top" onRender={onRenderCallback}>
          <ConcertFormActions
            id={id}
            isSubmitting={isSubmitting || isDeleting}
            onDelete={id !== 'nouveau' ? () => setShowDeleteConfirm(true) : undefined}
            onCancel={handleCancel}
            navigate={navigate}
            position="top"
          />
        </Profiler>
        
        <form onSubmit={(e) => {
          console.log("[ConcertForm] Soumission du formulaire. ID:", id, "formData:", formData);
          handleSubmit(e);
        }} className={styles.deskModernForm}>
          
          <Profiler id="ConcertForm-InfoSection" onRender={onRenderCallback}>
            <ConcertInfoSection 
              formData={formData}
              onChange={handleChange}
              formErrors={formHook.formErrors}
            />
          </Profiler>
          
          <Profiler id="ConcertForm-LieuSearch" onRender={onRenderCallback}>
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
          </Profiler>
          
          <Profiler id="ConcertForm-ProgrammateurSearch" onRender={onRenderCallback}>
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
              handleRemoveProgrammateur={handleRemoveProgrammateurCallback}
              handleCreateProgrammateur={handleCreateProgrammateur}
            />
          </Profiler>
          
          <Profiler id="ConcertForm-ArtisteSearch" onRender={onRenderCallback}>
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
              handleRemoveArtiste={handleRemoveArtisteCallback}
              handleCreateArtiste={handleCreateArtiste}
            />
          </Profiler>
          
          <Profiler id="ConcertForm-Notes" onRender={onRenderCallback}>
            <NotesSection 
              notes={formData.notes}
              onChange={handleNotesChange}
            />
          </Profiler>
          
          <Profiler id="ConcertForm-Actions-Bottom" onRender={onRenderCallback}>
            <ConcertFormActions
              id={id}
              isSubmitting={isSubmitting || isDeleting}
              onDelete={id !== 'nouveau' ? () => setShowDeleteConfirm(true) : undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              navigate={navigate}
              position="bottom"
            />
          </Profiler>
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
    </Profiler>
  );
};

export default ConcertFormDesktop;
