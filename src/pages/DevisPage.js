import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';
import DevisList from '@/components/devis/DevisList';
import DevisEditor from '@/components/devis/DevisEditor';

function DevisPage({ devisId, concertId, structureId }) {
  const location = useLocation();
  const { getActiveTab } = useTabs();
  
  useEffect(() => {
    console.log('DevisPage rendered at:', location.pathname);
    console.log('DevisPage props:', { devisId, concertId, structureId });
    return () => {
    };
  }, [location.pathname, devisId, concertId, structureId]);

  // Déterminer le contenu à afficher en fonction des paramètres de l'onglet
  const renderContent = () => {
    const activeTab = getActiveTab();
    
    console.log('[DevisPage] renderContent - activeTab:', activeTab);
    console.log('[DevisPage] renderContent - location.pathname:', location.pathname);
    console.log('[DevisPage] Props reçues - devisId:', devisId, 'concertId:', concertId, 'structureId:', structureId);
    
    // Priorité 1 : utiliser les props passées directement depuis TabManager
    if (devisId) {
      console.log('[DevisPage] Utilisation du devisId depuis les props:', devisId);
      return <DevisEditor devisId={devisId} />;
    }
    
    if (concertId) {
      console.log('[DevisPage] Utilisation du concertId depuis les props:', concertId);
      return <DevisEditor concertId={concertId} structureId={structureId} />;
    }
    
    // Priorité 2 : Si on a des paramètres d'onglet (venant du système d'onglets)
    if (activeTab?.params) {
      const { devisId: tabDevisId, concertId: tabConcertId, structureId: tabStructureId } = activeTab.params;
      
      console.log('[DevisPage] Params de l\'onglet actif:', activeTab.params);
      console.log('[DevisPage] tabDevisId:', tabDevisId, 'tabConcertId:', tabConcertId, 'tabStructureId:', tabStructureId);
      
      // Si on a un devisId, afficher l'éditeur pour ce devis
      if (tabDevisId) {
        console.log('[DevisPage] Affichage de DevisEditor avec tabDevisId:', tabDevisId);
        return <DevisEditor devisId={tabDevisId} />;
      }
      
      // Si on a un concertId, créer un nouveau devis
      if (tabConcertId) {
        console.log('[DevisPage] Affichage de DevisEditor avec tabConcertId:', tabConcertId);
        return <DevisEditor concertId={tabConcertId} structureId={tabStructureId} />;
      }
    }
    
    // Priorité 3 : analyser le path pour déterminer le contenu
    const path = activeTab?.path || location.pathname;
    console.log('[DevisPage] Analyse du path:', path);
    
    if (path.includes('/nouveau')) {
      // Extraire les paramètres de query string si présents
      const urlParams = new URLSearchParams(path.split('?')[1]);
      const pathConcertId = urlParams.get('concertId');
      const pathStructureId = urlParams.get('structureId');
      console.log('[DevisPage] Path nouveau devis - concertId:', pathConcertId, 'structureId:', pathStructureId);
      
      return <DevisEditor concertId={pathConcertId} structureId={pathStructureId} />;
    } else if (path.includes('/devis/') && !path.includes('/nouveau')) {
      // Extraire l'ID du devis du path
      const segments = path.split('/');
      const pathDevisId = segments[segments.length - 1];
      console.log('[DevisPage] Path devis existant - devisId extrait:', pathDevisId);
      
      return <DevisEditor devisId={pathDevisId} />;
    }
    
    // Par défaut, afficher la liste
    return <DevisList />;
  };
  
  return (
    <div className="devis-page">
      {renderContent()}
    </div>
  );
}

export default DevisPage;