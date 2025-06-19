import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';
import DevisList from '@/components/devis/DevisList';
import DevisEditor from '@/components/devis/DevisEditor';

function DevisPage() {
  const location = useLocation();
  const { getActiveTab } = useTabs();
  
  useEffect(() => {
    console.log('DevisPage rendered at:', location.pathname);
    return () => {
    };
  }, [location.pathname]);

  // Déterminer le contenu à afficher en fonction des paramètres de l'onglet
  const renderContent = () => {
    const activeTab = getActiveTab();
    
    // Si on a des paramètres d'onglet (venant du système d'onglets)
    if (activeTab?.params) {
      const { devisId, concertId, structureId } = activeTab.params;
      
      // Si on a un devisId, afficher l'éditeur pour ce devis
      if (devisId) {
        return <DevisEditor devisId={devisId} />;
      }
      
      // Si on a un concertId, créer un nouveau devis
      if (concertId) {
        return <DevisEditor concertId={concertId} structureId={structureId} />;
      }
    }
    
    // Sinon, analyser le path pour déterminer le contenu
    const path = activeTab?.path || location.pathname;
    
    if (path.includes('/nouveau')) {
      // Extraire les paramètres de query string si présents
      const urlParams = new URLSearchParams(path.split('?')[1]);
      const concertId = urlParams.get('concertId');
      const structureId = urlParams.get('structureId');
      
      return <DevisEditor concertId={concertId} structureId={structureId} />;
    } else if (path.includes('/devis/') && !path.includes('/nouveau')) {
      // Extraire l'ID du devis du path
      const segments = path.split('/');
      const devisId = segments[segments.length - 1];
      
      return <DevisEditor devisId={devisId} />;
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