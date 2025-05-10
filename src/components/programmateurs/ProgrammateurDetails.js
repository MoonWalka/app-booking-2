// src/components/programmateurs/ProgrammateurDetails.js
import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import { useProgrammateurDetailsV2 } from '@/hooks/programmateurs';
import ProgrammateurForm from '@/components/programmateurs/ProgrammateurForm';

// Log après imports (pour respecter import/first)
console.log('[DEBUG][ProgrammateurDetails] APRES imports');
console.log('[TEST-TRACE-UNIQUE][ProgrammateurDetails] Ce fichier est bien exécuté !');

/**
 * Composant conteneur pour les détails d'un programmateur
 * Version simplifiée avec structure optimisée et logs réduits
 */
function ProgrammateurDetails() {
  console.log('[DEBUG][ProgrammateurDetails] Entrée dans la fonction composant');
  let step = 1;
  // Hooks commentés pour test d'isolation du blocage
  // const { id } = useParams();
  // const location = useLocation();
  const responsive = useResponsive();
  // const detailsHook = useProgrammateurDetailsV2(id);
  // const stableIdRef = useRef(id);
  const ProgrammateurView = responsive.getResponsiveComponent({
    desktopPath: 'programmateurs/desktop/ProgrammateurView',
    mobilePath: 'programmateurs/mobile/ProgrammateurView',
    fallback: <div>Chargement de la vue programmateur...</div>
  });
  // const isEditPath = location.pathname.includes('/edit/');

  // ...rendu minimal pour test...
  console.log(`[DEBUG][ProgrammateurDetails] step ${step++}: après hooks (hooks commentés)`);
  return <ProgrammateurView />;
}

// Utilisation de React.memo pour éviter les re-rendus inutiles
export default React.memo(ProgrammateurDetails);
