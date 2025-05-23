// src/components/concerts/ConcertDetails.js
import React, { useMemo, useEffect } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import { useConcertDetails } from '@/hooks/concerts';

/**
 * Composant conteneur pour les détails d'un concert
 * Version optimisée avec mémoisation pour réduire les rendus inutiles
 */
function ConcertDetails() {
  const { id } = useParams();
  const location = useLocation();
  const responsive = useResponsive();
  
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
  
  // Log avant chaque potentielle redirection
  useEffect(() => {
    console.log(`[🔍 ConcertDetails] VÉRIFICATION DE REDIRECT - isEditMode=${isEditMode}, loading=${loading}, path=${location.pathname}`);
    
    if (isEditMode) {
      console.log(`[🔍 ConcertDetails] ⚠️ MODE EDITION ACTIVÉ - redirection imminente si sur page détail`);
    }
  }, [isEditMode, loading, location.pathname]);
  
  // Rediriger vers la page d'édition si basculé en mode édition depuis la fiche principale
  const editPath = `/concerts/${id}/edit`;
  if (isEditMode && location.pathname === `/concerts/${id}`) {
    console.log(`[🔍 ConcertDetails] 🚀 REDIRECTION vers ${editPath}`);
    return <Navigate to={editPath} replace />;
  }
  
  console.log(`[🔍 ConcertDetails] ✅ RENDER FINAL - retourne la vue`);
  
  // Passer tous les hooks au composant enfant pour éviter des recréations
  return <ConcertView id={id} detailsHook={concertDetailsHook} />;
}

// Utiliser React.memo pour éviter les rerenders inutiles
export default React.memo(ConcertDetails);
