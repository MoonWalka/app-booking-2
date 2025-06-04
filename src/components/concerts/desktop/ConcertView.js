// src/components/concerts/desktop/ConcertView.js
import React, { useState, useMemo, memo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import FormGenerator from '@/components/forms/FormGenerator';
import styles from './ConcertView.module.css';

// Import des hooks personnalisés
import { useConcertDetails } from '@/hooks/concerts';
import { useConcertStatus } from '@/hooks/concerts';
import { useLieuSearch } from '@/hooks/lieux/useLieuSearch';
import { useContactSearch } from '@/hooks/contacts/useContactSearch';
import useArtisteSearch from '@/hooks/artistes/useArtisteSearch';

// Import des composants
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertArtistSection from './ConcertArtistSection';
import ConcertStructureSection from './ConcertStructureSection';
import NotesSection from '../sections/NotesSection';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

/**
 * Composant de vue des détails d'un concert - Version Desktop ULTRA-OPTIMISÉE
 */
const ConcertView = memo(({ id: propId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = propId || urlId;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = useMemo(() => location.pathname.includes('/edit'), [location.pathname]);
  const callbacksRef = useRef({});

  callbacksRef.current.onSelectLieu = useCallback((lieu) => {
    if (callbacksRef.current.setLieu) {
      callbacksRef.current.setLieu(lieu);
    }
  }, []);
  
  callbacksRef.current.onSelectContact = useCallback((contact) => {
    if (callbacksRef.current.setContact) {
      callbacksRef.current.setContact(contact);
    }
  }, []);
  
  callbacksRef.current.onSelectArtiste = useCallback((artiste) => {
    if (callbacksRef.current.setArtiste) {
      callbacksRef.current.setArtiste(artiste);
    }
  }, []);
  
  const searchConfig = useMemo(() => ({
    lieu: { onSelect: callbacksRef.current.onSelectLieu, maxResults: 10 },
    contact: { onSelect: callbacksRef.current.onSelectContact, maxResults: 10 },
    artiste: { onSelect: callbacksRef.current.onSelectArtiste, maxResults: 10 }
  }), []);
  
  const detailsHook = useConcertDetails(id);
  
  const concertStatus = useConcertStatus();
  const lieuSearchHook = useLieuSearch(searchConfig.lieu);
  const contactSearchHook = useContactSearch(searchConfig.contact);
  const artisteSearchHook = useArtisteSearch('', searchConfig.artiste);
  
  if (detailsHook) {
    callbacksRef.current.setLieu = detailsHook.setLieu;
    callbacksRef.current.setContact = detailsHook.setContact;
    callbacksRef.current.setArtiste = detailsHook.setArtiste;
  }

  const {
    concert, lieu, contact, artiste, structure, loading, isSubmitting, formData, 
    formDataStatus, showFormGenerator, generatedFormLink, setShowFormGenerator, 
    setGeneratedFormLink, handleDelete, copyToClipboard, formatDate, formatMontant, 
    isDatePassed, handleFormGenerated, handleChange, handleSave
  } = detailsHook || {};

  const stableCallbacks = useMemo(() => ({
    handleEdit: () => navigate(`/concerts/${id}/edit`),
    handleCancel: () => navigate(`/concerts/${id}`),
    handleOpenDeleteModal: () => setShowDeleteConfirm(true),
    handleCloseDeleteModal: () => setShowDeleteConfirm(false)
  }), [navigate, id]);
  
  const searchObjects = useMemo(() => {
    if (isEditMode) {
      // En mode édition, mapper correctement les méthodes des hooks
      return {
        lieu: {
          ...lieuSearchHook,
          // Mapper setLieu vers handleLieuSelect pour compatibilité
          handleLieuSelect: lieuSearchHook?.setLieu || lieuSearchHook?.handleLieuSelect || (() => {}),
          setSelectedEntity: lieuSearchHook?.setLieu || lieuSearchHook?.setSelectedEntity || (() => {})
        },
        contact: {
          ...contactSearchHook,
          // Mapper les méthodes pour compatibilité
          handleContactSelect: contactSearchHook?.setContact || contactSearchHook?.handleContactSelect || (() => {}),
          setSelectedEntity: contactSearchHook?.setContact || contactSearchHook?.setSelectedEntity || (() => {})
        },
        artiste: {
          ...artisteSearchHook,
          // Mapper les méthodes pour compatibilité
          handleArtisteSelect: artisteSearchHook?.setArtiste || artisteSearchHook?.handleArtisteSelect || (() => {}),
          setSelectedEntity: artisteSearchHook?.setArtiste || artisteSearchHook?.setSelectedEntity || (() => {})
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
        handleLieuSelect: () => {},
        setSelectedEntity: () => {},
        handleCreateLieu: () => {},
        handleCreateContact: type === 'contact' ? () => navigate('/contacts/nouveau') : () => {},
        handleCreateArtiste: type === 'artiste' ? () => navigate('/artistes/nouveau') : () => {}
      });
      
      return { 
        lieu: createReadOnlySearch('lieu'), 
        contact: createReadOnlySearch('contact'), 
        artiste: createReadOnlySearch('artiste') 
      };
    }
  }, [isEditMode, lieuSearchHook, contactSearchHook, artisteSearchHook, navigate]);

  const statusInfo = useMemo(() => {
    if (!detailsHook?.getStatusInfo) return {};
    const basicStatus = detailsHook.getStatusInfo();
    const advancedStatus = concertStatus?.getStatusDetails?.(detailsHook.concert?.statut);
    return { ...basicStatus, ...advancedStatus, statusBadge: advancedStatus?.badge || basicStatus?.badge,
             actionButtons: advancedStatus?.actions || [], urgencyLevel: advancedStatus?.urgency || 'normal' };
  }, [detailsHook, concertStatus]);

  const navigationCallbacks = useMemo(() => ({
    navigateToList: () => navigate('/concerts'),
    navigateToLieuDetails: (lieuId) => navigate(`/lieux/${lieuId}`),
    navigateToContactDetails: (progId) => navigate(`/contacts/${progId}`),
    navigateToStructureDetails: (structureId) => navigate(`/structures/${structureId}`),
    navigateToArtisteDetails: (artisteId) => navigate(`/artistes/${artisteId}`),
    handleCreateLieu: () => navigate('/lieux/nouveau'),
    handleCreateContact: () => navigate('/contacts/nouveau'),
    handleCreateArtiste: () => navigate('/artistes/nouveau')
  }), [navigate]);

  if (!detailsHook && isEditMode) {
    console.error("[ConcertView] Erreur critique: detailsHook est indéfini en mode édition.");
    return <Alert variant="danger">Erreur lors du chargement des données d'édition du concert.</Alert>;
  }
  if (!detailsHook && !isEditMode) {
    if (!id) return <Alert variant="danger">ID de concert manquant.</Alert>;
    return <Alert variant="danger">Erreur lors du chargement des données de vue du concert.</Alert>;
  }


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

  return (
    <div className={styles.concertViewContainer || 'concert-view-container'}>
      <ConcertHeader 
        concert={concert}
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

      <ConcertGeneralInfo 
        concert={concert}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        formatDate={formatDate}
        formatMontant={formatMontant}
        isDatePassed={isDatePassed}
        statusInfo={statusInfo}
        artiste={artiste}
        formDataStatus={formDataStatus}
      />
      <ConcertLocationSection 
        concertId={id}
        lieu={lieu}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        navigateToLieuDetails={navigationCallbacks.navigateToLieuDetails}
        selectedLieu={lieu}
        lieuSearchTerm={searchObjects.lieu.searchTerm}
        setLieuSearchTerm={searchObjects.lieu.setSearchTerm}
        showLieuResults={searchObjects.lieu.showResults}
        lieuResults={searchObjects.lieu.results}
        isSearchingLieux={searchObjects.lieu.isSearching}
        handleSelectLieu={searchObjects.lieu.handleLieuSelect || searchObjects.lieu.setSelectedEntity}
        handleRemoveLieu={() => callbacksRef.current.setLieu && callbacksRef.current.setLieu(null)}
        handleCreateLieu={navigationCallbacks.handleCreateLieu}
      />
      <ConcertOrganizerSection 
        concertId={id}
        contact={contact}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        navigateToContactDetails={navigationCallbacks.navigateToContactDetails}
        showFormGenerator={showFormGenerator}
        setShowFormGenerator={setShowFormGenerator}
        generatedFormLink={generatedFormLink}
        setGeneratedFormLink={setGeneratedFormLink}
        handleFormGenerated={handleFormGenerated}
        copyToClipboard={copyToClipboard}
        formatDate={formatDate}
        concert={concert}
        selectedContact={contact}
        contactSearchTerm={searchObjects.contact.searchTerm}
        setContactSearchTerm={searchObjects.contact.setSearchTerm}
        showContactResults={searchObjects.contact.showResults}
        contactResults={searchObjects.contact.results}
        isSearchingContacts={searchObjects.contact.isSearching}
        handleSelectContact={searchObjects.contact.setSelectedEntity}
        handleRemoveContact={() => callbacksRef.current.setContact && callbacksRef.current.setContact(null)}
        handleCreateContact={navigationCallbacks.handleCreateContact}
      />
      <ConcertStructureSection 
        concertId={id}
        structure={structure}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        navigateToStructureDetails={navigationCallbacks.navigateToStructureDetails}
      />
      {artiste && (
        <ConcertArtistSection 
          concertId={id}
          artiste={artiste}
          isEditMode={isEditMode}
          formData={formData}
          onChange={handleChange}
          navigateToArtisteDetails={navigationCallbacks.navigateToArtisteDetails}
          selectedArtiste={artiste}
          artisteSearchTerm={searchObjects.artiste.searchTerm}
          setArtisteSearchTerm={searchObjects.artiste.setSearchTerm}
          showArtisteResults={searchObjects.artiste.showResults}
          artisteResults={searchObjects.artiste.results}
          isSearchingArtistes={searchObjects.artiste.isSearching}
          handleSelectArtiste={searchObjects.artiste.setArtiste || searchObjects.artiste.setSelectedEntity}
          handleRemoveArtiste={() => callbacksRef.current.setArtiste && callbacksRef.current.setArtiste(null)}
          handleCreateArtiste={navigationCallbacks.handleCreateArtiste}
        />
      )}
      <NotesSection 
        notes={concert?.notes || formData?.notes}
        onChange={isEditMode ? (newNotes) => handleChange({ target: { name: 'notes', value: newNotes } }) : null}
        isEditMode={isEditMode}
      />
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
              contactId={contact?.id}
              onFormGenerated={(formLinkId, formUrl) => {
                setGeneratedFormLink(formUrl);
                if (handleFormGenerated) {
                  handleFormGenerated(formLinkId, formUrl);
                }
                // Ne pas fermer automatiquement le FormGenerator pour permettre à l'utilisateur de copier le lien
              }}
            />
          </div>
        </div>
      )}
      <ConfirmationModal
        show={showDeleteConfirm}
        onHide={stableCallbacks.handleCloseDeleteModal}
        onConfirm={() => {
          handleDelete();
          setShowDeleteConfirm(false);
        }}
        title="Supprimer le concert"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce concert ?"
        entityName={concert?.titre}
        variant="danger"
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
      />
    </div>
  );
});

export default ConcertView;