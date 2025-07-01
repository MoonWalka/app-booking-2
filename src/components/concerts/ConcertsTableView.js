import React, { useState, useMemo } from 'react';
import { useTabs } from '@/context/TabsContext';
import Table from '@/components/ui/Table';
import ActionButtons from '@/components/ui/ActionButtons';
import EntityEmptyState from '@/components/ui/EntityEmptyState';
import Alert from '@/components/ui/Alert';
import styles from '@/pages/TableauDeBordPage.module.css';
import datesTableStyles from '@/shared/tableConfigs/datesTableStyles.module.css';

/**
 * Composant commun pour afficher un tableau de concerts
 * Utilisé par TableauDeBordPage et ContactDatesTable
 * @param {Array} concerts - Liste des concerts à afficher
 * @param {boolean} loading - État de chargement
 * @param {string} error - Message d'erreur éventuel
 * @param {Function} onDelete - Callback pour supprimer un concert
 * @param {Function} onEdit - Callback pour éditer un concert
 * @param {boolean} showSearch - Afficher la barre de recherche (true par défaut)
 */
const ConcertsTableView = ({ 
  concerts = [], 
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
      label: 'Niveau',
      key: 'niveau',
      sortable: true,
      render: (item) => {
        const niveau = item.niveau || 1;
        return (
          <div className={styles.niveauCell}>
            <div className={styles.niveauIcon}>
              {Array.from({ length: 3 }, (_, index) => (
                <div 
                  key={index}
                  className={`${styles.niveauBar} ${index < niveau ? styles.niveauBarActive : styles.niveauBarInactive}`}
                ></div>
              ))}
            </div>
          </div>
        );
      }
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
      label: 'Lieu/Libellé',
      key: 'lieuNom',
      sortable: true,
      render: (item) => (
        <div className={styles.lieuCell}>
          <div className={styles.lieuNom}>
            {(() => {
              const lieu = item.lieuNom || item.lieu?.nom;
              const libelle = item.libelle || item.titre;
              
              // Afficher "lieu/libellé" si les deux existent, sinon l'un ou l'autre
              if (lieu && libelle) {
                return `${lieu} / ${libelle}`;
              } else if (lieu) {
                return lieu;
              } else if (libelle) {
                return libelle;
              } else {
                return 'Non spécifié';
              }
            })()}
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
      label: 'Contrat',
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
    },
    {
      label: 'Devis',
      key: 'devis',
      sortable: false,
      render: (item) => {
        const hasDevis = item.hasDevis || item.devisId;
        const devisStatut = item.devisStatut || 'brouillon';
        
        let iconClass = 'bi-file-earmark-text';
        let iconColor = datesTableStyles.iconDefault;
        let title = 'Créer un devis';
        let onClick;
        
        if (hasDevis) {
          // Le devis existe
          title = `Voir le devis ${item.devisNumero || ''}`;
          
          // Changer l'icône selon le statut
          switch (devisStatut) {
            case 'envoye':
              iconClass = 'bi-file-earmark-text-fill';
              iconColor = datesTableStyles.iconInfo;
              break;
            case 'accepte':
              iconClass = 'bi-file-earmark-check-fill';
              iconColor = datesTableStyles.iconSuccess;
              break;
            case 'refuse':
              iconClass = 'bi-file-earmark-x-fill';
              iconColor = datesTableStyles.iconDanger;
              break;
            case 'annule':
              iconClass = 'bi-file-earmark-x';
              iconColor = datesTableStyles.iconMuted;
              break;
            default: // brouillon
              iconClass = 'bi-file-earmark-text-fill';
              iconColor = datesTableStyles.iconDefault;
          }
          
          onClick = (e) => {
            e.stopPropagation();
            if (openDevisTab) {
              const devisTitle = `${item.devisNumero || 'Devis'} - ${item.artisteNom || 'Concert'}`;
              openDevisTab(item.devisId, devisTitle);
            }
          };
        } else {
          // Pas de devis, créer un nouveau
          onClick = (e) => {
            e.stopPropagation();
            if (openNewDevisTab) {
              const title = `Nouveau Devis - ${item.artisteNom || 'Concert'}`;
              openNewDevisTab(item.id, item.structureId || item.organisateurId, title);
            }
          };
        }
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={onClick}
            title={title}
          >
            <i className={`bi ${iconClass} ${iconColor}`}></i>
          </button>
        );
      }
    },
    {
      label: 'Pré contrat',
      key: 'preContrat',
      sortable: false,
      render: (item) => {
        const hasPreContrat = item.preContratId || item.hasPreContrat;
        const isValidated = item.preContratValidated || item.publicFormCompleted;
        
        let iconClass = 'bi-file-earmark';
        let iconColor = datesTableStyles.iconDefault;
        let title = 'Créer un pré-contrat';
        
        if (hasPreContrat) {
          if (isValidated) {
            iconClass = 'bi-file-earmark-check-fill';
            iconColor = datesTableStyles.iconSuccess;
            title = 'Pré-contrat validé';
          } else {
            iconClass = 'bi-file-earmark-fill';
            iconColor = datesTableStyles.iconWarning;
            title = 'Pré-contrat en cours';
          }
        }
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              if (openPreContratTab) {
                openPreContratTab(item.id);
              }
            }}
            title={title}
          >
            <i className={`bi ${iconClass} ${iconColor}`}></i>
          </button>
        );
      }
    },
    {
      label: 'Confirmation',
      key: 'confirmation',
      sortable: false,
      render: (item) => {
        const hasValidation = item.confirmationValidee || item.publicFormData?.confirmationValidee;
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              if (openTab) {
                openTab({
                  id: `confirmation-${item.id}`,
                  title: `Confirmation - ${item.artisteNom || item.titre || 'Concert'}`,
                  path: `/confirmation?concertId=${item.id}`,
                  component: 'ConfirmationPage',
                  params: { concertId: item.id },
                  icon: 'bi-check-circle'
                });
              }
            }}
            title={hasValidation ? 'Confirmation validée' : 'Valider la confirmation'}
          >
            <i className={`bi ${hasValidation ? 'bi-check-circle-fill' : 'bi-check-circle'} ${hasValidation ? datesTableStyles.iconSuccess : datesTableStyles.iconDefault}`}></i>
          </button>
        );
      }
    },
    {
      label: 'Contrat',
      key: 'contratFinal',
      sortable: false,
      render: (item) => {
        // Simplification : utiliser la fonction fournie ou vérifier l'ID du contrat
        const hasContrat = hasContractFunc ? hasContractFunc(item.id) : (item.contratId ? true : false);
        // Le contrat est rédigé s'il a un statut (depuis la collection contrats)
        const contractStatus = getContractStatus ? getContractStatus(item.id) : null;
        const isRedige = contractStatus && contractStatus !== 'draft';
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              console.log('[ConcertsTableView] Clic sur icône contrat pour concert:', item.id);
              console.log('[ConcertsTableView] État du contrat - hasContrat:', hasContrat, 'isRedige:', isRedige, 'status:', contractStatus);
              console.log('[ConcertsTableView] Détails:', {
                contratId: item.contratId,
                status: contractStatus
              });
              if (openContratTab) {
                const concertTitle = item.artisteNom || item.titre || 'Concert';
                openContratTab(item.id, concertTitle, isRedige);
              }
            }}
            title={isRedige ? 'Contrat rédigé - Voir l\'aperçu' : hasContrat ? 'Modifier le contrat' : 'Créer le contrat'}
          >
            <i className={`bi ${hasContrat ? 'bi-file-text-fill' : 'bi-file-text'} ${hasContrat ? datesTableStyles.iconSuccess : datesTableStyles.iconDefault}`}></i>
          </button>
        );
      }
    },
    {
      label: 'Facture',
      key: 'facture',
      sortable: false,
      render: (item) => {
        console.log(`[ConcertsTableView] === DÉBUT RENDU BOUTON FACTURE pour concert ${item.id} ===`);
        
        // Importer les données de contrat et facture si les fonctions sont disponibles
        const contractData = getContractData ? getContractData(item.id) : null;
        const factureData = getFactureData ? getFactureData(item.id) : null;
        
        console.log('[ConcertsTableView] Données contrat:', contractData);
        console.log('[ConcertsTableView] Données facture:', factureData);
        
        // Vérifier d'abord si le contrat a une facture
        const hasFactureFromContract = contractData && contractData.factureId;
        const hasDirectFacture = item.factureId || item.hasFacture || factureData;
        const hasFacture = hasFactureFromContract || hasDirectFacture;
        
        console.log('[ConcertsTableView] Facture depuis contrat:', hasFactureFromContract);
        console.log('[ConcertsTableView] Facture directe:', hasDirectFacture);
        console.log('[ConcertsTableView] A une facture:', hasFacture);
        
        // Déterminer l'ID de la facture
        const factureId = hasFactureFromContract ? contractData.factureId : (factureData?.id || item.factureId);
        console.log('[ConcertsTableView] ID facture déterminé:', factureId);
        
        // Déterminer si on peut générer une facture
        const hasContract = hasContractFunc ? hasContractFunc(item.id) : false;
        const contractStatus = getContractStatus ? getContractStatus(item.id) : null;
        // Un contrat peut être facturé s'il est finalisé, signé, envoyé ou en draft (rédigé)
        const canGenerateFacture = hasContract && (contractStatus === 'signed' || contractStatus === 'finalized' || contractStatus === 'sent' || contractStatus === 'draft');
        
        console.log('[ConcertsTableView] A un contrat:', hasContract);
        console.log('[ConcertsTableView] Statut contrat:', contractStatus);
        console.log('[ConcertsTableView] Peut générer facture:', canGenerateFacture);
        
        let iconClass = 'bi-receipt';
        let iconColor = datesTableStyles.iconDefault;
        let title = 'Facture non disponible';
        let disabled = true;
        let buttonStatus = 'non_disponible';
        
        if (hasFacture) {
          iconClass = 'bi-receipt-cutoff';
          iconColor = datesTableStyles.iconSuccess;
          title = 'Voir la facture';
          disabled = false;
          buttonStatus = 'voir_facture';
        } else if (canGenerateFacture) {
          iconClass = 'bi-receipt';
          iconColor = datesTableStyles.iconWarning;
          title = 'Générer une facture';
          disabled = false;
          buttonStatus = 'generer_facture';
        } else if (!hasContract) {
          title = 'Contrat requis pour facturer';
          buttonStatus = 'pas_de_contrat';
        } else if (!canGenerateFacture) {
          // Le contrat existe mais n'est pas dans un état facturable
          title = 'Contrat en cours';
          buttonStatus = 'contrat_en_cours';
        }
        
        console.log('[ConcertsTableView] État final bouton:', {
          buttonStatus,
          iconClass,
          iconColor,
          title,
          disabled
        });
        console.log(`[ConcertsTableView] === FIN RENDU BOUTON FACTURE pour concert ${item.id} ===`);
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              console.log(`[ConcertsTableView] === DÉBUT CLIC BOUTON FACTURE pour concert ${item.id} ===`);
              console.log('[ConcertsTableView] État au moment du clic:', {
                disabled,
                hasFacture,
                factureId,
                canGenerateFacture,
                buttonStatus,
                handleViewFacture: !!handleViewFacture,
                handleGenerateFacture: !!handleGenerateFacture
              });
              
              if (!disabled) {
                if (hasFacture && factureId && handleViewFacture) {
                  console.log(`[ConcertsTableView] Action: VOIR FACTURE ${factureId}`);
                  console.log('[ConcertsTableView] Appel de handleViewFacture avec ID:', factureId);
                  // Ouvrir la facture existante
                  handleViewFacture(factureId);
                  console.log('[ConcertsTableView] handleViewFacture appelé');
                } else if (canGenerateFacture && handleGenerateFacture) {
                  console.log(`[ConcertsTableView] Action: GÉNÉRER FACTURE pour concert ${item.id}`);
                  console.log('[ConcertsTableView] Appel de handleGenerateFacture avec concertId:', item.id);
                  // Générer une nouvelle facture
                  // Récupérer le contratId s'il existe
                  const contractData = getContractData && getContractData(item.id);
                  const contratId = contractData?.id || null;
                  console.log('[ConcertsTableView] ContratId trouvé:', contratId);
                  handleGenerateFacture(item.id, contratId);
                  console.log('[ConcertsTableView] handleGenerateFacture appelé');
                } else {
                  console.log('[ConcertsTableView] Aucune action possible - conditions non remplies');
                }
              } else {
                console.log('[ConcertsTableView] Bouton désactivé - pas d\'action');
              }
              console.log(`[ConcertsTableView] === FIN CLIC BOUTON FACTURE pour concert ${item.id} ===`);
            }}
            title={title}
            disabled={disabled}
          >
            <i className={`bi ${iconClass} ${iconColor}`}></i>
          </button>
        );
      }
    }
  ];

  // Filtrage des concerts
  const filteredConcerts = useMemo(() => {
    if (!searchTerm) return concerts;
    
    const searchLower = searchTerm.toLowerCase();
    return concerts.filter(concert => {
      return (
        (concert.titre && concert.titre.toLowerCase().includes(searchLower)) ||
        (concert.artisteNom && concert.artisteNom.toLowerCase().includes(searchLower)) ||
        (concert.lieuNom && concert.lieuNom.toLowerCase().includes(searchLower)) ||
        (concert.contactNom && concert.contactNom.toLowerCase().includes(searchLower))
      );
    });
  }, [concerts, searchTerm]);

  // Tri des concerts
  const sortedConcerts = useMemo(() => {
    const sorted = [...filteredConcerts];
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
  }, [filteredConcerts, sortField, sortDirection]);

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
  const handleRowClick = (concert) => {
    if (openDateDetailsTab) {
      const dateTitle = concert.artisteNom 
        ? `${concert.artisteNom} - ${concert.date ? new Date(concert.date).toLocaleDateString('fr-FR') : 'Date'}`
        : 'Détails de la date';
      openDateDetailsTab(concert.id, dateTitle);
    }
  };

  // Actions sur les lignes
  const renderActions = (item) => (
    <ActionButtons
      onEdit={() => onEdit && onEdit(item)}
      onDelete={() => onDelete && onDelete(item)}
      editTitle="Modifier le concert"
      deleteTitle="Supprimer le concert"
    />
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

  if (concerts.length === 0) {
    return (
      <EntityEmptyState
        icon="bi-calendar-x"
        title="Aucun concert"
        message="Il n'y a pas encore de concerts enregistrés."
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
        data={sortedConcerts}
        columns={columns}
        onRowClick={handleRowClick}
        renderActions={renderActions}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        className={styles.concertsTable}
      />
      
      {filteredConcerts.length === 0 && searchTerm && (
        <EntityEmptyState
          icon="bi-search"
          title="Aucun résultat"
          message={`Aucun concert ne correspond à "${searchTerm}"`}
        />
      )}
    </div>
  );
};

export default ConcertsTableView;