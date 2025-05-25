import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Page principale des programmateurs qui gère les différentes routes
 * Version optimisée avec:
 * - Utilisation du OptimizedRouteWrapper pour une meilleure stabilité
 * - Mémoisation des routes pour réduire les re-rendus
 */
export default function ProgrammateursPage() {
  // console.log('[DEBUG][ProgrammateursPage] Page ProgrammateursPage chargée - rendu Outlet');
  
  return <Outlet />;
}
