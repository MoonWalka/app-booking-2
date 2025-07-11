import { useNavigate } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';

/**
 * Hook to manage date action handlers
 */
export const useDateActions = () => {
  const navigate = useNavigate();
  const { openTab, openDateDetailsTab } = useTabs();
  
  // Navigation function to view date details
  const handleViewDate = (dateId) => {
    // Utiliser le système d'onglets au lieu de navigate
    if (openDateDetailsTab) {
      openDateDetailsTab(dateId, 'Détails de la date');
    } else {
      // Fallback avec openTab générique
      openTab({
        id: `date-${dateId}`,
        title: `Date`,
        path: `/dates/${dateId}`,
        component: 'DateDetailsPage',
        params: { dateId },
        icon: 'bi-calendar-event'
      });
    }
  };
  
  // Function to navigate to form page
  const handleViewForm = (dateId) => {
    navigate(`/dates/${dateId}/form`);
  };
  
  // Function to send a form (navigate to form management page)
  const handleSendForm = (dateId) => {
    navigate(`/dates/${dateId}/form`);
  };
  
  // Function to navigate to contract page
  const handleViewContract = (contractId) => {
    console.log('[useDateActions] Ouverture contrat dans onglet:', contractId);
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
  const handleGenerateContract = (dateId) => {
    console.log('[useDateActions] Ouverture génération contrat dans onglet pour date:', dateId);
    openTab({
      id: `contrat-generate-${dateId}`,
      title: `Nouveau contrat`,
      path: `/contrats/generate/${dateId}`,
      component: 'ContratGenerationNewPage',
      params: { 
        dateId: dateId
      },
      icon: 'bi-file-earmark-plus'
    });
  };
  
  // Function to navigate to facture page
  const handleViewFacture = (factureId) => {
    console.log('[useDateActions] === DÉBUT handleViewFacture ===');
    console.log('[useDateActions] Ouverture facture dans onglet:', factureId);
    console.log('[useDateActions] Paramètres de l\'onglet:', {
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
        component: 'FactureGeneratorPage', // Remplacement de FactureDetailsPage
        params: { 
          factureId: factureId
        },
        icon: 'bi-receipt'
      });
      console.log('[useDateActions] openTab appelé avec succès');
    } catch (error) {
      console.error('[useDateActions] Erreur lors de l\'ouverture de l\'onglet:', error);
    }
    
    console.log('[useDateActions] === FIN handleViewFacture ===');
  };
  
  // Function to generate a new facture
  const handleGenerateFacture = (dateId, contratId = null) => {
    console.log('[useDateActions] === DÉBUT handleGenerateFacture ===');
    console.log('[useDateActions] Ouverture génération facture dans onglet pour date:', dateId);
    console.log('[useDateActions] ContratId:', contratId);
    console.log('[useDateActions] Paramètres de l\'onglet:', {
      id: `facture-generate-${dateId}`,
      title: `Nouvelle facture`,
      path: `/factures/generate/${dateId}?fromContrat=true`,
      component: 'FactureGeneratorPage',
      params: { dateId, fromContrat: true, contratId }
    });
    
    try {
      openTab({
        id: `facture-generate-${dateId}`,
        title: `Nouvelle facture`,
        path: `/factures/generate/${dateId}?fromContrat=true`,
        component: 'FactureGeneratorPage',
        params: { 
          dateId: dateId,
          fromContrat: true,
          contratId: contratId
        },
        icon: 'bi-receipt'
      });
      console.log('[useDateActions] openTab appelé avec succès');
    } catch (error) {
      console.error('[useDateActions] Erreur lors de l\'ouverture de l\'onglet:', error);
    }
    
    console.log('[useDateActions] === FIN handleGenerateFacture ===');
  };
  
  return {
    handleViewDate,
    handleViewForm,
    handleSendForm,
    handleViewContract,
    handleGenerateContract,
    handleViewFacture,
    handleGenerateFacture
  };
};

export default useDateActions;