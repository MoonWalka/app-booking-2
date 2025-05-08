// src/components/programmateurs/ProgrammateurDetails.js
import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import { useProgrammateurDetailsV2 } from '@/hooks/programmateurs';
import ProgrammateurForm from '@/components/programmateurs/ProgrammateurForm';
import { ProgrammateurTrace } from '@/utils/diagnostic/programmateurDiagnostic';

console.log('[DEBUG-PROBLEME] ProgrammateurDetails - Module chargé');

// Ajout d'un compteur global pour suivre les instances 
const renderCount = {
  container: 0,
  component: 0
};

// Composant wrapper stable qui évite les remontages
const StableProgrammateurContainer = React.memo(function StableProgrammateurContainer({
  id, 
  ProgrammateurComponent, 
  isEditPath
}) {
  console.log(`[DEBUG-PROBLEME] StableProgrammateurContainer rendu #${++renderCount.container} pour ID: ${id}`);
  
  // Utilisation du hook pour gérer l'état global avec traçage
  const detailsHook = useProgrammateurDetailsV2(id);
  
  console.log(`[DIAGNOSTIC-STABLE] Rendu de StableProgrammateurContainer pour ID: ${id}, isEditPath: ${isEditPath}`);
  
  // Traçage des montages/démontages du container
  useEffect(() => {
    console.log(`[DEBUG-PROBLEME] StableProgrammateurContainer monté pour ID: ${id}`);
    return () => {
      console.log(`[DEBUG-PROBLEME] StableProgrammateurContainer démonté pour ID: ${id}`);
    };
  }, [id]);

  if (isEditPath) {
    console.log(`[DIAGNOSTIC-STABLE] Rendu du formulaire d'édition pour programmateur ${id}`);
    return <ProgrammateurForm id={id} />;
  }
  
  console.log(`[DIAGNOSTIC-STABLE] Délégation au composant de vue pour programmateur ${id}`);
  return <ProgrammateurComponent id={id} detailsHook={detailsHook} />;
});

/**
 * Composant conteneur pour les détails d'un programmateur
 * Décide d'afficher soit la vue, soit le formulaire d'édition
 */
function ProgrammateurDetails() {
  console.log('[RENDER] ProgrammateurDetails', { id: useParams().id });
  
  const { id } = useParams();
  const location = useLocation();
  const responsive = useResponsive();
  
  console.log(`[DEBUG-PROBLEME] ProgrammateurDetails rendu #${++renderCount.component} pour ID: ${id}`);
  
  // Références pour le diagnostic
  const mountCountRef = useRef(0);
  const initialRenderTimeRef = useRef(Date.now());
  const lastResponsiveModeRef = useRef(responsive.isMobile);
  const stableIdRef = useRef(id);
  
  // Mémoriser l'ID pour une référence stable
  if (id !== stableIdRef.current) {
    console.log(`[DIAGNOSTIC] ID changé de ${stableIdRef.current} à ${id}`);
    stableIdRef.current = id;
  }
  
  // Mémoriser le composant de vue pour éviter les recréations à chaque rendu
  const ProgrammateurView = useMemo(() => {
    console.log(`[DIAGNOSTIC] Création mémorisée du composant de vue, mode: ${responsive.isMobile ? 'Mobile' : 'Desktop'}`);
    return responsive.getResponsiveComponent({
      desktopPath: 'programmateurs/desktop/ProgrammateurView',
      mobilePath: 'programmateurs/mobile/ProgrammateurView'
    });
  }, [responsive.isMobile]); // Dépendance corrigée pour utiliser uniquement la propriété isMobile
  
  // Déterminer si on est sur un chemin d'édition de manière stable
  const isEditPath = location.pathname.includes('/edit/');
  
  // Traçage du montage du composant
  useEffect(() => {
    mountCountRef.current++;
    const mountCount = mountCountRef.current;
    const timeSincePrevious = Date.now() - initialRenderTimeRef.current;
    
    console.log(`[DEBUG-PROBLEME] ProgrammateurDetails useEffect #${mountCount} exécuté pour ID: ${id}`);
    console.log(`[DIAGNOSTIC] ProgrammateurDetails monté avec ID: ${id} (Montage #${mountCount}, Δt=${timeSincePrevious}ms)`);
    console.log(`[DIAGNOSTIC] Mode: ${responsive.isMobile ? 'Mobile' : 'Desktop'}, Path: ${location.pathname}`);
    
    if (mountCount > 1 && timeSincePrevious < 100) {
      console.warn(`[DIAGNOSTIC] ⚠️ Détection d'un cycle de montage/démontage rapide! (${timeSincePrevious}ms)`);
    }
    
    if (lastResponsiveModeRef.current !== responsive.isMobile) {
      console.log(`[DIAGNOSTIC] 📱 Changement de mode responsive: ${lastResponsiveModeRef.current ? 'Mobile' : 'Desktop'} -> ${responsive.isMobile ? 'Mobile' : 'Desktop'}`);
    }
    
    lastResponsiveModeRef.current = responsive.isMobile;
    initialRenderTimeRef.current = Date.now();
    
    // Utiliser l'utilitaire de diagnostic pour un suivi plus complet
    const cleanup = ProgrammateurTrace.component('Details', id, { location, isMobile: responsive.isMobile });
    
    return () => {
      console.log(`[DEBUG-PROBLEME] ProgrammateurDetails démonté avec ID: ${id} (Montage #${mountCount}), après ${Date.now() - initialRenderTimeRef.current}ms`);
      console.log(`[DIAGNOSTIC] ProgrammateurDetails démonté avec ID: ${id} (Montage #${mountCount})`);
      cleanup();
    };
  }, [id, location, responsive.isMobile]);
  
  console.log(`[DIAGNOSTIC] Rendu principal de ProgrammateurDetails pour ID: ${stableIdRef.current}`);
  
  // Utiliser un composant mémorisé stable pour éviter les remontages
  return (
    <StableProgrammateurContainer 
      id={stableIdRef.current} 
      ProgrammateurComponent={ProgrammateurView}
      isEditPath={isEditPath} 
    />
  );
}

export default React.memo(ProgrammateurDetails);
