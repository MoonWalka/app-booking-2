import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import EntityEmptyState from '@/components/ui/EntityEmptyState';
import Alert from '@/components/ui/Alert';
import { Form, InputGroup } from 'react-bootstrap';
import styles from './FacturesTableView.module.css';
import datesTableStyles from '@/shared/tableConfigs/datesTableStyles.module.css';

/**
 * Composant commun pour afficher un tableau de factures
 * Utilisé par FacturesPage et ContactFacturesTable
 * @param {Array} factures - Liste des factures à afficher
 * @param {boolean} loading - État de chargement
 * @param {string} error - Message d'erreur éventuel
 * @param {Function} onDelete - Callback pour supprimer une facture
 * @param {boolean} showSearch - Afficher la barre de recherche (true par défaut)
 * @param {boolean} showFilters - Afficher les filtres avancés (true par défaut)
 * @param {string} emptyMessage - Message personnalisé quand pas de factures
 */
const FacturesTableView = ({ 
  factures = [], 
  loading = false, 
  error = null,
  onDelete,
  showSearch = true,
  showFilters = true,
  emptyMessage = "Aucune facture n'a été générée."
}) => {
  const navigate = useNavigate();
  const { openTab } = useTabs();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('dateFacture');
  const [sortDirection, setSortDirection] = useState('desc');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fonction pour formater les montants
  const formatMontant = (montant) => {
    if (montant == null) return '—';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  // Fonction pour formater les dates
  const formatDate = (date) => {
    if (!date) return '—';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR');
  };

  // getStatusBadge retiré car non utilisé

  // Configuration des colonnes du tableau
  const columns = [
    {
      label: 'Référence',
      key: 'reference',
      sortable: true,
      render: (facture) => (
        <strong className="text-primary">
          {facture.reference || facture.numeroFacture || `FAC-${facture.id.slice(0, 8)}`}
        </strong>
      )
    },
    {
      label: 'Type',
      key: 'type',
      sortable: true,
      render: (facture) => {
        const typeMap = {
          'acompte': { label: 'Acompte', color: '#17a2b8' },
          'solde': { label: 'Solde', color: '#28a745' },
          'complete': { label: 'Complète', color: '#007bff' }
        };
        const type = typeMap[facture.type] || { label: facture.type || 'Facture', color: '#6c757d' };
        return (
          <span style={{ color: type.color, fontWeight: 500 }}>
            {type.label}
          </span>
        );
      }
    },
    {
      label: 'Client',
      key: 'structureNom',
      sortable: true,
      render: (facture) => (
        <div>
          <div>{facture.structureNom || facture.destinataire || '—'}</div>
          {facture.structureVille && (
            <small className="text-muted">{facture.structureVille}</small>
          )}
        </div>
      )
    },
    {
      label: 'Objet',
      key: 'objet',
      sortable: true,
      render: (facture) => (
        <div style={{ maxWidth: '200px' }}>
          <div className="text-truncate" title={facture.objet}>
            {facture.objet || facture.description || '—'}
          </div>
          {facture.artisteNom && (
            <small className="text-muted">{facture.artisteNom}</small>
          )}
        </div>
      )
    },
    {
      label: 'Projet',
      key: 'projet',
      sortable: true,
      render: (facture) => facture.projet || facture.concert?.projetNom || '—'
    },
    {
      label: 'Dates',
      key: 'dates',
      sortable: false,
      render: (facture) => {
        const dateDebut = facture.dateDebut || facture.concert?.date;
        const dateFin = facture.dateFin || facture.concert?.dateFin;
        if (!dateDebut) return '—';
        
        const debut = formatDate(dateDebut);
        const fin = dateFin ? formatDate(dateFin) : null;
        
        return fin && fin !== debut ? `${debut} → ${fin}` : debut;
      }
    },
    {
      label: 'Facturation',
      key: 'dateFacture',
      sortable: true,
      render: (facture) => formatDate(facture.dateFacture)
    },
    {
      label: 'Échéance',
      key: 'dateEcheance',
      sortable: true,
      render: (facture) => {
        const date = facture.dateEcheance;
        if (!date) return '—';
        
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        const isOverdue = dateObj < new Date() && facture.status !== 'paid';
        
        return (
          <span className={isOverdue ? 'text-danger' : ''}>
            {formatDate(date)}
            {isOverdue && ' ⚠️'}
          </span>
        );
      }
    },
    {
      label: 'Montant HT',
      key: 'montantHT',
      sortable: true,
      render: (facture) => formatMontant(facture.montantHT)
    },
    {
      label: 'Montant TTC',
      key: 'montantTTC',
      sortable: true,
      render: (facture) => (
        <strong>{formatMontant(facture.montantTTC)}</strong>
      )
    },
    {
      label: 'État',
      key: 'etat',
      sortable: true,
      render: (facture) => {
        // État du document (brouillon, finalisé, etc.)
        const etatMap = {
          'draft': { label: 'Brouillon', variant: 'secondary' },
          'finalized': { label: 'Finalisé', variant: 'primary' },
          'sent': { label: 'Envoyé', variant: 'info' },
          'cancelled': { label: 'Annulé', variant: 'dark' }
        };
        const etat = facture.etat || facture.status || 'draft';
        const config = etatMap[etat] || etatMap['draft'];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      }
    },
    {
      label: '📧',
      key: 'envoyee',
      sortable: false,
      render: (facture) => {
        const isSent = facture.envoyee || ['sent', 'paid'].includes(facture.status);
        return (
          <span 
            style={{ 
              color: isSent ? '#28a745' : '#dc3545',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
            title={isSent ? 'Envoyée' : 'Non envoyée'}
          >
            {isSent ? '✓' : '✗'}
          </span>
        );
      }
    },
    {
      label: '💰',
      key: 'payee',
      sortable: false,
      render: (facture) => {
        const isPaid = facture.payee || facture.status === 'paid';
        return (
          <span
            style={{ 
              color: isPaid ? '#28a745' : '#dc3545',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
            title={isPaid ? 'Payée' : 'Non payée'}
          >
            {isPaid ? '✓' : '✗'}
          </span>
        );
      }
    },
    {
      label: 'Paiement',
      key: 'datePaiement',
      sortable: true,
      render: (facture) => formatDate(facture.datePaiement)
    },
    {
      label: 'Reste dû',
      key: 'resteDu',
      sortable: false,
      render: (facture) => {
        const total = facture.montantTTC || 0;
        const paye = facture.montantPaye || 0;
        const resteDu = total - paye;
        
        return (
          <span style={{ 
            color: resteDu > 0 ? '#dc3545' : '#28a745',
            fontWeight: resteDu > 0 ? 'bold' : 'normal'
          }}>
            {formatMontant(resteDu)}
          </span>
        );
      }
    },
    {
      label: 'Liens',
      key: 'liens',
      sortable: false,
      render: (facture) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              if (facture.devisId) {
                openTab({
                  id: `devis-${facture.devisId}`,
                  title: `Devis`,
                  path: `/devis/${facture.devisId}`,
                  component: 'DevisEditor',
                  params: { devisId: facture.devisId },
                  icon: 'bi-file-earmark-text'
                });
              }
            }}
            title={facture.devisId ? "Voir le devis" : "Pas de devis associé"}
            disabled={!facture.devisId}
          >
            <i className={`bi ${facture.devisId ? 'bi-file-earmark-text-fill' : 'bi-file-earmark-text'} ${facture.devisId ? datesTableStyles.iconInfo : datesTableStyles.iconDefault}`}></i>
          </button>
          <button
            className={datesTableStyles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              if (facture.contratId) {
                openTab({
                  id: `contrat-${facture.contratId}`,
                  title: `Contrat`,
                  path: `/contrats/${facture.contratId}`,
                  component: 'ContratGenerationNewPage',
                  params: { concertId: facture.contratId },
                  icon: 'bi-file-earmark-check'
                });
              }
            }}
            title={facture.contratId ? "Voir le contrat" : "Pas de contrat associé"}
            disabled={!facture.contratId}
          >
            <i className={`bi ${facture.contratId ? 'bi-file-text-fill' : 'bi-file-text'} ${facture.contratId ? datesTableStyles.iconSuccess : datesTableStyles.iconDefault}`}></i>
          </button>
        </div>
      )
    },
    {
      label: 'Actions',
      key: 'actions',
      sortable: false,
      render: (facture) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              openTab({
                id: `facture-${facture.id}`,
                title: `Facture ${facture.reference || facture.numeroFacture || ''}`,
                path: `/factures/${facture.id}`,
                component: 'FactureGeneratorPage',
                params: { factureId: facture.id },
                icon: 'bi-receipt'
              });
            }}
            title="Voir/Modifier"
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete && onDelete(facture)}
            title="Supprimer"
          >
            <i className="bi bi-trash"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              // TODO: Implémenter le téléchargement PDF
              console.log('Télécharger PDF:', facture.id);
            }}
            title="Télécharger PDF"
          >
            <i className="bi bi-file-pdf"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => {
              // TODO: Implémenter l'envoi par email
              console.log('Envoyer par email:', facture.id);
            }}
            title="Envoyer par email"
          >
            <i className="bi bi-envelope"></i>
          </button>
        </div>
      )
    }
  ];

  // Filtrage et tri des factures
  const filteredAndSortedFactures = useMemo(() => {
    let filtered = [...factures];

    // Recherche textuelle
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(facture => 
        (facture.reference?.toLowerCase() || '').includes(search) ||
        (facture.numeroFacture?.toLowerCase() || '').includes(search) ||
        (facture.structureNom?.toLowerCase() || '').includes(search) ||
        (facture.objet?.toLowerCase() || '').includes(search) ||
        (facture.artisteNom?.toLowerCase() || '').includes(search)
      );
    }

    // Filtre par date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(facture => {
        const factureDate = facture.dateFacture?.toDate ? facture.dateFacture.toDate() : new Date(facture.dateFacture);
        return factureDate >= filterDate;
      });
    }

    // Filtre par statut
    if (statusFilter) {
      filtered = filtered.filter(facture => facture.status === statusFilter);
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Gestion des dates
      if (sortField === 'dateFacture' || sortField === 'dateEcheance') {
        aVal = aVal?.toDate ? aVal.toDate() : new Date(aVal || 0);
        bVal = bVal?.toDate ? bVal.toDate() : new Date(bVal || 0);
      }

      // Gestion des montants
      if (sortField === 'montantHT' || sortField === 'montantTTC') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [factures, searchTerm, dateFilter, statusFilter, sortField, sortDirection]);

  // Gestion du tri
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (factures.length === 0 && !searchTerm && !dateFilter && !statusFilter) {
    return (
      <EntityEmptyState
        icon="bi-receipt"
        message={emptyMessage}
        actionLabel="Paramètres de facturation"
        onAction={() => navigate('/parametres/factures')}
      />
    );
  }

  return (
    <div className={styles.tableContainer}>
      {/* Barre de recherche et filtres */}
      {(showSearch || showFilters) && (
        <div className={styles.tableHeader}>
          <div className={styles.tableFilters}>
            {showSearch && (
              <InputGroup className={styles.searchBar}>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par référence, client, objet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            )}
            
            {showFilters && (
              <>
                <Form.Control
                  type="date"
                  className={styles.dateFilter}
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Date minimum"
                />
                
                <Form.Select
                  className={styles.statusFilter}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyée</option>
                  <option value="paid">Payée</option>
                  <option value="overdue">En retard</option>
                  <option value="cancelled">Annulée</option>
                </Form.Select>
              </>
            )}
          </div>
          
          <div className={styles.tableStats}>
            <span className="text-muted">
              {filteredAndSortedFactures.length} facture{filteredAndSortedFactures.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Tableau */}
      <Table
        columns={columns}
        data={filteredAndSortedFactures}
        onSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        responsive
      />
    </div>
  );
};

export default FacturesTableView;