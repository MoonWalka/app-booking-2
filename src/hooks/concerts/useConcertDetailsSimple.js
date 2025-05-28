import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, db } from '@/services/firebase-service';
import { formatDate, formatMontant, isDatePassed, copyToClipboard } from '@/utils/formatters';

/**
 * Hook ultra-simplifié pour les détails de concert en mode VISUALISATION UNIQUEMENT
 * Optimisé pour 0 re-render avec stabilisation maximale
 * 
 * @param {string} id - ID du concert
 * @returns {object} - API du hook ultra-stabilisée
 */
const useConcertDetailsSimple = (id) => {
  const location = useLocation();
  
  // États ultra-simples
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Références stables pour éviter les re-renders
  const loadedRef = useRef(false);
  const currentIdRef = useRef(null);
  
  // Détecter le mode édition basé sur l'URL - STABILISÉ
  const isEditMode = useMemo(() => {
    return location.pathname.includes('/edit');
  }, [location.pathname]);
  
  // Fonction de chargement ultra-optimisée
  const loadConcertData = useCallback(async (concertId) => {
    if (!concertId || loadedRef.current || currentIdRef.current === concertId) {
      return;
    }
    
    currentIdRef.current = concertId;
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[useConcertDetailsSimple] Chargement du concert ${concertId}`);
      
      // Charger le concert principal
      const concertRef = doc(db, 'concerts', concertId);
      const concertSnap = await getDoc(concertRef);
      
      if (!concertSnap.exists()) {
        console.error(`[useConcertDetailsSimple] Concert ${concertId} non trouvé`);
        setError('Concert non trouvé');
        setLoading(false);
        return;
      }
      
      const concertData = { id: concertSnap.id, ...concertSnap.data() };
      console.log(`[useConcertDetailsSimple] Concert chargé:`, concertData);
      console.log(`[useConcertDetailsSimple] lieuId: ${concertData.lieuId}, programmateurId: ${concertData.programmateurId}`);
      console.log(`[useConcertDetailsSimple] Tous les champs du concert:`, Object.keys(concertData));
      setConcert(concertData);
      
      // Charger les entités liées en parallèle
      const promises = [];
      
      if (concertData.lieuId) {
        console.log(`[useConcertDetailsSimple] Chargement du lieu ${concertData.lieuId}`);
        promises.push(
          getDoc(doc(db, 'lieux', concertData.lieuId))
            .then(snap => {
              if (snap.exists()) {
                const lieuData = { id: snap.id, ...snap.data() };
                console.log(`[useConcertDetailsSimple] Lieu chargé:`, lieuData);
                setLieu(lieuData);
                return lieuData;
              } else {
                console.warn(`[useConcertDetailsSimple] Lieu ${concertData.lieuId} non trouvé`);
                setLieu(null);
                return null;
              }
            })
            .catch(err => {
              console.error(`[useConcertDetailsSimple] Erreur chargement lieu:`, err);
              setLieu(null);
              return null;
            })
        );
      } else {
        console.log(`[useConcertDetailsSimple] Aucun lieuId dans le concert`);
        setLieu(null);
      }
      
      if (concertData.programmateurId) {
        console.log(`[useConcertDetailsSimple] Chargement du programmateur ${concertData.programmateurId}`);
        promises.push(
          getDoc(doc(db, 'programmateurs', concertData.programmateurId))
            .then(snap => {
              if (snap.exists()) {
                const progData = { id: snap.id, ...snap.data() };
                console.log(`[useConcertDetailsSimple] Programmateur chargé:`, progData);
                setProgrammateur(progData);
                return progData;
              } else {
                console.warn(`[useConcertDetailsSimple] Programmateur ${concertData.programmateurId} non trouvé`);
                setProgrammateur(null);
                return null;
              }
            })
            .catch(err => {
              console.error(`[useConcertDetailsSimple] Erreur chargement programmateur:`, err);
              setProgrammateur(null);
              return null;
            })
        );
      } else {
        console.log(`[useConcertDetailsSimple] Aucun programmateurId dans le concert`);
        setProgrammateur(null);
      }
      
      if (concertData.artisteId) {
        promises.push(
          getDoc(doc(db, 'artistes', concertData.artisteId))
            .then(snap => snap.exists() ? { id: snap.id, ...snap.data() } : null)
            .then(data => setArtiste(data))
            .catch(() => setArtiste(null))
        );
      }
      
      if (concertData.structureId) {
        promises.push(
          getDoc(doc(db, 'structures', concertData.structureId))
            .then(snap => snap.exists() ? { id: snap.id, ...snap.data() } : null)
            .then(data => setStructure(data))
            .catch(() => setStructure(null))
        );
      }
      
      // Attendre toutes les entités liées
      await Promise.all(promises);
      
      loadedRef.current = true;
      setLoading(false);
      
    } catch (err) {
      console.error('Erreur lors du chargement du concert:', err);
      setError('Erreur lors du chargement');
      setLoading(false);
    }
  }, []);
  
  // Effet de chargement initial - ULTRA-STABILISÉ
  useEffect(() => {
    if (id && !loadedRef.current) {
      loadConcertData(id);
    }
  }, [id, loadConcertData]);
  
  // Réinitialiser quand l'ID change
  useEffect(() => {
    if (currentIdRef.current !== id) {
      loadedRef.current = false;
      currentIdRef.current = null;
      setConcert(null);
      setLieu(null);
      setProgrammateur(null);
      setArtiste(null);
      setStructure(null);
      setLoading(true);
      setError(null);
    }
  }, [id]);
  
  // Callbacks ultra-stabilisés avec useCallback et dépendances vides
  const stableCallbacks = useMemo(() => ({
    handleDelete: () => {
      console.log('Suppression non implémentée en mode simple');
    },
    handleChange: () => {
      console.log('Modification non disponible en mode visualisation');
    },
    handleSave: () => {
      console.log('Sauvegarde non disponible en mode visualisation');
    },
    setShowFormGenerator: () => {},
    setGeneratedFormLink: () => {},
    handleFormGenerated: () => {},
    setLieu: () => {},
    setProgrammateur: () => {},
    setArtiste: () => {}
  }), []);
  
  // Fonction de statut ultra-stabilisée
  const getStatusInfo = useCallback(() => {
    if (!concert) return { message: '', actionNeeded: false };
    
    const isPastDate = isDatePassed(concert.date);
    
    switch (concert.statut) {
      case 'contact':
        return { message: 'Contact établi', actionNeeded: false };
      case 'preaccord':
        return { message: 'Pré-accord obtenu', actionNeeded: false };
      case 'contrat':
        return { message: 'Contrat signé', actionNeeded: false };
      case 'acompte':
        return { message: 'Acompte reçu', actionNeeded: false };
      case 'solde':
        return { 
          message: isPastDate ? 'Concert terminé' : 'Solde reçu', 
          actionNeeded: false 
        };
      default:
        return { message: 'Statut non défini', actionNeeded: false };
    }
  }, [concert]);
  
  // Données ultra-stabilisées avec useMemo
  const stableData = useMemo(() => ({
    concert,
    lieu,
    programmateur,
    artiste,
    structure,
    loading,
    error,
    isEditMode,
    formData: concert || {},
    formDataStatus: null,
    showFormGenerator: false,
    generatedFormLink: '',
    isSubmitting: false
  }), [concert, lieu, programmateur, artiste, structure, loading, error, isEditMode]);
  
  // Utilitaires ultra-stabilisés
  const stableUtils = useMemo(() => ({
    copyToClipboard,
    formatDate,
    formatMontant,
    isDatePassed,
    getStatusInfo
  }), [getStatusInfo]);
  
  // API finale ultra-stabilisée
  return useMemo(() => ({
    // Données principales
    ...stableData,
    
    // Callbacks
    ...stableCallbacks,
    
    // Utilitaires
    ...stableUtils,
    
    // Debug: afficher les données retournées
    _debugReturn: (() => {
      console.log(`[useConcertDetailsSimple] RETOUR - concert:`, stableData.concert);
      console.log(`[useConcertDetailsSimple] RETOUR - lieu:`, stableData.lieu);
      console.log(`[useConcertDetailsSimple] RETOUR - programmateur:`, stableData.programmateur);
      console.log(`[useConcertDetailsSimple] RETOUR - loading:`, stableData.loading);
      return true;
    })()
  }), [stableData, stableCallbacks, stableUtils]);
};

export default useConcertDetailsSimple; 