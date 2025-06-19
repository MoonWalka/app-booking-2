import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, InputGroup, Dropdown } from 'react-bootstrap';
import Table from '../../ui/Table';
import Badge from '../../ui/Badge';
import styles from './ContratsTable.module.css';

/**
 * Table component to display invoices list
 * Tableau des factures selon spécifications TourCraft
 */
const ContratsTable = ({ factures = [], onUpdateFacture }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateEcheanceMin, setDateEcheanceMin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [localFactures, setLocalFactures] = useState(factures);
  const itemsPerPage = 20;

  // Synchroniser les données locales avec les props
  useEffect(() => {
    setLocalFactures(factures);
  }, [factures]);

  // Filtrage et pagination des données
  const filteredFactures = useMemo(() => {
    let filtered = localFactures;
    
    // Filtre texte
    if (searchTerm) {
      filtered = filtered.filter(facture => 
        facture.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facture.destinataire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facture.projet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facture.lieu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facture.ville?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre date d'échéance
    if (dateEcheanceMin) {
      const minDate = new Date(dateEcheanceMin);
      filtered = filtered.filter(facture => {
        if (!facture.dateEcheance) return false;
        const echeanceDate = new Date(facture.dateEcheance);
        return echeanceDate >= minDate;
      });
    }
    
    return filtered;
  }, [localFactures, searchTerm, dateEcheanceMin]);
  
  const totalPages = Math.ceil(filteredFactures.length / itemsPerPage);
  const paginatedFactures = filteredFactures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const formatDate = (dateValue) => {
    if (!dateValue) return '—';
    try {
      const date = dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue);
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      return '—';
    }
  };
  
  const formatMontant = (montant) => {
    if (!montant) return '0,00';
    return parseFloat(montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
  };
  
  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'payee':
        return <Badge variant="green">Payée</Badge>;
      case 'envoyee':
        return <Badge variant="blue">Envoyée</Badge>;
      case 'en_attente':
        return <Badge variant="yellow">En attente</Badge>;
      default:
        return <Badge variant="gray">—</Badge>;
    }
  };
  
  const getEtatBadge = (etat) => {
    switch (etat) {
      case 'validee':
        return <Badge variant="green">Validée</Badge>;
      case 'brouillon':
        return <Badge variant="gray">Brouillon</Badge>;
      case 'annulee':
        return <Badge variant="red">Annulée</Badge>;
      default:
        return <Badge variant="gray">—</Badge>;
    }
  };
  
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedFactures.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedFactures.map(f => f.id)));
    }
  };
  
  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };
  
  const handleReset = () => {
    setSearchTerm('');
    setDateEcheanceMin('');
    setCurrentPage(1);
  };
  
  const handleCalculer = () => {
    // Logique de recalcul des totaux
    console.log('Recalcul des totaux');
  };
  
  const handleExportXls = () => {
    // Logique d'export Excel
    console.log('Export Excel');
  };
  
  const handleExportPdf = () => {
    // Logique d'export PDF
    console.log('Export PDF');
  };

  const handleToggleEnvoyee = (factureId) => {
    const updatedFactures = localFactures.map(facture => 
      facture.id === factureId 
        ? { ...facture, envoyee: true }
        : facture
    );
    setLocalFactures(updatedFactures);
    
    // Appel callback parent si fourni
    if (onUpdateFacture) {
      const facture = updatedFactures.find(f => f.id === factureId);
      onUpdateFacture(facture);
    }
  };

  const handleTogglePayee = (factureId) => {
    const updatedFactures = localFactures.map(facture => 
      facture.id === factureId 
        ? { ...facture, payee: true, datePaiement: new Date() }
        : facture
    );
    setLocalFactures(updatedFactures);
    
    // Appel callback parent si fourni
    if (onUpdateFacture) {
      const facture = updatedFactures.find(f => f.id === factureId);
      onUpdateFacture(facture);
    }
  };

  // Colonnes selon spécifications
  const columns = [
    {
      label: (
        <Form.Check
          type="checkbox"
          checked={selectedRows.size === paginatedFactures.length && paginatedFactures.length > 0}
          onChange={handleSelectAll}
        />
      ),
      key: 'select',
      sortable: false,
      render: (facture) => (
        <Form.Check
          type="checkbox"
          checked={selectedRows.has(facture.id)}
          onChange={() => handleSelectRow(facture.id)}
        />
      )
    },
    {
      label: 'Ref',
      key: 'ref',
      sortable: true,
      render: (facture) => <span>{facture.ref || '—'}</span>
    },
    {
      label: 'Nature',
      key: 'nature',
      sortable: true,
      render: (facture) => <span>{facture.nature || '—'}</span>
    },
    {
      label: 'Émetteur',
      key: 'emetteur',
      sortable: true,
      render: (facture) => <span>{facture.emetteur || '—'}</span>
    },
    {
      label: 'Destinataire',
      key: 'destinataire',
      sortable: true,
      render: (facture) => <span>{facture.destinataire || '—'}</span>
    },
    {
      label: 'Projet',
      key: 'projet',
      sortable: true,
      render: (facture) => <span>{facture.projet || '—'}</span>
    },
    {
      label: 'Date',
      key: 'dateEvenement',
      sortable: true,
      render: (facture) => <span>{formatDate(facture.dateEvenement)}</span>
    },
    {
      label: 'Factur./Échéance',
      key: 'dateEcheance',
      sortable: true,
      render: (facture) => <span>{formatDate(facture.dateEcheance)}</span>
    },
    {
      label: 'TTC',
      key: 'montantTTC',
      sortable: true,
      render: (facture) => <span className={styles.montant}>{formatMontant(facture.montantTTC)}</span>
    },
    {
      label: 'Devise',
      key: 'devise',
      sortable: true,
      render: (facture) => <span>{facture.devise || 'EUR'}</span>
    },
    {
      label: 'Statut',
      key: 'statut',
      sortable: true,
      render: (facture) => getStatutBadge(facture.statut)
    },
    {
      label: 'État',
      key: 'etat',
      sortable: true,
      render: (facture) => getEtatBadge(facture.etat)
    },
    {
      label: 'Env.',
      key: 'envoyee',
      sortable: true,
      render: (facture) => (
        facture.envoyee ? (
          <span className={styles.checkmark}>✓</span>
        ) : (
          <Dropdown>
            <Dropdown.Toggle 
              variant="link" 
              id={`dropdown-envoyee-${facture.id}`}
              className={styles.dropdownToggle}
            >
              <span className={styles.crossClickable}>X</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                onClick={() => handleToggleEnvoyee(facture.id)}
                className={styles.dropdownItem}
              >
                <i className="bi bi-check-circle text-success me-2"></i>
                Marquer comme envoyée
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )
      )
    },
    {
      label: 'Payé',
      key: 'payee',
      sortable: true,
      render: (facture) => (
        facture.payee ? (
          <span className={styles.checkmark}>✓</span>
        ) : (
          <Dropdown>
            <Dropdown.Toggle 
              variant="link" 
              id={`dropdown-payee-${facture.id}`}
              className={styles.dropdownToggle}
            >
              <span className={styles.crossClickable}>X</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                onClick={() => handleTogglePayee(facture.id)}
                className={styles.dropdownItem}
              >
                <i className="bi bi-check-circle text-success me-2"></i>
                Marquer comme payée
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )
      )
    },
    {
      label: 'Date paie.',
      key: 'datePaiement',
      sortable: true,
      render: (facture) => <span>{formatDate(facture.datePaiement)}</span>
    },
    {
      label: 'Export.',
      key: 'exportee',
      sortable: true,
      render: (facture) => (
        <span className={facture.exportee ? styles.dot : ''}>
          {facture.exportee ? '•' : ''}
        </span>
      )
    },
    {
      label: 'Montant payé',
      key: 'montantPaye',
      sortable: true,
      render: (facture) => <span className={styles.montant}>{formatMontant(facture.montantPaye)}</span>
    },
    {
      label: 'Reste dû',
      key: 'resteDu',
      sortable: true,
      render: (facture) => {
        const reste = (facture.montantTTC || 0) - (facture.montantPaye || 0);
        return <span className={styles.montant}>{formatMontant(reste)}</span>;
      }
    }
  ];

  // Actions par ligne
  const renderActions = (facture) => (
    <div className={styles.actionButtons} onClick={e => e.stopPropagation()}>
      <button 
        className={styles.actionButton}
        onClick={() => navigate(`/factures/${facture.id}/edit`)} 
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => window.open(`/factures/${facture.id}/pdf`, '_blank')} 
        title="PDF"
      >
        <i className="bi bi-file-pdf"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => navigate(`/factures/${facture.id}/duplicate`)} 
        title="Dupliquer"
      >
        <i className="bi bi-files"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => {
          if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            console.log('Suppression facture:', facture.id);
          }
        }} 
        title="Supprimer"
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (facture) => {
    navigate(`/factures/${facture.id}`);
  };

  return (
    <div className={styles.tableContainer}>
      {/* Barre d'outils */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.pagination}>
            {currentPage} / {totalPages || 1}
          </span>
          
          <InputGroup className={styles.searchGroup}>
            <Form.Control
              type="text"
              placeholder="ref nom lieu ville projet"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
          </InputGroup>
          
          <div className={styles.dateFilter}>
            <Form.Label className={styles.filterLabel}>Date d'échéance à partir du</Form.Label>
            <Form.Control
              type="date"
              value={dateEcheanceMin}
              onChange={(e) => setDateEcheanceMin(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>
        
        <div className={styles.toolbarRight}>
          <Button 
            variant="outline-primary"
            size="sm"
            onClick={() => setCurrentPage(1)}
            className={styles.toolbarBtn}
          >
            Filtrer
          </Button>
          
          <Button 
            variant="outline-secondary"
            size="sm"
            onClick={handleReset}
            className={styles.toolbarBtn}
          >
            Voir tout
          </Button>
          
          <Button 
            variant="outline-info"
            size="sm"
            onClick={handleCalculer}
            className={styles.toolbarBtn}
          >
            Calculer
          </Button>
          
          <Button 
            variant="outline-success"
            size="sm"
            onClick={handleExportXls}
            className={styles.toolbarBtn}
          >
            Xls
          </Button>
          
          <Button 
            variant="outline-danger"
            size="sm"
            onClick={handleExportPdf}
            className={styles.toolbarBtn}
            title="Export PDF"
          >
            <i className="bi bi-file-pdf"></i>
          </Button>
        </div>
      </div>
      
      {/* Tableau */}
      <Table
        columns={columns}
        data={paginatedFactures}
        renderActions={renderActions}
        onRowClick={handleRowClick}
      />
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.paginationControls}>
          <Button 
            variant="outline-primary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Précédent
          </Button>
          
          <span className={styles.pageInfo}>
            Page {currentPage} sur {totalPages}
          </span>
          
          <Button 
            variant="outline-primary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContratsTable; 