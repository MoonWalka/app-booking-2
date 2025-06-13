// src/components/concerts/ConcertsList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import AddButton from '@/components/ui/AddButton';
import StatusBadge from '@/components/ui/StatusBadge';
// import { useConcertDelete } from '@/hooks/concerts'; // Pour extension future
import { useConcertListData } from '@/hooks/concerts/useConcertListData';
import { useConcertActions } from '@/hooks/concerts/useConcertActions';
import useConcertStatus from '@/hooks/concerts/useConcertStatus';
// import { useOrganization } from '@/context/OrganizationContext'; // Pas utilisé pour l'instant
// import { diagnosticConcerts, diagnosticDemoData } from '@/utils/concertsDiagnostic';
// import ConcertsDiagnostic from '@/components/debug/ConcertsDiagnostic';

/**
 * Liste unifiée des concerts utilisant le composant générique ListWithFilters
 * Compatible desktop/mobile avec interface responsive
 */
function ConcertsList() {
  const navigate = useNavigate();
  // const { handleDelete } = useConcertDelete(); // Pas utilisé pour l'instant
  // const { currentOrg } = useOrganization(); // Pas utilisé pour l'instant
  
  // Hooks spécialisés pour la logique métier des concerts
  const {
    concerts,
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
  } = useConcertListData();
  
  const {
    handleViewConcert,
    handleViewForm,
    handleSendForm,
    handleViewContract,
    handleGenerateContract,
    handleViewFacture,
    handleGenerateFacture
  } = useConcertActions();
  
  const {
    getStatusDetails,
    getStatusMessage
  } = useConcertStatus();


  // Configuration des colonnes pour les concerts
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
      render: (concert) => {
        if (!concert.date) return '-';
        const date = new Date(concert.date);
        const shortDate = date.toLocaleDateString('fr-FR');
        const fullDate = date.toLocaleDateString('fr-FR', { 
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
      render: (concert) => concert.lieuNom || '-',
    },
    {
      id: 'artiste',
      label: 'Artiste',
      field: 'artisteNom',
      sortable: true,
      width: '20%',
      render: (concert) => concert.artisteNom || '-',
    },
    {
      id: 'statut',
      label: 'Statut',
      field: 'statut',
      sortable: true,
      width: '15%',
      render: (concert) => {
        const statut = concert.statut || concert.status || 'contact';
        const statusDetails = getStatusDetails(concert);
        const statusMessage = getStatusMessage(concert);
        
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
      placeholder: 'Titre du concert...',
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
      placeholder: 'Ville du concert'
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
    
    items.forEach(concert => {
      // Statuts
      const statut = concert.statut || concert.status || 'contact';
      if (statutCount[statut] !== undefined) {
        statutCount[statut]++;
      }
      
      // Formulaires et contrats
      if (hasForm(concert.id)) {
        avecFormulaire++;
      }
      if (hasContract(concert.id)) {
        avecContrat++;
      }
      
      // Dates (pour extension future)
      // if (concert.date) {
      //   const date = new Date(concert.date);
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
        label: 'Total Concerts',
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

  // Actions spécifiques aux concerts (formulaires et contrats)
  const renderActions = (concert) => {
    // Logique métier des formulaires
    const getFormStatus = () => {
      const hasContact = (concert.contactIds && concert.contactIds.length > 0) || concert.contactId;
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
      
      if (hasForm(concert.id)) {
        if (hasUnvalidatedForm(concert.id)) {
          return {
            status: 'to_validate',
            icon: 'bi-exclamation-triangle',
            color: '#ffc107',
            tooltip: 'Formulaire à valider',
            disabled: false,
            action: () => handleViewForm(concert.id)
          };
        } else {
          return {
            status: 'validated',
            icon: 'bi-check-circle',
            color: '#28a745',
            tooltip: 'Formulaire validé',
            disabled: false,
            action: () => handleViewForm(concert.id)
          };
        }
      } else {
        return {
          status: 'to_send',
          icon: 'bi-envelope',
          color: '#007bff',
          tooltip: 'Envoyer formulaire au contact',
          disabled: false,
          action: () => handleSendForm(concert.id)
        };
      }
    };

    // Logique métier des contrats
    const getContractStatus = () => {
      const hasContact = (concert.contactIds && concert.contactIds.length > 0) || concert.contactId;
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
      
      if (hasContract(concert.id)) {
        const contractStatusValue = getContractStatusFromHook(concert.id);
        
        switch (contractStatusValue) {
          case 'generated':
            return {
              status: 'generated',
              icon: 'bi-file-earmark',
              color: '#17a2b8',
              tooltip: 'Contrat généré',
              disabled: false,
              action: () => {
                const contractData = getContractData(concert.id);
                if (contractData && contractData.id) {
                  handleViewContract(contractData.id);
                } else {
                  console.error('ID du contrat non trouvé pour le concert:', concert.id);
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
                const contractData = getContractData(concert.id);
                if (contractData && contractData.id) {
                  handleViewContract(contractData.id);
                } else {
                  console.error('ID du contrat non trouvé pour le concert:', concert.id);
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
                const contractData = getContractData(concert.id);
                if (contractData && contractData.id) {
                  handleViewContract(contractData.id);
                } else {
                  console.error('ID du contrat non trouvé pour le concert:', concert.id);
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
                const contractData = getContractData(concert.id);
                if (contractData && contractData.id) {
                  handleViewContract(contractData.id);
                } else {
                  console.error('ID du contrat non trouvé pour le concert:', concert.id);
                }
              }
            };
        }
      } else {
        // Pas de contrat généré - couleur selon le statut du formulaire
        const formExists = hasForm(concert.id);
        const formUnvalidated = hasUnvalidatedForm(concert.id);
        
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
          action: () => handleGenerateContract(concert.id)
        };
      }
    };

    // Logique métier des factures
    const getFactureStatusForButton = () => {
      const hasContact = (concert.contactIds && concert.contactIds.length > 0) || concert.contactId;
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
      
      if (!concert.structureId) {
        return { 
          status: 'no_structure', 
          icon: 'bi-building-x', 
          color: '#6c757d', 
          tooltip: 'Aucune structure associée',
          disabled: true,
          action: null
        };
      }
      
      if (hasFacture(concert.id)) {
        const factureStatusValue = getFactureStatus(concert.id);
        
        switch (factureStatusValue) {
          case 'generated':
            return {
              status: 'generated',
              icon: 'bi-receipt',
              color: '#17a2b8',
              tooltip: 'Facture générée',
              disabled: false,
              action: () => {
                const factureData = getFactureData(concert.id);
                if (factureData && factureData.id) {
                  handleViewFacture(factureData.id);
                } else {
                  console.error('ID de la facture non trouvé pour le concert:', concert.id);
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
                const factureData = getFactureData(concert.id);
                if (factureData && factureData.id) {
                  handleViewFacture(factureData.id);
                } else {
                  console.error('ID de la facture non trouvé pour le concert:', concert.id);
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
                const factureData = getFactureData(concert.id);
                if (factureData && factureData.id) {
                  handleViewFacture(factureData.id);
                } else {
                  console.error('ID de la facture non trouvé pour le concert:', concert.id);
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
                const factureData = getFactureData(concert.id);
                if (factureData && factureData.id) {
                  handleViewFacture(factureData.id);
                } else {
                  console.error('ID de la facture non trouvé pour le concert:', concert.id);
                }
              }
            };
        }
      } else {
        return {
          status: 'not_generated',
          icon: 'bi-receipt',
          color: '#6c757d',
          tooltip: 'Générer facture',
          disabled: false,
          action: () => handleGenerateFacture(concert.id)
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
    <AddButton
      onClick={() => navigate('/concerts/nouveau')}
      label="Nouveau concert"
    />
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (concert) => {
    handleViewConcert(concert.id);
  };

  return (
    <ListWithFilters
        entityType="concerts"
        title="Gestion des Concerts"
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
        initialData={concerts}
        loading={loading}
        error={error}
        onRefresh={refreshData}
      />
  );
}

export default ConcertsList;
