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
  showSearch = true
}) => {
  const { openTab, openContactTab, openPreContratTab, openContratTab } = useTabs();
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
      render: (item) => (
        <button
          className={datesTableStyles.iconButton}
          onClick={(e) => {
            e.stopPropagation();
            if (openTab) {
              openTab({
                id: `devis-${item.id}`,
                title: `Devis - ${item.artisteNom || 'Concert'}`,
                path: `/devis/new?concertId=${item.id}${item.structureId ? `&structureId=${item.structureId}` : ''}`,
                component: 'DevisForm',
                params: { 
                  concertId: item.id,
                  structureId: item.structureId 
                }
              });
            }
          }}
          title="Créer un devis"
        >
          <i className={`bi bi-file-earmark-text ${datesTableStyles.iconDevis}`}></i>
        </button>
      )
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
        const hasContrat = item.contratStatut === 'redige' || item.hasContrat;
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              if (openContratTab) {
                openContratTab(item.id);
              }
            }}
            title={hasContrat ? 'Contrat rédigé' : 'Rédiger le contrat'}
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
        const hasFacture = item.factureId || item.hasFacture;
        
        return (
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Ouvrir facture pour concert:', item.id);
            }}
            title={hasFacture ? 'Facture émise' : 'Créer une facture'}
          >
            <i className={`bi ${hasFacture ? 'bi-receipt-cutoff' : 'bi-receipt'} ${hasFacture ? datesTableStyles.iconSuccess : datesTableStyles.iconDefault}`}></i>
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
    if (openTab) {
      openTab({
        id: `concert-${concert.id}`,
        title: `Concert - ${concert.artisteNom || 'Sans nom'}`,
        path: `/concerts/${concert.id}`,
        component: 'ConcertDetails',
        params: { concertId: concert.id }
      });
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