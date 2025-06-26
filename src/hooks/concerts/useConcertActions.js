import { useNavigate } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';

/**
 * Hook to manage concert action handlers
 */
export const useConcertActions = () => {
  const navigate = useNavigate();
  const { openTab } = useTabs();
  
  // Navigation function to view concert details
  const handleViewConcert = (concertId) => {
    navigate(`/concerts/${concertId}`);
  };
  
  // Function to navigate to form page
  const handleViewForm = (concertId) => {
    navigate(`/concerts/${concertId}/form`);
  };
  
  // Function to send a form (navigate to form management page)
  const handleSendForm = (concertId) => {
    navigate(`/concerts/${concertId}/form`);
  };
  
  // Function to navigate to contract page
  const handleViewContract = (contractId) => {
    console.log('[useConcertActions] Ouverture contrat dans onglet:', contractId);
    openTab({
      id: `contrat-${contractId}`,
      title: `Contrat`,
      path: `/contrats/${contractId}`,
      component: 'ContratDetailsPage',
      params: { 
        contratId: contractId
      },
      icon: 'bi-file-earmark-text'
    });
  };
  
  // Function to generate a new contract
  const handleGenerateContract = (concertId) => {
    console.log('[useConcertActions] Ouverture génération contrat dans onglet pour concert:', concertId);
    openTab({
      id: `contrat-generate-${concertId}`,
      title: `Nouveau contrat`,
      path: `/contrats/generate/${concertId}`,
      component: 'ContratGenerationNewPage',
      params: { 
        concertId: concertId
      },
      icon: 'bi-file-earmark-plus'
    });
  };
  
  // Function to navigate to facture page
  const handleViewFacture = (factureId) => {
    console.log('[useConcertActions] === DÉBUT handleViewFacture ===');
    console.log('[useConcertActions] Ouverture facture dans onglet:', factureId);
    console.log('[useConcertActions] Paramètres de l\'onglet:', {
      id: `facture-${factureId}`,
      title: `Facture`,
      path: `/factures/${factureId}`,
      component: 'FactureDetailsPage',
      params: { factureId }
    });
    
    try {
      openTab({
        id: `facture-${factureId}`,
        title: `Facture`,
        path: `/factures/${factureId}`,
        component: 'FactureDetailsPage',
        params: { 
          factureId: factureId
        },
        icon: 'bi-receipt'
      });
      console.log('[useConcertActions] openTab appelé avec succès');
    } catch (error) {
      console.error('[useConcertActions] Erreur lors de l\'ouverture de l\'onglet:', error);
    }
    
    console.log('[useConcertActions] === FIN handleViewFacture ===');
  };
  
  // Function to generate a new facture
  const handleGenerateFacture = (concertId, contratId = null) => {
    console.log('[useConcertActions] === DÉBUT handleGenerateFacture ===');
    console.log('[useConcertActions] Ouverture génération facture dans onglet pour concert:', concertId);
    console.log('[useConcertActions] ContratId:', contratId);
    console.log('[useConcertActions] Paramètres de l\'onglet:', {
      id: `facture-generate-${concertId}`,
      title: `Nouvelle facture`,
      path: `/factures/generate/${concertId}?fromContrat=true`,
      component: 'FactureGeneratorPage',
      params: { concertId, fromContrat: true, contratId }
    });
    
    try {
      openTab({
        id: `facture-generate-${concertId}`,
        title: `Nouvelle facture`,
        path: `/factures/generate/${concertId}?fromContrat=true`,
        component: 'FactureGeneratorPage',
        params: { 
          concertId: concertId,
          fromContrat: true,
          contratId: contratId
        },
        icon: 'bi-receipt'
      });
      console.log('[useConcertActions] openTab appelé avec succès');
    } catch (error) {
      console.error('[useConcertActions] Erreur lors de l\'ouverture de l\'onglet:', error);
    }
    
    console.log('[useConcertActions] === FIN handleGenerateFacture ===');
  };
  
  return {
    handleViewConcert,
    handleViewForm,
    handleSendForm,
    handleViewContract,
    handleGenerateContract,
    handleViewFacture,
    handleGenerateFacture
  };
};

export default useConcertActions;