import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useConcertDetailsUltraSimple } from '@/hooks/concerts';
import useConcertDelete from '@/hooks/concerts/useConcertDelete';

import styles from './ConcertView.module.css';

// Import sections
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertStructureSection from './ConcertStructureSection';
import ConcertArtistSection from './ConcertArtistSection';
import FormGenerator from '../../forms/FormGenerator';
// SUPPRESSION : Plus besoin de DeleteConcertModal
// import DeleteConcertModal from './DeleteConcertModal';

/**
 * ConcertViewUltraSimple - Version ultra-simplifiée du composant de vue
 * Mode lecture seule uniquement avec le strict minimum de dépendances
 * Suppression directe sans modal de confirmation
 */
const ConcertViewUltraSimple = React.memo(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // États locaux ultra-simples
  const [showFormGenerator, setShowFormGenerator] = useState(false);
  const [generatedFormLink, setGeneratedFormLink] = useState('');

  // Hook de suppression directe
  const {
    isDeleting,
    handleDeleteConcert
  } = useConcertDelete(() => navigate('/concerts'));

  // Hook ultra-simplifié pour les détails
  const {
    concert,
    lieu,
    programmateur,
    artiste,
    structure,
    loading,
    error
  } = useConcertDetailsUltraSimple(id);

  // Callbacks ultra-stabilisés
  const callbacks = useMemo(() => ({
    handleEdit: () => navigate(`/concerts/${id}/edit`),
    handleDelete: () => {
      if (id) {
        console.log('[ConcertViewUltraSimple] Suppression directe du concert:', id);
        handleDeleteConcert(id);
      }
    },
    navigateToList: () => navigate('/concerts'),
    handleCancel: () => navigate('/concerts'),
    handleOpenDeleteModal: () => {
      // Plus utilisé, appel direct de handleDelete
      callbacks.handleDelete();
    },
    handleCloseDeleteModal: () => {}, // Plus utilisé
  }), [navigate, id, handleDeleteConcert]);

  // Fonctions utilitaires ultra-simples
  const formatDate = (date) => {
    if (!date) return 'Date non spécifiée';
    try {
      const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      return dateObj.toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const formatMontant = (montant) => {
    if (!montant) return 'Montant non spécifié';
    return `${montant}€`;
  };

  const isDatePassed = (date) => {
    if (!date) return false;
    try {
      const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      return dateObj < new Date();
    } catch {
      return false;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Lien copié dans le presse-papiers !');
      })
      .catch(err => {
        console.error('Erreur lors de la copie :', err);
        alert('Erreur lors de la copie du lien');
      });
  };

  // Objets vides pour les hooks de recherche
  const emptySearchObjects = useMemo(() => {
    const emptySearch = {
      searchTerm: '',
      setSearchTerm: () => {},
      showResults: false,
      results: [],
      isSearching: false,
      handleLieuSelect: () => {},
      setSelectedEntity: () => {},
      handleCreateLieu: () => navigate('/lieux/nouveau')
    };

    return {
      lieu: emptySearch,
      programmateur: emptySearch,
      artiste: emptySearch
    };
  }, [navigate]);

  // Statut info ultra-simple
  const statusInfo = useMemo(() => ({
    statusBadge: concert?.statut || 'inconnu',
    actionButtons: [],
    urgencyLevel: 'normal'
  }), [concert?.statut]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du concert...</span>
          </div>
          <p className="mt-2">Chargement du concert...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!concert) {
    return <Alert variant="danger">Concert non trouvé</Alert>;
  }

  return (
    <div className={styles.concertViewContainer || 'concert-view-container'}>
      {/* En-tête avec titre et boutons d'action */}
      <ConcertHeader 
        concert={concert}
        onEdit={callbacks.handleEdit}
        onDelete={callbacks.handleDelete}
        isEditMode={false}
        formatDate={formatDate}
        navigateToList={callbacks.navigateToList}
        onSave={() => {}}
        onCancel={callbacks.handleCancel}
        isSubmitting={isDeleting}
        canSave={false}
      />

      {/* Mode vue uniquement */}
      <>
        {/* Informations générales */}
        <ConcertGeneralInfo 
          concert={concert}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          formatDate={formatDate}
          formatMontant={formatMontant}
          isDatePassed={isDatePassed}
          statusInfo={statusInfo}
          artiste={artiste}
          formDataStatus={null}
        />

        {/* Lieu */}
        <ConcertLocationSection 
          concertId={id}
          lieu={lieu}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
          selectedLieu={lieu}
          lieuSearchTerm={emptySearchObjects.lieu.searchTerm}
          setLieuSearchTerm={emptySearchObjects.lieu.setSearchTerm}
          showLieuResults={emptySearchObjects.lieu.showResults}
          lieuResults={emptySearchObjects.lieu.results}
          isSearchingLieux={emptySearchObjects.lieu.isSearching}
          handleSelectLieu={emptySearchObjects.lieu.handleLieuSelect}
          handleRemoveLieu={() => {}}
          handleCreateLieu={() => navigate('/lieux/nouveau')}
        />

        {/* Programmateur */}
        <ConcertOrganizerSection 
          concertId={id}
          programmateur={programmateur}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          navigateToProgrammateurDetails={(progId) => navigate(`/programmateurs/${progId}`)}
          showFormGenerator={showFormGenerator}
          setShowFormGenerator={setShowFormGenerator}
          generatedFormLink={generatedFormLink}
          setGeneratedFormLink={setGeneratedFormLink}
          handleFormGenerated={() => {}}
          copyToClipboard={copyToClipboard}
          formatDate={formatDate}
          concert={concert}
          selectedProgrammateur={programmateur}
          progSearchTerm={emptySearchObjects.programmateur.searchTerm}
          setProgSearchTerm={emptySearchObjects.programmateur.setSearchTerm}
          showProgResults={emptySearchObjects.programmateur.showResults}
          progResults={emptySearchObjects.programmateur.results}
          isSearchingProgs={emptySearchObjects.programmateur.isSearching}
          handleSelectProgrammateur={emptySearchObjects.programmateur.setSelectedEntity}
          handleRemoveProgrammateur={() => {}}
          handleCreateProgrammateur={() => navigate('/programmateurs/nouveau')}
        />

        {/* Structure */}
        <ConcertStructureSection 
          concertId={id}
          structure={structure}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
        />

        {/* Artiste - seulement si présent */}
        {artiste && (
          <ConcertArtistSection 
            concertId={id}
            artiste={artiste}
            isEditMode={false}
            formData={{}}
            onChange={() => {}}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
            selectedArtiste={artiste}
            artisteSearchTerm={emptySearchObjects.artiste.searchTerm}
            setArtisteSearchTerm={emptySearchObjects.artiste.setSearchTerm}
            showArtisteResults={emptySearchObjects.artiste.showResults}
            artisteResults={emptySearchObjects.artiste.results}
            isSearchingArtistes={emptySearchObjects.artiste.isSearching}
            handleSelectArtiste={emptySearchObjects.artiste.setSelectedEntity}
            handleRemoveArtiste={() => {}}
            handleCreateArtiste={() => navigate('/artistes/nouveau')}
          />
        )}
      </>

      {/* Générateur de formulaire */}
      {showFormGenerator && (
        <div className={styles.formGeneratorOverlay}>
          <div className={styles.formGeneratorModal}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowFormGenerator(false)}
              aria-label="Fermer"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <FormGenerator
              concertId={id}
              programmateurId={programmateur?.id}
              onFormGenerated={(formLinkId, formUrl) => {
                setGeneratedFormLink(formUrl);
                // Ne pas fermer automatiquement le FormGenerator pour permettre à l'utilisateur de copier le lien
              }}
            />
          </div>
        </div>
      )}

      {/* SUPPRESSION : Plus de modal de confirmation */}
      {/* Plus besoin de DeleteConcertModal */}
    </div>
  );
});

// Ajouter un nom d'affichage pour le debugging
ConcertViewUltraSimple.displayName = 'ConcertViewUltraSimple';

export default ConcertViewUltraSimple;