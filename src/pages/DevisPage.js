import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';
import DevisList from '@/components/devis/DevisList';
import DevisEditor from '@/components/devis/DevisEditor';

function DevisPage({ devisId, dateId, structureId }) {
  const location = useLocation();
  const { getActiveTab } = useTabs();
  
  useEffect(() => {
    console.log('DevisPage rendered at:', location.pathname);
    console.log('DevisPage props:', { devisId, dateId, structureId });
    return () => {
    };
  }, [location.pathname, devisId, dateId, structureId]);

  // Déterminer le contenu à afficher en fonction des paramètres de l'onglet
  const renderContent = () => {
    const activeTab = getActiveTab();
    
    console.log('[DevisPage] renderContent - activeTab:', activeTab);
    console.log('[DevisPage] renderContent - location.pathname:', location.pathname);
    console.log('[DevisPage] Props reçues - devisId:', devisId, 'dateId:', dateId, 'structureId:', structureId);
    
    // Priorité 1 : utiliser les props passées directement depuis TabManager
    if (devisId) {
      console.log('[DevisPage] Utilisation du devisId depuis les props:', devisId);
      return <DevisEditor devisId={devisId} />;
    }
    
    if (dateId) {
      console.log('[DevisPage] Utilisation du dateId depuis les props:', dateId);
      return <DevisEditor dateId={dateId} structureId={structureId} />;
    }
    
    // Priorité 2 : Si on a des paramètres d'onglet (venant du système d'onglets)
    if (activeTab?.params) {
      const { devisId: tabDevisId, dateId: tabDateId, structureId: tabStructureId } = activeTab.params;
      
      console.log('[DevisPage] Params de l\'onglet actif:', activeTab.params);
      console.log('[DevisPage] tabDevisId:', tabDevisId, 'tabDateId:', tabDateId, 'tabStructureId:', tabStructureId);
      
      // Si on a un devisId, afficher l'éditeur pour ce devis
      if (tabDevisId) {
        console.log('[DevisPage] Affichage de DevisEditor avec tabDevisId:', tabDevisId);
        return <DevisEditor devisId={tabDevisId} />;
      }
      
      // Si on a un dateId, créer un nouveau devis
      if (tabDateId) {
        console.log('[DevisPage] Affichage de DevisEditor avec tabDateId:', tabDateId);
        return <DevisEditor dateId={tabDateId} structureId={tabStructureId} />;
      }
    }
    
    // Priorité 3 : analyser le path pour déterminer le contenu
    const path = activeTab?.path || location.pathname;
    console.log('[DevisPage] Analyse du path:', path);
    
    if (path.includes('/nouveau')) {
      // Extraire les paramètres de query string si présents
      const urlParams = new URLSearchParams(path.split('?')[1]);
      const pathDateId = urlParams.get('dateId');
      const pathStructureId = urlParams.get('structureId');
      console.log('[DevisPage] Path nouveau devis - dateId:', pathDateId, 'structureId:', pathStructureId);
      
      return <DevisEditor dateId={pathDateId} structureId={pathStructureId} />;
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