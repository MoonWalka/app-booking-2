// src/components/contacts/desktop/ContactViewV2.js
import React, { useState, useMemo, memo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import styles from './ContactView.module.css';

// Import des hooks personnalisés
import useContactDetailsModern from '@/hooks/contacts/useContactDetailsModern';
import { useLieuSearch } from '@/hooks/lieux/useLieuSearch';
import { useStructureSearch } from '@/hooks/search/useStructureSearch';

// Import des composants sections (on va les créer)
import ContactHeaderV2 from './sections/ContactHeaderV2';
import ContactGeneralInfoV2 from './sections/ContactGeneralInfoV2';
import ContactStructureSectionV2 from './sections/ContactStructureSectionV2';
import ContactLieuxSectionV2 from './sections/ContactLieuxSectionV2';
import ContactConcertsSectionV2 from './sections/ContactConcertsSectionV2';
import ContactNotesSection from './sections/ContactNotesSection';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

/**
 * Composant de vue des détails d'un contact - Version Desktop V2 MODERNE
 * Architecture identique à ConcertView
 */
const ContactViewV2 = memo(({ id: propId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = propId || urlId;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = useMemo(() => location.pathname.includes('/edit'), [location.pathname]);
  const callbacksRef = useRef({});

  // Callbacks pour les entités liées
  callbacksRef.current.onSelectStructure = useCallback((structure) => {
    if (callbacksRef.current.setStructure) {
      callbacksRef.current.setStructure(structure);
    }
  }, []);
  
  callbacksRef.current.onSelectLieu = useCallback((lieu) => {
    if (callbacksRef.current.setLieux) {
      // Pour les lieux, on doit gérer un array
      const currentLieux = callbacksRef.current.getCurrentLieux?.() || [];
      callbacksRef.current.setLieux([...currentLieux, lieu]);
    }
  }, []);

  const searchConfig = useMemo(() => ({
    structure: { onSelect: callbacksRef.current.onSelectStructure, maxResults: 10 },
    lieu: { onSelect: callbacksRef.current.onSelectLieu, maxResults: 10 }
  }), []);
  
  // Hook principal pour les détails du contact
  const detailsHook = useContactDetailsModern(id);
  
  // Hooks de recherche (pour le mode édition)
  const structureSearchHook = useStructureSearch(searchConfig.structure);
  const lieuSearchHook = useLieuSearch(searchConfig.lieu);
  
  // Liaison des callbacks
  if (detailsHook) {
    callbacksRef.current.setStructure = detailsHook.setStructure;
    callbacksRef.current.setLieux = detailsHook.setLieux;
    callbacksRef.current.getCurrentLieux = () => detailsHook.lieux || [];
  }

  const {
    contact, structure, lieux, loading, isSubmitting, formData, 
    error, handleDelete, formatValue, formatDate,
    handleSave, handleChange
  } = detailsHook || {};

  // Callbacks stables
  const stableCallbacks = useMemo(() => ({
    handleEdit: () => navigate(`/contacts/${id}/edit`),
    handleCancel: () => navigate(`/contacts/${id}`),
    handleOpenDeleteModal: () => setShowDeleteConfirm(true),
    handleCloseDeleteModal: () => setShowDeleteConfirm(false)
  }), [navigate, id]);
  
  // Objets de recherche pour les sections
  const searchObjects = useMemo(() => {
    if (isEditMode) {
      return {
        structure: {
          ...structureSearchHook,
          handleStructureSelect: structureSearchHook?.setStructure || (() => {}),
          setSelectedEntity: structureSearchHook?.setStructure || (() => {})
        },
        lieu: {
          ...lieuSearchHook,
          handleLieuSelect: lieuSearchHook?.setLieu || (() => {}),
          setSelectedEntity: lieuSearchHook?.setLieu || (() => {})
        }
      };
    } else {
      // En mode lecture, créer des objets minimaux
      const createReadOnlySearch = (type) => ({
        searchTerm: '', 
        setSearchTerm: () => {}, 
        showResults: false, 
        results: [],
        isSearching: false, 
        setSelectedEntity: () => {},
        handleCreateStructure: type === 'structure' ? () => navigate('/structures/nouveau') : () => {},
        handleCreateLieu: type === 'lieu' ? () => navigate('/lieux/nouveau') : () => {}
      });
      
      return { 
        structure: createReadOnlySearch('structure'), 
        lieu: createReadOnlySearch('lieu')
      };
    }
  }, [isEditMode, structureSearchHook, lieuSearchHook, navigate]);

  // Callbacks de navigation
  const navigationCallbacks = useMemo(() => ({
    navigateToList: () => navigate('/contacts'),
    navigateToStructureDetails: (structureId) => navigate(`/structures/${structureId}`),
    navigateToLieuDetails: (lieuId) => navigate(`/lieux/${lieuId}`),
    navigateToConcertDetails: (concertId) => navigate(`/concerts/${concertId}`),
    handleCreateStructure: () => navigate('/structures/nouveau'),
    handleCreateLieu: () => navigate('/lieux/nouveau')
  }), [navigate]);

  // Gestion d'erreur
  if (!detailsHook && isEditMode) {
    console.error("[ContactViewV2] Erreur critique: detailsHook est indéfini en mode édition.");
    return <Alert variant="danger">Erreur lors du chargement des données d'édition du contact.</Alert>;
  }
  if (!detailsHook && !isEditMode) {
    if (!id) return <Alert variant="danger">ID de contact manquant.</Alert>;
    return <Alert variant="danger">Erreur lors du chargement des données de vue du contact.</Alert>;
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du contact...</span>
          </div>
          <p className="mt-2">Chargement du contact...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contactViewContainer || 'contact-view-container'}>
      <ContactHeaderV2 
        contact={contact}
        onEdit={stableCallbacks.handleEdit}
        onDelete={stableCallbacks.handleOpenDeleteModal}
        isEditMode={isEditMode}
        formatDate={formatDate}
        navigateToList={navigationCallbacks.navigateToList}
        onSave={handleSave}
        onCancel={stableCallbacks.handleCancel}
        isSubmitting={isSubmitting}
        canSave={true}
      />

      <ContactGeneralInfoV2 
        contact={contact}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        formatValue={formatValue}
      />

      <ContactStructureSectionV2 
        contactId={id}
        structure={structure}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        navigateToStructureDetails={navigationCallbacks.navigateToStructureDetails}
        selectedStructure={structure}
        structureSearchTerm={searchObjects.structure.searchTerm}
        setStructureSearchTerm={searchObjects.structure.setSearchTerm}
        showStructureResults={searchObjects.structure.showResults}
        structureResults={searchObjects.structure.results}
        isSearchingStructures={searchObjects.structure.isSearching}
        handleSelectStructure={searchObjects.structure.setSelectedEntity}
        handleRemoveStructure={() => callbacksRef.current.setStructure && callbacksRef.current.setStructure(null)}
        handleCreateStructure={navigationCallbacks.handleCreateStructure}
      />

      <ContactLieuxSectionV2 
        contactId={id}
        lieux={lieux}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        navigateToLieuDetails={navigationCallbacks.navigateToLieuDetails}
        selectedLieux={lieux}
        lieuSearchTerm={searchObjects.lieu.searchTerm}
        setLieuSearchTerm={searchObjects.lieu.setSearchTerm}
        showLieuResults={searchObjects.lieu.showResults}
        lieuResults={searchObjects.lieu.results}
        isSearchingLieux={searchObjects.lieu.isSearching}
        handleSelectLieu={searchObjects.lieu.setSelectedEntity}
        handleRemoveLieu={(lieuId) => {
          const updatedLieux = lieux.filter(l => l.id !== lieuId);
          callbacksRef.current.setLieux && callbacksRef.current.setLieux(updatedLieux);
        }}
        handleCreateLieu={navigationCallbacks.handleCreateLieu}
      />

      <ContactConcertsSectionV2 
        contactId={id}
        isEditMode={isEditMode}
        navigateToConcertDetails={navigationCallbacks.navigateToConcertDetails}
      />

      <ContactNotesSection 
        notes={contact?.notes || formData?.notes}
        onChange={isEditMode ? (newNotes) => handleChange({ target: { name: 'notes', value: newNotes } }) : null}
        isEditMode={isEditMode}
      />

      <ConfirmationModal
        show={showDeleteConfirm}
        onHide={stableCallbacks.handleCloseDeleteModal}
        onConfirm={() => {
          handleDelete();
          setShowDeleteConfirm(false);
        }}
        title="Supprimer le contact"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce contact ?"
        entityName={contact?.nom}
        variant="danger"
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
      />
    </div>
  );
});

export default ContactViewV2;