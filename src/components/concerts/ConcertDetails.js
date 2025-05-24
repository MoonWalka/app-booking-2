// src/components/concerts/ConcertDetails.js
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import { useConcertDetails } from '@/hooks/concerts';
import Button from '@ui/Button';
import styles from './ConcertDetails.module.css';

/**
 * Composant conteneur pour les détails d'un concert
 * Version optimisée avec mémoisation pour réduire les rendus inutiles
 */
function ConcertDetails() {
  const { id } = useParams();
  const location = useLocation();
  const responsive = useResponsive();
  
  // État pour gérer l'affichage du bouton d'édition rapide
  const [showQuickEditButton, setShowQuickEditButton] = useState(false);
  
  // Log d'entrée pour chaque rendu du composant avec un compteur de rendu
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;
  
  console.log(`[🔍 ConcertDetails] RENDER #${renderCountRef.current} - id=${id}, pathname=${location.pathname}`, {
    time: new Date().toISOString().substr(11, 12)
  });
  
  // Utilisation du hook useConcertDetails pour gérer l'état global
  const concertDetailsHook = useConcertDetails(id, location);
  const { isEditMode, loading, entity: concert, error, toggleEditMode } = concertDetailsHook;
  
  console.log(`[🔍 ConcertDetails] APRÈS HOOK - isEditMode=${isEditMode}, loading=${loading}`, {
    hasConcert: !!concert,
    hasError: !!error,
    currentPath: location.pathname
  });
  
  // Mémoriser le composant responsive pour éviter des recreations inutiles
  const ConcertView = useMemo(() => {
    console.log('[🔍 ConcertDetails] CRÉATION DU COMPOSANT VIEW');
    return responsive.getResponsiveComponent({
      desktopPath: 'concerts/desktop/ConcertView',
      mobilePath: 'concerts/mobile/ConcertView',
      // Ajouter un fallback explicite pour une meilleure UX
      fallback: (
        <div className="loading-container">
          <p>Chargement de la vue du concert...</p>
        </div>
      )
    });
  }, [responsive.isMobile, responsive.getResponsiveComponent]);
  
  // Montrer le bouton d'édition rapide après un délai pour permettre une UX fluide
  useEffect(() => {
    if (concert && !loading) {
      const timer = setTimeout(() => {
        setShowQuickEditButton(true);
      }, 1000); // Apparition après 1 seconde
      
      return () => clearTimeout(timer);
    }
  }, [concert, loading]);
  
  // Log avant chaque potentielle redirection
  useEffect(() => {
    console.log(`[🔍 ConcertDetails] VÉRIFICATION DE REDIRECT - isEditMode=${isEditMode}, loading=${loading}, path=${location.pathname}`);
    
    if (isEditMode) {
      console.log(`[🔍 ConcertDetails] ⚠️ MODE EDITION ACTIVÉ - redirection imminente si sur page détail`);
    }
  }, [isEditMode, loading, location.pathname]);
  
  // Gestionnaire d'édition rapide sophistiqué
  const handleQuickEdit = () => {
    console.log('[🔍 ConcertDetails] 🚀 ÉDITION RAPIDE ACTIVÉE - utilisation de toggleEditMode');
    
    // Utiliser la logique sophistiquée du hook au lieu de simplement rediriger
    toggleEditMode();
    
    // Masquer le bouton temporairement pour feedback visuel
    setShowQuickEditButton(false);
    setTimeout(() => setShowQuickEditButton(true), 2000);
  };
  
  // Rediriger vers la page d'édition si basculé en mode édition depuis la fiche principale
  const editPath = `/concerts/${id}/edit`;
  if (isEditMode && location.pathname === `/concerts/${id}`) {
    console.log(`[🔍 ConcertDetails] 🚀 REDIRECTION vers ${editPath}`);
    return <Navigate to={editPath} replace />;
  }
  
  console.log(`[🔍 ConcertDetails] ✅ RENDER FINAL - retourne la vue`);
  
  return (
    <div className={styles.concertDetailsContainer}>
      {/* Bouton d'édition rapide flottant (fonctionnalité ajoutée) */}
      {showQuickEditButton && !isEditMode && !loading && concert && (
        <div className={styles.quickEditButton}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleQuickEdit}
            className={styles.floatingEditButton}
            title="Édition rapide - Basculer en mode édition sans quitter cette page"
          >
            <i className="bi bi-lightning-charge me-1"></i>
            <span className="d-none d-md-inline">Édition rapide</span>
          </Button>
        </div>
      )}
      
      {/* Composant principal */}
      <ConcertView id={id} detailsHook={concertDetailsHook} />
    </div>
  );
}

// Utiliser React.memo pour éviter les rerenders inutiles
export default React.memo(ConcertDetails);
