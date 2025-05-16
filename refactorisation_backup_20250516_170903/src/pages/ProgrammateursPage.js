import React from 'react';
import { useParams, Outlet } from 'react-router-dom';
import ListView from '@/components/programmateurs/ProgrammateursList';

/**
 * Page principale des programmateurs qui gère les différentes routes
 * Version optimisée avec:
 * - Utilisation du OptimizedRouteWrapper pour une meilleure stabilité
 * - Mémoisation des routes pour réduire les re-rendus
 */
export default function ProgrammateursPage() {
  const { id } = useParams();
  console.log('[TRACE-UNIQUE][ProgrammateursPage] mount, route id:', id);
  return id ? <Outlet /> : <ListView />;
}
