// src/components/lieux/LieuDetails.js
import React, { useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import { useLieuDetailsV2 } from '@/hooks/lieux';
import LieuForm from '@/components/lieux/LieuForm';

/**
 * Composant conteneur pour les détails d'un lieu
 * Version optimisée avec mémorisation du composant responsif
 */
function LieuDetails() {
  const { id } = useParams();
  const location = useLocation();
  const responsive = useResponsive();
  
  // Utilisation du hook useLieuDetails pour gérer l'état global
  const lieuHook = useLieuDetailsV2(id);
  const { isEditing } = lieuHook;
  
  // Mémoriser le composant de vue pour éviter les recréations à chaque rendu
  const LieuView = useMemo(() => {
    console.log(`[INFO] Création du composant de vue lieu, mode: ${responsive.isMobile ? 'Mobile' : 'Desktop'}`);
    return responsive.getResponsiveComponent({
      desktopPath: 'lieux/desktop/LieuView',
      mobilePath: 'lieux/mobile/LieuView'
    });
  }, [responsive.isMobile, responsive.getResponsiveComponent]);
  
  // Logging optimisé pour le montage/démontage
  useEffect(() => {
    console.log(`[INFO] LieuDetails monté pour ID: ${id}, mode: ${responsive.isMobile ? 'Mobile' : 'Desktop'}`);
    
    return () => {
      console.log(`[INFO] LieuDetails démonté pour ID: ${id}`);
    };
  }, [id, responsive.isMobile]);
  
  // En mode édition, afficher le formulaire
  if (isEditing) {
    return <LieuForm id={id} />;
  }
  
  // En mode visualisation, utiliser le composant mémorisé
  return <LieuView id={id} lieuHook={lieuHook} />;
}

// Utilisation de React.memo pour éviter les re-rendus inutiles
export default React.memo(LieuDetails);
