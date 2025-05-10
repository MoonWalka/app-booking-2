import React, { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProgrammateursList from '@/components/programmateurs/ProgrammateursList';
import ProgrammateurDetails from '@/components/programmateurs/ProgrammateurDetails';
import ProgrammateurForm from '@/components/programmateurs/ProgrammateurForm';
import OptimizedRouteWrapper from '@/utils/OptimizedRouteWrapper';

/**
 * Page principale des programmateurs qui gère les différentes routes
 * Version optimisée avec:
 * - Utilisation du OptimizedRouteWrapper pour une meilleure stabilité
 * - Mémoisation des routes pour réduire les re-rendus
 */
const ProgrammateursPage = () => {
  console.log('[DEBUG] [ProgrammateursPage] Rendu de la page principale des programmateurs');
  // Mémoriser les routes pour éviter les recreations à chaque rendu
  const programmateurRoutes = useMemo(() => {
    console.log('[DEBUG] [ProgrammateursPage] Création des routes des programmateurs');
    return (
      <Routes>
        <Route path="/" element={<ProgrammateursList />} />
        <Route path="/nouveau" element={<ProgrammateurForm />} />
        <Route path="/edit/:id" element={
          <OptimizedRouteWrapper delay={100} spinnerMessage="Chargement du formulaire d'édition...">
            {console.log('[DEBUG] [ProgrammateursPage] Route /edit/:id sélectionnée')}
            <ProgrammateurForm />
          </OptimizedRouteWrapper>
        } />
        <Route path=":id" element={
          <OptimizedRouteWrapper delay={150} spinnerMessage="Chargement du programmateur...">
            {console.log('[DEBUG] [ProgrammateursPage] Route /:id sélectionnée')}
            <ProgrammateurDetails />
          </OptimizedRouteWrapper>
        } />
      </Routes>
    );
  }, []);

  return (
    <div className="programmateurs-container">
      {console.log('[DEBUG] [ProgrammateursPage] Rendu du container principal')}
      <h1>Programmateurs</h1>
      {programmateurRoutes}
    </div>
  );
};

// Utiliser React.memo pour éviter les re-rendus inutiles de la page
export default React.memo(ProgrammateursPage);
