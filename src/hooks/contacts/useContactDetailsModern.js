// src/hooks/contacts/useContactDetailsModern.js
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, db } from '@/services/firebase-service';

// Import du hook générique
import { useGenericEntityDetails } from '@/hooks/common';

// Import des utilitaires
import { formatDate, formatMontant, copyToClipboard, getCacheKey } from '@/utils/formatters';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook moderne pour gérer les détails et l'édition d'un contact
 * Basé sur l'architecture de useConcertDetails
 * 
 * @param {string} id - ID du contact
 * @param {object} locationParam - Paramètre de location (optionnel)
 * @returns {object} - API du hook
 */
const useContactDetailsModern = (id, locationParam) => {
  
  // 🔒 PROTECTION ANTI-BOUCLES: Références et compteurs stables
  const renderCountRef = useRef(0);
  const lastPropsHashRef = useRef('');
  const stableRefsRef = useRef({});
  
  const navigate = useNavigate();
  const locationData = useLocation();
  const location = locationParam || locationData;
  
  // 🔒 STABILISATION: Props hash pour détecter les vrais changements
  const propsHash = useMemo(() => {
    return JSON.stringify({
      id,
      pathname: location?.pathname,
      isEditMode: location?.pathname?.includes('/edit')
    });
  }, [id, location?.pathname]);

  // 🔒 PROTECTION: Détecter et logger seulement les vrais changements
  useEffect(() => {
    renderCountRef.current++;
    
    if (propsHash !== lastPropsHashRef.current) {
      debugLog(`[useContactDetailsModern] Changement détecté - Render #${renderCountRef.current}`, 'info', 'useContactDetailsModern');
      debugLog(`  - structure: ${stableRefsRef.current.structure ? 'PRÉSENT' : 'NULL'}`, 'debug', 'useContactDetailsModern');
      debugLog(`  - lieux: ${stableRefsRef.current.lieux ? 'PRÉSENT' : 'NULL'}`, 'debug', 'useContactDetailsModern');
      lastPropsHashRef.current = propsHash;
    }
  }, [propsHash]);

  // ✅ Configuration des relations pour les contacts
  const relationsConfig = useMemo(() => [
    {
      name: 'structure',
      collection: 'structures',
      idField: 'structureId',  // Champ principal
      alternativeIdFields: ['structure'], // Champs alternatifs pour compatibilité
      nameField: 'structureNom',
      type: 'one-to-one',
      essential: true // La structure est essentielle pour l'affichage du contact
    },
    {
      name: 'lieux',
      collection: 'lieux',
      idField: 'lieuxIds',
      alternativeIdFields: ['lieux'], // Champs alternatifs pour compatibilité
      nameField: 'lieuxNoms',
      type: 'one-to-many',
      essential: false // Les lieux peuvent être chargés à la demande
    }
  ], []); // Pas de dépendances car la configuration est statique

  // ✅ CORRECTION MAJEURE: Stabiliser toutes les fonctions avec useRef
  const transformContactDataRef = useRef();
  const handleSaveSuccessRef = useRef();

  // ✅ CORRECTION: Fonction de transformation des données du contact
  transformContactDataRef.current = useCallback((data) => {
    if (!data) return data;
    
    // Ajouter les champs calculés pour le contact
    return {
      ...data,
      nomComplet: data.prenom ? `${data.prenom} ${data.nom}` : data.nom,
      // Autres transformations spécifiques aux contacts
    };
  }, []);

  // États initiaux pour les entités liées
  const [initialStructureId, setInitialStructureId] = useState(null);
  const [initialLieuxIds, setInitialLieuxIds] = useState([]);

  // ✅ CORRECTION: Définir les fonctions de callback AVANT le hook générique
  useEffect(() => {
    const data = stableRefsRef.current.contact;
    if (!data) return;
    
    if (data.structureId) {
      setInitialStructureId(data.structureId);
    }
    
    if (data.lieuxIds) {
      setInitialLieuxIds(data.lieuxIds);
    }
  }, [id]);

  // ✅ CORRECTION: Stabiliser les callbacks de succès - SANS dépendances instables
  handleSaveSuccessRef.current = useCallback((data) => {
    // Mettre à jour les IDs initiaux pour la prochaine édition
    setInitialStructureId(data.structureId || null);
    setInitialLieuxIds(data.lieuxIds || []);
    
    // Émettre un événement personnalisé pour notifier les autres composants
    try {
      const event = new CustomEvent('contactUpdated', { 
        detail: { contactId: id, contactData: data }
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de mise à jour', e);
    }
  }, [id]);

  // ✅ CORRECTION: Callback de suppression avec navigation
  const handleDeleteSuccessRef = useRef();
  handleDeleteSuccessRef.current = useCallback(() => {
    // Émettre un événement de suppression
    try {
      const event = new CustomEvent('contactDeleted', { 
        detail: { contactId: id }
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de suppression', e);
    }
    navigate('/contacts');
  }, [id, navigate]);

  // ✅ FINAL: Utiliser le hook générique avec la configuration complète
  const genericDetails = useGenericEntityDetails({
    entityType: 'contact',
    collectionName: 'contacts',
    id,
    relationsConfig,
    transformEntityData: transformContactDataRef.current,
    onSaveSuccess: handleSaveSuccessRef.current,
    onSaveError: () => {},
    onDeleteSuccess: handleDeleteSuccessRef.current,
    onDeleteError: () => {},
    navigate,
    returnPath: '/contacts',
    editPath: '/contacts/:id/edit'
  });

  // ✅ Stocker les données dans les refs stables pour éviter les re-renders
  useEffect(() => {
    if (genericDetails?.entity) {
      stableRefsRef.current.contact = genericDetails.entity;
    }
    if (genericDetails?.relatedData?.structure) {
      stableRefsRef.current.structure = genericDetails.relatedData.structure;
    }
    if (genericDetails?.relatedData?.lieux) {
      stableRefsRef.current.lieux = genericDetails.relatedData.lieux;
    }
  }, [genericDetails?.entity, genericDetails?.relatedData]);

  // ✅ Extraire les entités liées de manière stable
  const contact = genericDetails?.entity;
  const structure = genericDetails?.relatedData?.structure;
  const lieux = genericDetails?.relatedData?.lieux || [];

  // ✅ FINAL: Retourner l'API complète du hook
  return {
    // Données principales du hook générique
    contact,
    structure,
    lieux,
    loading: genericDetails?.loading || false,
    isLoading: genericDetails?.loading || false, 
    isSubmitting: genericDetails?.isSubmitting || false,
    error: genericDetails?.error || null,
    
    // Données de formulaire
    formData: genericDetails?.formData || {},
    
    // Fonctions de gestion
    handleSave: genericDetails?.handleSave || (() => {}),
    handleDelete: genericDetails?.handleDelete || (() => {}),
    handleChange: genericDetails?.handleChange || (() => {}),
    
    // Fonctions pour la gestion des entités liées
    setStructure: (structure) => genericDetails?.setRelatedEntity('structure', structure),
    setLieux: (lieux) => genericDetails?.setRelatedEntity('lieux', lieux),
    
    // Recherche d'entités (compatibilité avec les anciens hooks)
    structureSearch: {
      selectedEntity: genericDetails?.relatedData?.structure || null,
      setSelectedEntity: (structure) => genericDetails?.setRelatedEntity('structure', structure),
      setSearchTerm: () => {} // Stub pour compatibilité
    },
    lieuxSearch: {
      selectedEntity: genericDetails?.relatedData?.lieux || [],
      setSelectedEntity: (lieux) => genericDetails?.setRelatedEntity('lieux', lieux),
      setSearchTerm: () => {} // Stub pour compatibilité
    },
    
    // Fonctions utilitaires
    formatDate,
    formatValue: (value) => value || 'Non spécifié',
    copyToClipboard,
    
    // Métadonnées
    entityType: 'contact',
    isEditMode: location?.pathname?.includes('/edit') || false,
    
    // Debug et monitoring
    renderCount: renderCountRef.current,
    cacheKey: getCacheKey('contact', id)
  };
};

export default useContactDetailsModern;