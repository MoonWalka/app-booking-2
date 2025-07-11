import React, { useState, useMemo } from 'react';
import { useTabs } from '@/context/TabsContext';
import Table from '@/components/ui/Table';
import ActionButtons from '@/components/ui/ActionButtons';
import EntityEmptyState from '@/components/ui/EntityEmptyState';
import Alert from '@/components/ui/Alert';
import NiveauDisplay from './NiveauDisplay';
import styles from '@/pages/TableauDeBordPage.module.css';
import datesTableStyles from '@/shared/tableConfigs/datesTableStyles.module.css';

/**
 * Composant commun pour afficher un tableau de dates
 * Utilisé par TableauDeBordPage et ContactDatesTable
 * @param {Array} dates - Liste des dates à afficher
 * @param {boolean} loading - État de chargement
 * @param {string} error - Message d'erreur éventuel
 * @param {Function} onDelete - Callback pour supprimer un date
 * @param {Function} onEdit - Callback pour éditer un date
 * @param {boolean} showSearch - Afficher la barre de recherche (true par défaut)
 */
const DatesTableView = ({ 
  dates = [], 
  loading = false, 
  error = null,
  onDelete,
  onEdit,
  showSearch = true,
  // Nouvelles props pour gérer les contrats et factures
  hasContractFunc,
  getContractStatus,
  getContractData,
  hasFacture,
  getFactureStatus,
  getFactureData,
  handleViewFacture,
  handleGenerateFacture
}) => {
  const { openTab, openPreContratTab, openContratTab, openNewDevisTab, openDevisTab, openDateDetailsTab } = useTabs();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Configuration des colonnes du tableau
  const columns = [
    {
      label: 'Entreprise',
      key: 'entreprise',
      sortable: true,
      render: (item) => (
        <span className={styles.entrepriseCell}>
          {item.entrepriseNom || item.entreprise?.nom || '—'}
        </span>
      )
    },
    {
      label: 'Collaborateur',
      key: 'collaborateur',
      sortable: true,
      render: (item) => (
        <span className={styles.collaborateurCell}>
          {item.collaborateurNom || item.collaborateur?.nom || '—'}
        </span>
      )
    },
    {
      label: 'Niveau',
      key: 'niveau',
      sortable: true,
      render: (item) => <NiveauDisplay niveau={item.niveau || 'incomplete'} />
    },
    {
      label: 'Artiste',
      key: 'artisteNom',
      sortable: true,
      render: (item) => (
        <span className={styles.artisteCell}>
          {item.artisteNom || 'Non spécifié'}
        </span>
      )
    },
    {
      label: 'Projet',
      key: 'projet',
      sortable: true,
      render: (item) => (
        <span className={styles.projetCell}>
          {item.formule || item.projet || item.projetNom || '—'}
        </span>
      )
    },
    {
      label: 'Lieu',
      key: 'lieuNom',
      sortable: true,
      render: (item) => (
        <div className={styles.lieuCell}>
          <div className={styles.lieuNom}>
            {item.libelle || item.titre || item.lieuNom || item.lieu?.nom || 'Non spécifié'}
          </div>
          {(item.lieuVille || item.lieu?.ville) && (
            <div className={styles.lieuVille}>
              {item.lieuVille || item.lieu?.ville}
            </div>
          )}
        </div>
      )
    },
    {
      label: 'Organisateur',
      key: 'organisateur',
      sortable: true,
      render: (item) => (
        <span className={styles.organisateurCell}>
          {item.organisateurNom || item.organisateur?.nom || item.structureNom || item.structure?.nom || '—'}
        </span>
      )
    },
    {
      label: 'Dossier',
      key: 'dossier',
      sortable: true,
      render: (item) => (
        <span className={styles.dossierCell}>
          {item.dossier || item.numeroDossier || '—'}
        </span>
      )
    },
    {
      label: "Prise d'option",
      key: 'priseOption',
      sortable: true,
      render: (item) => {
        const date = item.priseOption?.toDate ? item.priseOption.toDate() : 
                     item.priseOption ? new Date(item.priseOption) : null;
        return date ? (
          <span className={styles.dateCell}>
            {date.toLocaleDateString('fr-FR')}
          </span>
        ) : '—';
      }
    },
    {
      label: 'Contrat proposé',
      key: 'contrat',
      sortable: true,
      render: (item) => {
        const typeContrat = item.typeContrat || item.contratType || 'Aucun';
        const getContratBadge = (type) => {
          switch (type.toLowerCase()) {
            case 'standard':
              return { color: '#007bff', label: 'Standard' };
            case 'premium':
              return { color: '#28a745', label: 'Premium' };
            case 'basic':
              return { color: '#ffc107', label: 'Basic' };
            case 'custom':
            case 'personnalisé':
              return { color: '#6f42c1', label: 'Personnalisé' };
            case 'aucun':
            default:
              return { color: '#6c757d', label: 'Aucun' };
          }
        };
        
        const badgeInfo = getContratBadge(typeContrat);
        
        return (
          <div className={styles.contratTypeCell}>
            <span 
              className={styles.contratTypeBadge}
              style={{ backgroundColor: badgeInfo.color }}
            >
              {badgeInfo.label}
            </span>
          </div>
        );
      }
    },
    {
      label: 'Début',
      key: 'date',
      sortable: true,
      render: (item) => {
        if (!item.date) return '—';
        const date = item.date.toDate ? item.date.toDate() : new Date(item.date);
        return (
          <span className={styles.dateCell}>
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
      }
    },
    {
      label: 'Fin',
      key: 'dateFin',
      sortable: true,
      render: (item) => {
        if (!item.dateFin) return '—';
        const date = item.dateFin.toDate ? item.dateFin.toDate() : new Date(item.dateFin);
        return (
          <span className={styles.dateCell}>
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
      }
    },
    {
      label: 'Montant',
      key: 'montant',
      sortable: true,
      render: (item) => {
        const montant = item.montant || item.montantTotal || 0;
        return (
          <span className={styles.montantCell}>
            {montant > 0 ? `${montant.toLocaleString('fr-FR')} €` : '—'}
          </span>
        );
      }
    },
    {
      label: 'Nb. de dates',
      key: 'nbDates',
      sortable: true,
      render: (item) => (
        <span className={styles.nbDatesCell}>
          {item.nbDates || item.nombreDates || 1}
        </span>
      )
    }
  ];

  // Filtrage des dates
  const filteredDates = useMemo(() => {
    if (!searchTerm) return dates;
    
    const searchLower = searchTerm.toLowerCase();
    return dates.filter(date => {
      return (
        (date.titre && date.titre.toLowerCase().includes(searchLower)) ||
        (date.artisteNom && date.artisteNom.toLowerCase().includes(searchLower)) ||
        (date.lieuNom && date.lieuNom.toLowerCase().includes(searchLower)) ||
        (date.contactNom && date.contactNom.toLowerCase().includes(searchLower))
      );
    });
  }, [dates, searchTerm]);

  // Tri des dates
  const sortedDates = useMemo(() => {
    const sorted = [...filteredDates];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Gestion des dates
      if (sortField === 'date' || sortField === 'dateFin' || sortField === 'priseOption') {
        aVal = aVal?.toDate ? aVal.toDate() : aVal ? new Date(aVal) : null;
        bVal = bVal?.toDate ? bVal.toDate() : bVal ? new Date(bVal) : null;
      }
      
      // Gestion des valeurs null
      if (aVal === null || aVal === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bVal === null || bVal === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      // Tri
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredDates, sortField, sortDirection]);

  // Gestion du tri
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Gestion du clic sur une ligne
  const handleRowClick = (date) => {
    if (openDateDetailsTab) {
      const dateTitle = date.artisteNom 
        ? `${date.artisteNom} - ${date.date ? new Date(date.date).toLocaleDateString('fr-FR') : 'Date'}`
        : 'Détails de la date';
      openDateDetailsTab(date.id, dateTitle);
    }
  };

  // Actions sur les lignes - maintenant avec toutes les icônes d'actions
  const renderActions = (item) => (
    <div className="d-flex gap-1 align-items-center">
      {/* Bouton Devis */}
      <button
        className={datesTableStyles.iconButton}
        onClick={(e) => {
          e.stopPropagation();
          const hasDevis = item.hasDevis || item.devisId;
          if (hasDevis && openDevisTab) {
            const devisTitle = `${item.devisNumero || 'Devis'} - ${item.artisteNom || 'Date'}`;
            openDevisTab(item.devisId, devisTitle);
          } else if (openNewDevisTab) {
            const title = `Nouveau Devis - ${item.artisteNom || 'Date'}`;
            openNewDevisTab(item.id, item.structureId || item.organisateurId, title);
          }
        }}
        title={item.hasDevis || item.devisId ? 'Voir le devis' : 'Créer un devis'}
      >
        <i className={`bi ${item.hasDevis || item.devisId ? 'bi-file-earmark-text-fill' : 'bi-file-earmark-text'} ${item.hasDevis || item.devisId ? datesTableStyles.iconSuccess : datesTableStyles.iconDefault}`}></i>
      </button>

      {/* Bouton Pré-contrat */}
      <button
        className={datesTableStyles.iconButton}
        onClick={(e) => {
          e.stopPropagation();
          if (openPreContratTab) {
            openPreContratTab(item.id);
          }
        }}
        title={item.preContratValidated ? 'Pré-contrat validé' : 'Gérer le pré-contrat'}
      >
        <i className={`bi ${item.preContratValidated ? 'bi-file-earmark-check-fill' : 'bi-file-earmark'} ${item.preContratValidated ? datesTableStyles.iconSuccess : datesTableStyles.iconDefault}`}></i>
      </button>

      {/* Bouton Confirmation */}
      <button
        className={datesTableStyles.iconButton}
        onClick={(e) => {
          e.stopPropagation();
          if (openTab) {
            openTab({
              id: `confirmation-${item.id}`,
              title: `Confirmation - ${item.artisteNom || item.titre || 'Date'}`,
              path: `/confirmation?dateId=${item.id}`,
              component: 'ConfirmationPage',
              params: { dateId: item.id },
              icon: 'bi-check-circle'
            });
          }
        }}
        title={item.confirmationValidee ? 'Confirmation validée' : 'Valider la confirmation'}
      >
        <i className={`bi ${item.confirmationValidee ? 'bi-check-circle-fill' : 'bi-check-circle'} ${item.confirmationValidee ? datesTableStyles.iconSuccess : datesTableStyles.iconDefault}`}></i>
      </button>

      {/* Bouton Contrat */}
      <button
        className={datesTableStyles.iconButton}
        onClick={(e) => {
          e.stopPropagation();
          if (openContratTab) {
            const hasContrat = hasContractFunc ? hasContractFunc(item.id) : false;
            const contractStatus = getContractStatus ? getContractStatus(item.id) : null;
            const isRedige = contractStatus && contractStatus !== 'draft';
            const dateTitle = item.artisteNom || item.titre || 'Date';
            openContratTab(item.id, dateTitle, isRedige);
          }
        }}
        title="Gérer le contrat"
      >
        <i className={`bi bi-file-text ${hasContractFunc && hasContractFunc(item.id) ? datesTableStyles.iconSuccess : datesTableStyles.iconDefault}`}></i>
      </button>

      {/* Bouton Facture */}
      <button
        className={datesTableStyles.iconButton}
        onClick={(e) => {
          e.stopPropagation();
          const contractData = getContractData ? getContractData(item.id) : null;
          const factureData = getFactureData ? getFactureData(item.id) : null;
          const hasFactureFromContract = contractData && contractData.factureId;
          const hasDirectFacture = item.factureId || item.hasFacture || factureData;
          const hasFacture = hasFactureFromContract || hasDirectFacture;
          const factureId = hasFactureFromContract ? contractData.factureId : (factureData?.id || item.factureId);
          
          if (hasFacture && factureId && handleViewFacture) {
            handleViewFacture(factureId);
          } else if (handleGenerateFacture) {
            const contratId = contractData?.id || null;
            handleGenerateFacture(item.id, contratId);
          }
        }}
        title={item.factureId ? 'Voir la facture' : 'Générer une facture'}
        disabled={!hasContractFunc || !hasContractFunc(item.id)}
      >
        <i className={`bi ${item.factureId ? 'bi-receipt-cutoff' : 'bi-receipt'} ${item.factureId ? datesTableStyles.iconSuccess : datesTableStyles.iconDefault}`}></i>
      </button>

      {/* Séparateur */}
      <div className="vr mx-1" style={{ height: '20px' }}></div>

      {/* Boutons Modifier/Supprimer */}
      <ActionButtons
        onEdit={() => onEdit && onEdit(item)}
        onDelete={() => onDelete && onDelete(item)}
        editTitle="Modifier la date"
        deleteTitle="Supprimer la date"
      />

      {/* Bouton Ouvrir */}
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={(e) => {
          e.stopPropagation();
          handleRowClick(item);
        }}
        title="Ouvrir les détails"
      >
        <i className="bi bi-box-arrow-up-right"></i>
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </Alert>
    );
  }

  if (dates.length === 0) {
    return (
      <EntityEmptyState
        icon="bi-calendar-x"
        title="Aucune date"
        message="Il n'y a pas encore de dates enregistrées."
      />
    );
  }

  return (
    <div className={styles.tableSection}>
      {showSearch && (
        <div className={styles.searchSection}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par artiste, lieu, contact..."
            />
          </div>
        </div>
      )}
      
      <Table
        data={sortedDates}
        columns={columns}
        onRowClick={handleRowClick}
        renderActions={renderActions}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        className={styles.datesTable}
      />
      
      {filteredDates.length === 0 && searchTerm && (
        <EntityEmptyState
          icon="bi-search"
          title="Aucun résultat"
          message={`Aucune date ne correspond à "${searchTerm}"`}
        />
      )}
    </div>
  );
};

export default DatesTableView;