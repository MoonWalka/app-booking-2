// src/components/dates/DatesList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';
import ListWithFilters from '@/components/ui/ListWithFilters';
import AddButton from '@/components/ui/AddButton';
import StatusBadge from '@/components/ui/StatusBadge';
// import { useDateDelete } from '@/hooks/dates'; // Pour extension future
import { useDateListData } from '@/hooks/dates/useDateListData';
import { useDateActions } from '@/hooks/dates/useDateActions';
import useDateStatus from '@/hooks/dates/useDateStatus';
// import { useEntreprise } from '@/context/EntrepriseContext'; // Pas utilisé pour l'instant
// import { diagnosticDates, diagnosticDemoData } from '@/utils/datesDiagnostic';
// import DatesDiagnostic from '@/components/debug/DatesDiagnostic';

/**
 * Liste unifiée des dates utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 */
function DatesList() {
  const navigate = useNavigate();
  const { openDateTab } = useTabs();
  
  // DEBUG: Vérifier si le composant se monte
  console.log('[DatesList] Component mounted');
  // const { handleDelete } = useDateDelete(); // Pas utilisé pour l'instant
  // const { currentEntreprise } = useEntreprise(); // Pas utilisé pour l'instant
  
  // Hooks spécialisés pour la logique métier des dates
  const {
    dates,
    loading,
    error,
    hasForm,
    hasUnvalidatedForm,
    hasContract,
    getContractStatus: getContractStatusFromHook,
    getContractData,
    hasFacture,
    getFactureStatus,
    getFactureData,
    refreshData
  } = useDateListData();
  
  // DEBUG: Vérifier les données
  console.log('[DatesList] Data from hook:', {
    dates: dates?.length || 0,
    loading,
    error
  });
  
  const {
    // handleViewDate, // Non utilisé - remplacé par les onglets
    handleViewForm,
    handleSendForm,
    handleViewContract,
    handleGenerateContract,
    handleViewFacture,
    handleGenerateFacture
  } = useDateActions();
  
  const {
    getStatusDetails,
    getStatusMessage
  } = useDateStatus();


  // Configuration des colonnes pour les dates
  const columns = [
    {
      id: 'titre',
      label: 'Titre',
      field: 'titre',
      sortable: true,
      width: '25%',
    },
    {
      id: 'date',
      label: 'Date',
      field: 'date',
      sortable: true,
      width: '15%',
      render: (dateItem) => {
        if (!dateItem.date) return '-';
        const dateObj = new Date(dateItem.date);
        const shortDate = dateObj.toLocaleDateString('fr-FR');
        const fullDate = dateObj.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        return (
          <span title={fullDate}>
            {shortDate}
          </span>
        );
      },
    },
    {
      id: 'lieu',
      label: 'Lieu',
      field: 'lieuNom',
      sortable: true,
      width: '20%',
      render: (date) => date.lieuNom || '-',
    },
    {
      id: 'artiste',
      label: 'Artiste',
      field: 'artisteNom',
      sortable: true,
      width: '20%',
      render: (date) => date.artisteNom || '-',
    },
    {
      id: 'statut',
      label: 'Statut',
      field: 'statut',
      sortable: true,
      width: '15%',
      render: (date) => {
        const statut = date.statut || date.status || 'contact';
        const statusDetails = getStatusDetails(date);
        const statusMessage = getStatusMessage(date);
        
        const validVariant = statusDetails?.variant === 'light' ? 'secondary' : (statusDetails?.variant || 'secondary');
        return (
          <StatusBadge status={statut} variant={validVariant}>
            {statusDetails?.icon} {statusMessage?.message || statusDetails?.label || 'Contact'}
          </StatusBadge>
        );
      },
    },
  ];

  // Configuration des filtres
  const filterOptions = [
    {
      id: 'search',
      label: 'Rechercher',
      field: 'titre',
      type: 'text',
      placeholder: 'Titre du date...',
    },
    {
      id: 'statut',
      label: 'Statut',
      field: 'statut',
      type: 'select',
      placeholder: 'Tous les statuts',
      options: [
        { value: 'contact', label: '📞 Contact établi' },
        { value: 'preaccord', label: '✅ Pré-accord' },
        { value: 'contrat', label: '📄 Contrat signé' },
        { value: 'confirme', label: '🎯 Confirmé' },
        { value: 'annule', label: '❌ Annulé' },
        { value: 'reporte', label: '📅 Reporté' },
      ],
    },
    {
      id: 'dateDebut',
      label: 'Date à partir de',
      field: 'dateEvenement',
      type: 'date',
    },
  ];
  
  // Configuration des filtres avancés
  const advancedFilterOptions = [
    {
      id: 'lieu',
      label: 'Lieu',
      field: 'lieuId',
      type: 'text',
      placeholder: 'Nom du lieu'
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'lieuVille',
      type: 'text',
      placeholder: 'Ville du date'
    },
    {
      id: 'artiste',
      label: 'Artiste',
      field: 'artisteId',
      type: 'text',
      placeholder: 'Nom de l\'artiste'
    },
    {
      id: 'contact',
      label: 'Contact',
      field: 'contactIds', // Corrigé pour nouveau format
      type: 'text',
      placeholder: 'Nom du contact'
    },
    {
      id: 'contrat',
      label: 'Contrat',
      field: 'hasContrat',
      type: 'boolean',
      options: [
        { value: 'true', label: 'Avec contrat' },
        { value: 'false', label: 'Sans contrat' }
      ]
    },
    {
      id: 'periode',
      label: 'Période',
      field: 'periode',
      type: 'select',
      options: [
        { value: 'past', label: 'Passés' },
        { value: 'today', label: 'Aujourd\'hui' },
        { value: 'thisweek', label: 'Cette semaine' },
        { value: 'thismonth', label: 'Ce mois-ci' },
        { value: 'future', label: 'À venir' }
      ]
    }
  ];
  
  // Fonction de calcul des statistiques
  const calculateStats = (items) => {
    const total = items.length;
    // const now = new Date(); // Pour extension future
    
    // Stats par statut
    const statutCount = {
      contact: 0,
      preaccord: 0,
      contrat: 0,
      confirme: 0,
      annule: 0,
      reporte: 0
    };
    
    // Stats métier
    let avecFormulaire = 0;
    let avecContrat = 0;
    // let aVenir = 0; // Pour extension future
    // let ceMois = 0; // Pour extension future
    
    items.forEach(date => {
      // Statuts
      const statut = date.statut || date.status || 'contact';
      if (statutCount[statut] !== undefined) {
        statutCount[statut]++;
      }
      
      // Formulaires et contrats
      if (hasForm(date.id)) {
        avecFormulaire++;
      }
      if (hasContract(date.id)) {
        avecContrat++;
      }
      
      // Dates (pour extension future)
      // if (date.date) {
      //   const date = new Date(date.date);
      //   if (date >= now) {
      //     aVenir++;
      //     if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      //       ceMois++;
      //     }
      //   }
      // }
    });
    
    return [
      {
        id: 'total',
        label: 'Total Dates',
        value: total,
        icon: 'bi bi-calendar-event',
        variant: 'primary'
      },
      {
        id: 'confirmes',
        label: 'Confirmés',
        value: statutCount.confirme,
        icon: 'bi bi-check-circle',
        variant: 'success',
        subtext: `${Math.round((statutCount.confirme / total) * 100) || 0}%`
      },
      {
        id: 'formulaires',
        label: 'Avec formulaire',
        value: avecFormulaire,
        icon: 'bi bi-file-earmark-text',
        variant: 'info',
        subtext: `${Math.round((avecFormulaire / total) * 100) || 0}%`
      },
      {
        id: 'contrats',
        label: 'Avec contrat',
        value: avecContrat,
        icon: 'bi bi-file-earmark-check',
        variant: 'warning',
        subtext: `${Math.round((avecContrat / total) * 100) || 0}%`
      }
    ];
  };

  // Actions spécifiques aux dates (formulaires et contrats)
  const renderActions = (date) => {
    // Logique métier des formulaires
    const getFormStatus = () => {
      const hasContact = (date.contactIds && date.contactIds.length > 0) || date.contactId;
      if (!hasContact) {
        return { 
          status: 'no_contact', 
          icon: 'bi-person-x', 
          color: '#6c757d', 
          tooltip: 'Aucun contact associé',
          disabled: true,
          action: null
        };
      }
      
      if (hasForm(date.id)) {
        if (hasUnvalidatedForm(date.id)) {
          return {
            status: 'to_validate',
            icon: 'bi-exclamation-triangle',
            color: '#ffc107',
            tooltip: 'Formulaire à valider',
            disabled: false,
            action: () => handleViewForm(date.id)
          };
        } else {
          return {
            status: 'validated',
            icon: 'bi-check-circle',
            color: '#28a745',
            tooltip: 'Formulaire validé',
            disabled: false,
            action: () => handleViewForm(date.id)
          };
        }
      } else {
        return {
          status: 'to_send',
          icon: 'bi-envelope',
          color: '#007bff',
          tooltip: 'Envoyer formulaire au contact',
          disabled: false,
          action: () => handleSendForm(date.id)
        };
      }
    };

    // Logique métier des contrats
    const getContractStatus = () => {
      const hasContact = (date.contactIds && date.contactIds.length > 0) || date.contactId;
      if (!hasContact) {
        return { 
          status: 'no_contact', 
          icon: 'bi-person-x', 
          color: '#6c757d', 
          tooltip: 'Aucun contact associé',
          disabled: true,
          action: null
        };
      }
      
      if (hasContract(date.id)) {
        const contractStatusValue = getContractStatusFromHook(date.id);
        
        switch (contractStatusValue) {
          case 'generated':
            return {
              status: 'generated',
              icon: 'bi-file-earmark',
              color: '#17a2b8',
              tooltip: 'Contrat généré',
              disabled: false,
              action: () => {
                const contractData = getContractData(date.id);
                if (contractData && contractData.id) {
                  handleViewContract(contractData.id);
                } else {
                  console.error('ID du contrat non trouvé pour le date:', date.id);
                }
              }
            };
          case 'sent':
            return {
              status: 'sent',
              icon: 'bi-send',
              color: '#ffc107',
              tooltip: 'Contrat envoyé',
              disabled: false,
              action: () => {
                const contractData = getContractData(date.id);
                if (contractData && contractData.id) {
                  handleViewContract(contractData.id);
                } else {
                  console.error('ID du contrat non trouvé pour le date:', date.id);
                }
              }
            };
          case 'signed':
            return {
              status: 'signed',
              icon: 'bi-check-circle',
              color: '#28a745',
              tooltip: 'Contrat signé',
              disabled: false,
              action: () => {
                const contractData = getContractData(date.id);
                if (contractData && contractData.id) {
                  handleViewContract(contractData.id);
                } else {
                  console.error('ID du contrat non trouvé pour le date:', date.id);
                }
              }
            };
          default:
            return {
              status: 'view',
              icon: 'bi-eye',
              color: '#6c757d',
              tooltip: 'Voir contrat',
              disabled: false,
              action: () => {
                const contractData = getContractData(date.id);
                if (contractData && contractData.id) {
                  handleViewContract(contractData.id);
                } else {
                  console.error('ID du contrat non trouvé pour le date:', date.id);
                }
              }
            };
        }
      } else {
        // Pas de contrat généré - couleur selon le statut du formulaire
        const formExists = hasForm(date.id);
        const formUnvalidated = hasUnvalidatedForm(date.id);
        
        let color, tooltip;
        if (formExists && !formUnvalidated) {
          // Formulaire envoyé/validé mais contrat pas encore généré
          color = '#ffc107'; // Jaune/orange
          tooltip = 'Formulaire prêt - Générer contrat';
        } else {
          // Aucun formulaire ou formulaire en cours
          color = '#6c757d'; // Gris neutre
          tooltip = 'Générer contrat';
        }
        
        return {
          status: 'not_generated',
          icon: 'bi-file-earmark-plus',
          color: color,
          tooltip: tooltip,
          disabled: false,
          action: () => handleGenerateContract(date.id)
        };
      }
    };

    // Logique métier des factures
    const getFactureStatusForButton = () => {
      const hasContact = (date.contactIds && date.contactIds.length > 0) || date.contactId;
      if (!hasContact) {
        return { 
          status: 'no_contact', 
          icon: 'bi-person-x', 
          color: '#6c757d', 
          tooltip: 'Aucun contact associé',
          disabled: true,
          action: null
        };
      }
      
      if (!date.structureId) {
        return { 
          status: 'no_structure', 
          icon: 'bi-building-x', 
          color: '#6c757d', 
          tooltip: 'Aucune structure associée',
          disabled: true,
          action: null
        };
      }
      
      // Vérifier si le contrat a une facture liée
      const contractData = getContractData(date.id);
      const hasFactureFromContract = contractData && contractData.factureId;
      
      if (hasFactureFromContract || hasFacture(date.id)) {
        // Utiliser le statut de la facture du contrat si elle existe
        const factureStatusValue = hasFactureFromContract 
          ? (contractData.factureStatus || 'generated')
          : getFactureStatus(date.id);
        
        switch (factureStatusValue) {
          case 'generated':
            return {
              status: 'generated',
              icon: 'bi-receipt',
              color: '#17a2b8',
              tooltip: 'Facture générée',
              disabled: false,
              action: () => {
                // Prioriser la facture du contrat
                if (hasFactureFromContract) {
                  handleViewFacture(contractData.factureId);
                } else {
                  const factureData = getFactureData(date.id);
                  if (factureData && factureData.id) {
                    handleViewFacture(factureData.id);
                  } else {
                    console.error('ID de la facture non trouvé pour le date:', date.id);
                  }
                }
              }
            };
          case 'sent':
            return {
              status: 'sent',
              icon: 'bi-send',
              color: '#ffc107',
              tooltip: 'Facture envoyée',
              disabled: false,
              action: () => {
                // Prioriser la facture du contrat
                if (hasFactureFromContract) {
                  handleViewFacture(contractData.factureId);
                } else {
                  const factureData = getFactureData(date.id);
                  if (factureData && factureData.id) {
                    handleViewFacture(factureData.id);
                  } else {
                    console.error('ID de la facture non trouvé pour le date:', date.id);
                  }
                }
              }
            };
          case 'paid':
            return {
              status: 'paid',
              icon: 'bi-check-circle',
              color: '#28a745',
              tooltip: 'Facture payée',
              disabled: false,
              action: () => {
                // Prioriser la facture du contrat
                if (hasFactureFromContract) {
                  handleViewFacture(contractData.factureId);
                } else {
                  const factureData = getFactureData(date.id);
                  if (factureData && factureData.id) {
                    handleViewFacture(factureData.id);
                  } else {
                    console.error('ID de la facture non trouvé pour le date:', date.id);
                  }
                }
              }
            };
          default:
            return {
              status: 'view',
              icon: 'bi-eye',
              color: '#6c757d',
              tooltip: 'Voir facture',
              disabled: false,
              action: () => {
                // Prioriser la facture du contrat
                if (hasFactureFromContract) {
                  handleViewFacture(contractData.factureId);
                } else {
                  const factureData = getFactureData(date.id);
                  if (factureData && factureData.id) {
                    handleViewFacture(factureData.id);
                  } else {
                    console.error('ID de la facture non trouvé pour le date:', date.id);
                  }
                }
              }
            };
        }
      } else {
        // Pas de facture générée - vérifier si on peut en générer une
        if (!hasContract(date.id)) {
          return {
            status: 'no_contract',
            icon: 'bi-file-earmark-x',
            color: '#6c757d',
            tooltip: 'Contrat requis pour facturer',
            disabled: true,
            action: null
          };
        }
        
        const contractStatusValue = getContractStatusFromHook(date.id);
        // Un contrat peut être facturé s'il est finalisé, signé ou envoyé
        const isContractFacturable = contractStatusValue === 'signed' || contractStatusValue === 'finalized' || contractStatusValue === 'sent';
        
        if (!isContractFacturable) {
          return {
            status: 'contract_not_ready',
            icon: 'bi-pen',
            color: '#6c757d',
            tooltip: 'Contrat en cours',
            disabled: true,
            action: null
          };
        }
        
        // Contrat signé, on peut générer une facture
        return {
          status: 'not_generated',
          icon: 'bi-receipt',
          color: '#ffc107',
          tooltip: 'Générer facture',
          disabled: false,
          action: () => {
            // Récupérer le contratId s'il existe
            const contractData = getContractData(date.id);
            const contratId = contractData?.id || null;
            handleGenerateFacture(date.id, contratId);
          }
        };
      }
    };

    const formStatus = getFormStatus();
    const contractStatus = getContractStatus();
    const factureStatus = getFactureStatusForButton();

    const handleFormClick = (e) => {
      e.stopPropagation();
      if (formStatus.action && !formStatus.disabled) {
        formStatus.action();
      }
    };

    const handleContractClick = (e) => {
      e.stopPropagation();
      if (contractStatus.action && !contractStatus.disabled) {
        contractStatus.action();
      }
    };

    const handleFactureClick = (e) => {
      e.stopPropagation();
      if (factureStatus.action && !factureStatus.disabled) {
        factureStatus.action();
      }
    };

    return (
      <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
        {/* Bouton Formulaire */}
        <button 
          style={{
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: formStatus.disabled ? 'not-allowed' : 'pointer',
            backgroundColor: formStatus.color,
            color: 'white',
            fontSize: '12px',
            opacity: formStatus.disabled ? 0.6 : 1
          }}
          onClick={handleFormClick}
          title={formStatus.tooltip}
          disabled={formStatus.disabled}
        >
          <i className={formStatus.icon}></i> Formulaire
        </button>
        
        {/* Bouton Contrat */}
        <button 
          style={{
            padding: '6px 12px',
            border: 'none', 
            borderRadius: '4px',
            cursor: contractStatus.disabled ? 'not-allowed' : 'pointer',
            backgroundColor: contractStatus.color,
            color: 'white',
            fontSize: '12px',
            opacity: contractStatus.disabled ? 0.6 : 1
          }}
          onClick={handleContractClick}
          title={contractStatus.tooltip}
          disabled={contractStatus.disabled}
        >
          <i className={contractStatus.icon}></i> Contrat
        </button>
        
        {/* Bouton Facture */}
        <button 
          style={{
            padding: '6px 12px',
            border: 'none', 
            borderRadius: '4px',
            cursor: factureStatus.disabled ? 'not-allowed' : 'pointer',
            backgroundColor: factureStatus.color,
            color: 'white',
            fontSize: '12px',
            opacity: factureStatus.disabled ? 0.6 : 1
          }}
          onClick={handleFactureClick}
          title={factureStatus.tooltip}
          disabled={factureStatus.disabled}
        >
          <i className={factureStatus.icon}></i> Facture
        </button>
      </div>
    );
  };

  // Actions de l'en-tête
  const headerActions = (
    <>
      <AddButton
        onClick={() => navigate('/dates/nouveau')}
        label="Nouvelle date"
      />
      {/* DEBUG: Bouton temporaire pour créer une date de test */}
      <button
        onClick={async () => {
          try {
            const { addDoc, collection, db } = await import('@/services/firebase-service');
            const { currentEntreprise } = await import('@/context/EntrepriseContext').then(m => m.useEntreprise());
            
            const testDate = {
              titre: 'Date de test - ' + new Date().toLocaleTimeString(),
              date: new Date('2024-12-31').toISOString(),
              heure: '20:00',
              lieuNom: 'Salle de test',
              artisteNom: 'Artiste de test',
              statut: 'contact',
              organizationId: '9LjkCJG04pEzbABdHkSf', // L'ID qu'on a vu dans les logs
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            const docRef = await addDoc(collection(db, 'dates'), testDate);
            console.log('Date de test créée:', docRef.id);
            refreshData(); // Rafraîchir la liste
          } catch (error) {
            console.error('Erreur création date test:', error);
          }
        }}
        style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        DEBUG: Créer date test
      </button>
    </>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (date) => {
    const dateTitle = date.titre || `Date du ${date.date ? new Date(date.date).toLocaleDateString('fr-FR') : ''}`;
    openDateTab(date.id, dateTitle);
  };

  return (
    <ListWithFilters
        entityType="dates"
        title="Gestion des Dates"
        columns={columns}
        filterOptions={filterOptions}
        sort={{ field: 'date', direction: 'desc' }}
        actions={headerActions}
        onRowClick={handleRowClick}
        renderActions={renderActions}
        pageSize={20}
        showRefresh={true}
        showStats={true}
        calculateStats={calculateStats}
        showAdvancedFilters={true}
        advancedFilterOptions={advancedFilterOptions}
        // Données et état depuis les hooks spécialisés
        initialData={dates}
        loading={loading}
        error={error}
        onRefresh={refreshData}
      />
  );
}

export default DatesList;
