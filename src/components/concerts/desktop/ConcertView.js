// src/components/concerts/desktop/ConcertView.js
import React, { useState, useMemo, memo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import FormGenerator from '@/components/forms/FormGenerator';
import styles from './ConcertView.module.css';

// Import des hooks personnalisés
import { useConcertDetails } from '@/hooks/concerts';
import useConcertDetailsSimple from '@/hooks/concerts/useConcertDetailsSimple';
import { useConcertStatus } from '@/hooks/concerts';
import { useLieuSearch } from '@/hooks/lieux/useLieuSearch';
import { useProgrammateurSearch } from '@/hooks/programmateurs/useProgrammateurSearch';
import useArtisteSearch from '@/hooks/artistes/useArtisteSearch';

// Import des composants
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertArtistSection from './ConcertArtistSection';
import ConcertStructureSection from './ConcertStructureSection';
import DeleteConcertModal from './DeleteConcertModal';

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

  // Debug logs
  console.log(`[ConcertView] Rendu avec id: ${id}, isEditMode: ${isEditMode}`);

  callbacksRef.current.onSelectLieu = useCallback((lieu) => {
    if (callbacksRef.current.setLieu) {
      callbacksRef.current.setLieu(lieu);
    }
  }, []);
  
  callbacksRef.current.onSelectProgrammateur = useCallback((programmateur) => {
    if (callbacksRef.current.setProgrammateur) {
      callbacksRef.current.setProgrammateur(programmateur);
    }
  }, []);
  
  callbacksRef.current.onSelectArtiste = useCallback((artiste) => {
    if (callbacksRef.current.setArtiste) {
      callbacksRef.current.setArtiste(artiste);
    }
  }, []);
  
  const searchConfig = useMemo(() => ({
    lieu: { onSelect: callbacksRef.current.onSelectLieu, maxResults: 10 },
    programmateur: { onSelect: callbacksRef.current.onSelectProgrammateur, maxResults: 10 },
    artiste: { onSelect: callbacksRef.current.onSelectArtiste, maxResults: 10 }
  }), []);
  
  const detailsHookComplex = useConcertDetails(id);
  const detailsHookSimple = useConcertDetailsSimple(id);
  const detailsHook = isEditMode ? detailsHookComplex : detailsHookSimple;
  
  const concertStatus = useConcertStatus();
  const lieuSearchHook = useLieuSearch(searchConfig.lieu);
  const programmateurSearchHook = useProgrammateurSearch(searchConfig.programmateur);
  const artisteSearchHook = useArtisteSearch('', searchConfig.artiste);
  
  if (detailsHook) {
    callbacksRef.current.setLieu = detailsHook.setLieu;
    callbacksRef.current.setProgrammateur = detailsHook.setProgrammateur;
    callbacksRef.current.setArtiste = detailsHook.setArtiste;
  }

  const {
    concert, lieu, programmateur, artiste, structure, loading, isSubmitting, formData, 
    formDataStatus, showFormGenerator, generatedFormLink, setShowFormGenerator, 
    setGeneratedFormLink, handleDelete, copyToClipboard, formatDate, formatMontant, 
    isDatePassed, handleFormGenerated, handleChange, handleSave
  } = detailsHook || {};

  // Debug temporaire
  console.log('[ConcertView] Données reçues du hook:', {
    concert,
    lieu,
    programmateur,
    loading,
    detailsHook
  });

  const stableCallbacks = useMemo(() => ({
    handleEdit: () => navigate(`/concerts/${id}/edit`),
    handleCancel: () => navigate(`/concerts/${id}`),
    handleOpenDeleteModal: () => setShowDeleteConfirm(true),
    handleCloseDeleteModal: () => setShowDeleteConfirm(false)
  }), [navigate, id]);
  
  const searchObjects = useMemo(() => {
    if (isEditMode) {
      return {
        lieu: lieuSearchHook || {},
        programmateur: programmateurSearchHook || {},
        artiste: artisteSearchHook || {}
      };
    } else {
      const emptySearch = {
        searchTerm: '', setSearchTerm: () => {}, showResults: false, results: [],
        isSearching: false, handleLieuSelect: () => {}, setSelectedEntity: () => {},
        handleCreateLieu: () => navigate('/lieux/nouveau')
      };
      return { lieu: emptySearch, programmateur: emptySearch, artiste: emptySearch };
    }
  }, [isEditMode, lieuSearchHook, programmateurSearchHook, artisteSearchHook, navigate]);

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
    navigateToProgrammateurDetails: (progId) => navigate(`