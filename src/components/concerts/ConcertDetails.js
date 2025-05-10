// src/components/concerts/ConcertDetails.js
import React, { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import { useConcertDetailsV2 } from '@/hooks/concerts';
import ConcertForm from '@/components/concerts/ConcertForm';

/**
 * Composant conteneur pour les détails d'un concert
 * Version optimisée avec mémoisation pour réduire les rendus inutiles
 */
function ConcertDetails() {
  const { id } = useParams();
  const location = useLocation();
  const responsive = useResponsive();
  
  // Utilisation du hook useConcertDetails pour gérer l'état global
  const concertDetailsHook = useConcertDetailsV2(id, location);
  const { isEditMode, loading } = concertDetailsHook;
  
  // Mémoriser le composant responsive pour éviter des recreations inutiles
  const ConcertView = useMemo(() => {
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
  
  // En mode édition, afficher le formulaire
  if (isEditMode) {
    return <ConcertForm id={id} />;
  }
  
  // Passer tous les hooks au composant enfant pour éviter des recréations
  return <ConcertView id={id} detailsHook={concertDetailsHook} />;
}

// Utiliser React.memo pour éviter les rerenders inutiles
export default React.memo(ConcertDetails);
