import React, { useState, useMemo, useCallback } from 'react';
import { useTabs } from '@/context/TabsContext';
import Table from '@/components/ui/Table';
import ActionButtons from '@/components/ui/ActionButtons';
import EntityEmptyState from '@/components/ui/EntityEmptyState';
import Alert from '@/components/ui/Alert';
import NiveauDisplay from './NiveauDisplay';
import DatesTableControls from './DatesTableControls';
import DatesTableTotals from './DatesTableTotals';
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
  onRefresh, // Nouvelle prop pour recharger les données
  onAddClick, // Nouvelle prop pour gérer le clic sur "Nouvelle date"
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
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [openingPreContrats, setOpeningPreContrats] = useState(new Set());
  const [openingDevis, setOpeningDevis] = useState(new Set());
  const [openingContrats, setOpeningContrats] = useState(new Set());
  const [openingConfirmations, setOpeningConfirmations] = useState(new Set());
  const [openingFactures, setOpeningFactures] = useState(new Set());

  // Fonction pour gérer l'ouverture du pré-contrat avec protection
  const handleOpenPreContrat = useCallback((dateId, dateTitle) => {
    // Protection contre double-clic
    if (openingPreContrats.has(dateId)) return;
    
    setOpeningPreContrats(prev => new Set(prev).add(dateId));
    if (openPreContratTab) {
      openPreContratTab(dateId, dateTitle);
    }
    // Réactiver après 1 seconde
    setTimeout(() => {
      setOpeningPreContrats(prev => {
        const newSet = new Set(prev);
        newSet.delete(dateId);
        return newSet;
      });
    }, 1000);
  }, [openPreContratTab, openingPreContrats]);

  // Fonction pour gérer l'ouverture du devis avec protection
  const handleOpenDevis = useCallback((devisId, devisTitle, isNew = false, dateId = null, structureId = null) => {
    const trackingId = isNew ? dateId : devisId;
    if (openingDevis.has(trackingId)) return;
    
    setOpeningDevis(prev => new Set(prev).add(trackingId));
    if (isNew && openNewDevisTab) {
      openNewDevisTab(dateId, structureId, devisTitle);
    } else if (!isNew && openDevisTab) {
      openDevisTab(devisId, devisTitle);
    }
    
    setTimeout(() => {
      setOpeningDevis(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackingId);
        return newSet;
      });
    }, 1000);
  }, [openDevisTab, openNewDevisTab, openingDevis]);

  // Fonction pour gérer l'ouverture du contrat avec protection
  const handleOpenContrat = useCallback((dateId, dateTitle, isRedige) => {
    if (openingContrats.has(dateId)) return;
    
    setOpeningContrats(prev => new Set(prev).add(dateId));
    if (openContratTab) {
      openContratTab(dateId, dateTitle, isRedige);
    }
    
    setTimeout(() => {
      setOpeningContrats(prev => {
        const newSet = new Set(prev);
        newSet.delete(dateId);
        return newSet;
      });
    }, 1000);
  }, [openContratTab, openingContrats]);

  // Fonction pour gérer l'ouverture de la confirmation avec protection
  const handleOpenConfirmation = useCallback((dateId, dateTitle) => {
    if (openingConfirmations.has(dateId)) return;
    
    setOpeningConfirmations(prev => new Set(prev).add(dateId));
    if (openTab) {
      openTab({
        id: `confirmation-${dateId}`,
        title: `Confirmation - ${dateTitle}`,
        path: `/confirmation?dateId=${dateId}`,
        component: 'ConfirmationPage',
        params: { dateId },
        icon: 'bi-check-circle'
      });
    }
    
    setTimeout(() => {
      setOpeningConfirmations(prev => {
        const newSet = new Set(prev);
        newSet.delete(dateId);
        return newSet;
      });
    }, 1000);
  }, [openTab, openingConfirmations]);

  // Fonction pour gérer les actions facture avec protection
  const handleFactureAction = useCallback((dateId, factureId, action, contratId = null) => {
    const trackingId = action === 'generate' ? dateId : factureId;
    if (openingFactures.has(trackingId)) return;
    
    setOpeningFactures(prev => new Set(prev).add(trackingId));
    
    if (action === 'view' && handleViewFacture) {
      handleViewFacture(factureId);
    } else if (action === 'generate' && handleGenerateFacture) {
      handleGenerateFacture(dateId, contratId);
    }
    
    setTimeout(() => {
      setOpeningFactures(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackingId);
        return newSet;
      });
    }, 1000);
  }, [handleViewFacture, handleGenerateFacture, openingFactures]);

  // Configuration des colonnes du tableau
  const columns = [
    {
      label: '',
      key: 'selection',
      sortable: false,
      width: '50px',
      render: (item) => (
        <input
          type="checkbox"
          checked={selectedIds.has(item.id)}
          onChange={(e) => {
            const newSelected = new Set(selectedIds);
            if (e.target.checked) {
              newSelected.add(item.id);
            } else {
              newSelected.delete(item.id);
            }
            setSelectedIds(newSelected);
          }}
          onClick={(e) => e.stopPropagation()}
        />
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
        const typeContrat = item.typeContrat || item.contratType || 'Non défini';
        const getContratBadge = (type) => {
          switch (type.toLowerCase()) {
            case 'cession':
              return { color: '#007bff', label: 'Cession' };
            case 'coréalisation':
            case 'corealisation':
              return { color: '#28a745', label: 'Coréalisation' };
            case 'location':
              return { color: '#17a2b8', label: 'Location' };
            case 'non défini':
            default:
              return { color: '#6c757d', label: 'Non défini' };
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
        const isOpening = hasDevis ? openingDevis.has(item.devisId) : openingDevis.has(item.id);
        
        let iconClass = 'bi-file-earmark-text';
        let iconColor = datesTableStyles.iconDefault;
        let title = 'Créer un devis';
        
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
        }
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              if (hasDevis) {
                const devisTitle = `${item.devisNumero || 'Devis'} - ${item.artisteNom || 'Date'}`;
                handleOpenDevis(item.devisId, devisTitle, false);
              } else {
                const title = `Nouveau Devis - ${item.artisteNom || 'Date'}`;
                handleOpenDevis(null, title, true, item.id, item.structureId || item.organisateurId);
              }
            }}
            title={title}
            disabled={isOpening}
            style={{ opacity: isOpening ? 0.5 : 1 }}
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
        const isOpening = openingPreContrats.has(item.id);
        
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
              const dateTitle = item.artisteNom 
                ? `${item.artisteNom} - ${item.date ? new Date(item.date).toLocaleDateString('fr-FR') : 'Date'}`
                : 'Pré-contrat';
              handleOpenPreContrat(item.id, dateTitle);
            }}
            title={title}
            disabled={isOpening}
            style={{ opacity: isOpening ? 0.5 : 1 }}
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
        const isOpening = openingConfirmations.has(item.id);
        
        // Debug: log pour voir les valeurs
        console.log('[DatesTableView] Confirmation pour date', item.id, ':', {
          confirmationValidee: item.confirmationValidee,
          publicFormDataConfirmation: item.publicFormData?.confirmationValidee,
          hasValidation
        });
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              const dateTitle = item.artisteNom || item.titre || 'Date';
              handleOpenConfirmation(item.id, dateTitle);
            }}
            title={hasValidation ? 'Confirmation validée' : 'Valider la confirmation'}
            disabled={isOpening}
            style={{ opacity: isOpening ? 0.5 : 1 }}
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
        const isOpening = openingContrats.has(item.id);
        // Le contrat est rédigé s'il a un statut (depuis la collection contrats)
        const contractStatus = getContractStatus ? getContractStatus(item.id) : null;
        const isRedige = contractStatus && contractStatus !== 'draft';
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              console.log('[DatesTableView] Clic sur icône contrat pour date:', item.id);
              console.log('[DatesTableView] État du contrat - hasContrat:', hasContrat, 'isRedige:', isRedige, 'status:', contractStatus);
              console.log('[DatesTableView] Détails:', {
                contratId: item.contratId,
                status: contractStatus
              });
              const dateTitle = item.artisteNom || item.titre || 'Date';
              handleOpenContrat(item.id, dateTitle, isRedige);
            }}
            title={isRedige ? 'Contrat rédigé - Voir l\'aperçu' : hasContrat ? 'Modifier le contrat' : 'Créer le contrat'}
            disabled={isOpening}
            style={{ opacity: isOpening ? 0.5 : 1 }}
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
        console.log(`[DatesTableView] === DÉBUT RENDU BOUTON FACTURE pour date ${item.id} ===`);
        
        // Importer les données de contrat et facture si les fonctions sont disponibles
        const contractData = getContractData ? getContractData(item.id) : null;
        const factureData = getFactureData ? getFactureData(item.id) : null;
        
        console.log('[DatesTableView] Données contrat:', contractData);
        console.log('[DatesTableView] Données facture:', factureData);
        
        // Vérifier d'abord si le contrat a une facture
        const hasFactureFromContract = contractData && contractData.factureId;
        const hasDirectFacture = item.factureId || item.hasFacture || (factureData && factureData.id);
        const hasFacture = hasFactureFromContract || hasDirectFacture;
        
        console.log('[DatesTableView] Facture depuis contrat:', hasFactureFromContract);
        console.log('[DatesTableView] Facture directe:', hasDirectFacture);
        console.log('[DatesTableView] A une facture:', hasFacture);
        
        // Déterminer l'ID de la facture
        const factureId = hasFactureFromContract ? contractData.factureId : (factureData?.id || item.factureId);
        console.log('[DatesTableView] ID facture déterminé:', factureId);
        
        // Déterminer si on peut générer une facture
        const hasContract = hasContractFunc ? hasContractFunc(item.id) : false;
        const contractStatus = getContractStatus ? getContractStatus(item.id) : null;
        // Un contrat peut être facturé s'il est finalisé, signé, envoyé ou en draft (rédigé)
        const canGenerateFacture = hasContract && (contractStatus === 'signed' || contractStatus === 'finalized' || contractStatus === 'sent' || contractStatus === 'draft');
        
        console.log('[DatesTableView] A un contrat:', hasContract);
        console.log('[DatesTableView] Statut contrat:', contractStatus);
        console.log('[DatesTableView] Peut générer facture:', canGenerateFacture);
        
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
        
        console.log('[DatesTableView] État final bouton:', {
          buttonStatus,
          iconClass,
          iconColor,
          title,
          disabled
        });
        console.log(`[DatesTableView] === FIN RENDU BOUTON FACTURE pour date ${item.id} ===`);
        
        const isOpening = hasFacture ? openingFactures.has(factureId) : openingFactures.has(item.id);
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              console.log(`[DatesTableView] === DÉBUT CLIC BOUTON FACTURE pour date ${item.id} ===`);
              console.log('[DatesTableView] État au moment du clic:', {
                disabled,
                hasFacture,
                factureId,
                canGenerateFacture,
                buttonStatus,
                handleViewFacture: !!handleViewFacture,
                handleGenerateFacture: !!handleGenerateFacture
              });
              
              if (!disabled && !isOpening) {
                if (hasFacture && factureId) {
                  console.log(`[DatesTableView] Action: VOIR FACTURE ${factureId}`);
                  handleFactureAction(item.id, factureId, 'view');
                } else if (canGenerateFacture) {
                  console.log(`[DatesTableView] Action: GÉNÉRER FACTURE pour date ${item.id}`);
                  // Récupérer le contratId s'il existe
                  const contractData = getContractData && getContractData(item.id);
                  const contratId = contractData?.id || null;
                  console.log('[DatesTableView] ContratId trouvé:', contratId);
                  handleFactureAction(item.id, null, 'generate', contratId);
                } else {
                  console.log('[DatesTableView] Aucune action possible - conditions non remplies');
                }
              } else {
                console.log('[DatesTableView] Bouton désactivé ou en cours d\'ouverture - pas d\'action');
              }
              console.log(`[DatesTableView] === FIN CLIC BOUTON FACTURE pour date ${item.id} ===`);
            }}
            title={title}
            disabled={disabled || isOpening}
            style={{ opacity: disabled || isOpening ? 0.5 : 1 }}
          >
            <i className={`bi ${iconClass} ${iconColor}`}></i>
          </button>
        );
      }
    }
  ];

  // Filtrage des dates
  const filteredDates = useMemo(() => {
    let filtered = [...dates];
    
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(date => {
        return (
          (date.titre && date.titre.toLowerCase().includes(searchLower)) ||
          (date.artisteNom && date.artisteNom.toLowerCase().includes(searchLower)) ||
          (date.lieuNom && date.lieuNom.toLowerCase().includes(searchLower)) ||
          (date.contactNom && date.contactNom.toLowerCase().includes(searchLower)) ||
          (date.projet && date.projet.toLowerCase().includes(searchLower)) ||
          (date.lieuVille && date.lieuVille.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Filtre par date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(date => {
        const dateValue = date.date?.toDate ? date.date.toDate() : date.date ? new Date(date.date) : null;
        return dateValue && dateValue >= filterDate;
      });
    }
    
    return filtered;
  }, [dates, searchTerm, dateFilter]);

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

  // Pagination
  const paginatedDates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedDates.slice(startIndex, endIndex);
  }, [sortedDates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedDates.length / itemsPerPage);

  // Dates sélectionnées pour le calcul des totaux
  const selectedDates = useMemo(() => {
    return dates.filter(date => selectedIds.has(date.id));
  }, [dates, selectedIds]);

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

  // Actions sur les lignes
  const renderActions = (item) => (
    <ActionButtons
      onEdit={() => onEdit && onEdit(item)}
      onDelete={() => onDelete && onDelete(item)}
      editTitle="Modifier le date"
      deleteTitle="Supprimer le date"
    />
  );

  // Handlers pour le bandeau de contrôle
  const handleRefresh = () => {
    if (onRefresh) {
      // Si une fonction de rechargement est fournie, l'utiliser
      onRefresh();
    } else {
      // Sinon, fallback sur le rechargement de page
      console.warn('Aucune fonction de rechargement fournie, rechargement de la page entière');
      window.location.reload();
    }
  };

  const handleCalculate = () => {
    console.log('Calcul des montants sélectionnés...');
    const total = selectedDates.reduce((sum, date) => {
      const amount = date.montant || date.montantTotal || 0;
      return sum + amount;
    }, 0);
    console.log(`Total sélectionné: ${total.toLocaleString('fr-FR')} €`);
    // Le calcul est automatique avec le composant DatesTableTotals
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilter = () => {
    console.log('Application des filtres...');
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleAdd = () => {
    // Si une fonction onAddClick personnalisée est fournie, l'utiliser
    if (onAddClick) {
      onAddClick();
    } else {
      // Sinon, utiliser le comportement par défaut
      if (openTab) {
        openTab({
          id: 'date-creation',
          title: 'Nouvelle Date',
          path: '/booking/nouvelle-date',
          component: 'DateCreationPage',
          icon: 'bi-calendar-plus'
        });
      }
    }
  };

  const handleExportExcel = () => {
    console.log('Export Excel des dates...');
    
    // Préparer les données pour l'export
    const exportData = sortedDates.map(date => ({
      'Niveau': date.niveau || '',
      'Artiste': date.artisteNom || '',
      'Projet': date.formule || date.projet || date.projetNom || '',
      'Lieu': date.lieuNom || date.lieu?.nom || '',
      'Ville': date.lieuVille || date.lieu?.ville || '',
      'Prise d\'option': date.priseOption ? new Date(date.priseOption).toLocaleDateString('fr-FR') : '',
      'Type contrat': date.typeContrat || date.contratType || '',
      'Date début': date.date ? new Date(date.date).toLocaleDateString('fr-FR') : '',
      'Date fin': date.dateFin ? new Date(date.dateFin).toLocaleDateString('fr-FR') : '',
      'Montant': date.montant || date.montantTotal || '',
      'Nombre de dates': date.nbDates || date.nombreDates || 1,
      'Statut devis': date.devisStatut || '',
      'Pré-contrat': date.preContratId ? 'Oui' : 'Non',
      'Confirmation': date.confirmationValidee ? 'Validée' : 'En attente',
      'Contrat': date.contratId ? 'Oui' : 'Non',
      'Facture': date.factureId ? 'Oui' : 'Non'
    }));

    // Créer le CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(';'),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Échapper les guillemets et entourer de guillemets si nécessaire
          if (typeof value === 'string' && (value.includes(';') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(';')
      )
    ].join('\n');

    // Créer un blob et télécharger
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dates_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChangeView = () => {
    console.log('Changement de vue...');
    // Logique de changement de vue à implémenter
  };

  const handleShowMap = () => {
    console.log('Affichage sur la carte...');
    // Logique d'affichage carte à implémenter
  };

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

  return (
    <>
      <div className={styles.tableSection}>
        {/* Bandeau de contrôle */}
        <DatesTableControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onRefresh={handleRefresh}
          onCalculate={handleCalculate}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          onFilter={handleFilter}
          onClearFilters={handleClearFilters}
          onAdd={handleAdd}
          onExportExcel={handleExportExcel}
          onChangeView={handleChangeView}
          onShowMap={handleShowMap}
          loading={loading}
        />
        
        <Table
          data={paginatedDates}
          columns={columns}
          onRowClick={handleRowClick}
          renderActions={renderActions}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          className={styles.datesTable}
        />
        
        {filteredDates.length === 0 && (
          (searchTerm || dateFilter) ? (
            <EntityEmptyState
              icon="bi-search"
              title="Aucun résultat"
              message={`Aucun date ne correspond aux critères de recherche`}
            />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
              <i className="bi bi-calendar-x" style={{ fontSize: '2rem' }}></i>
              <p style={{ marginTop: '10px' }}>Aucune date enregistrée</p>
            </div>
          )
        )}
        
        {/* Informations de pagination */}
        {sortedDates.length > 0 && (
          <div className={styles.paginationInfo}>
            <p>
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
              {Math.min(currentPage * itemsPerPage, sortedDates.length)} sur{' '}
              {sortedDates.length} résultats
            </p>
          </div>
        )}
      </div>
      
      {/* Bandeau des totaux - En dehors du tableSection pour qu'il soit vraiment fixé */}
      <DatesTableTotals selectedDates={selectedDates} />
    </>
  );
};

export default DatesTableView;