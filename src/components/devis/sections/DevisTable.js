import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, InputGroup } from 'react-bootstrap';
import Table from '../../ui/Table';
import Badge from '../../ui/Badge';
import styles from './DevisTable.module.css';

/**
 * Table component to display devis list according to specifications
 * Tableau des devis selon spécifications TourCraft
 */
const DevisTable = ({ devis = [], onUpdateDevis }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [localDevis, setLocalDevis] = useState(devis);
  const itemsPerPage = 20;

  // Synchroniser les données locales avec les props
  useEffect(() => {
    setLocalDevis(devis);
  }, [devis]);

  // Filtrage et pagination des données
  const filteredDevis = useMemo(() => {
    let filtered = localDevis;
    
    // Filtre texte - recherche dans Ref, Structure, Projet
    if (searchTerm) {
      filtered = filtered.filter(devisItem => 
        devisItem.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        devisItem.structure?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        devisItem.projet?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [localDevis, searchTerm]);
  
  const totalPages = Math.ceil(filteredDevis.length / itemsPerPage);
  const paginatedDevis = filteredDevis.slice(
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
      case 'brouillon':
        return <Badge variant="gray">Brouillon</Badge>;
      case 'envoye':
        return <Badge variant="blue">Envoyé</Badge>;
      case 'accepte':
        return <Badge variant="green">Accepté</Badge>;
      case 'refuse':
        return <Badge variant="red">Refusé</Badge>;
      case 'annule':
        return <Badge variant="gray">Annulé</Badge>;
      default:
        return <Badge variant="gray">{statut || 'Brouillon'}</Badge>;
    }
  };

  const formatPeriodeEnvisagee = (periode) => {
    if (!periode) return '—';
    if (typeof periode === 'string') return periode;
    if (periode.dateDebut && periode.dateFin) {
      const debut = formatDate(periode.dateDebut);
      const fin = formatDate(periode.dateFin);
      return `${debut} - ${fin}`;
    }
    if (periode.dateDebut) {
      return `le ${formatDate(periode.dateDebut)}`;
    }
    return '—';
  };
  
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedDevis.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedDevis.map(d => d.id)));
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

  const handleUpdateStatut = (devisId, newStatut) => {
    const updatedDevis = localDevis.map(devisItem => 
      devisItem.id === devisId 
        ? { ...devisItem, statut: newStatut }
        : devisItem
    );
    setLocalDevis(updatedDevis);
    
    if (onUpdateDevis) {
      const devisItem = updatedDevis.find(d => d.id === devisId);
      onUpdateDevis(devisItem);
    }
  };
  
  const handleReset = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    console.log('Rafraîchir la liste');
    // Recharger les données
    window.location.reload();
  };

  // Colonnes selon spécifications
  const columns = [
    {
      label: (
        <Form.Check
          type="checkbox"
          checked={selectedRows.size === paginatedDevis.length && paginatedDevis.length > 0}
          onChange={handleSelectAll}
        />
      ),
      key: 'select',
      sortable: false,
      render: (devisItem) => (
        <Form.Check
          type="checkbox"
          checked={selectedRows.has(devisItem.id)}
          onChange={() => handleSelectRow(devisItem.id)}
        />
      )
    },
    {
      label: 'Ref',
      key: 'ref',
      sortable: true,
      render: (devisItem) => <span>{devisItem.ref || '—'}</span>
    },
    {
      label: 'Émetteur',
      key: 'emetteur',
      sortable: true,
      render: (devisItem) => <span className={styles.emetteurCode}>{devisItem.emetteur || 'Utilisateur'}</span>
    },
    {
      label: 'Collaborateur',
      key: 'collaborateur',
      sortable: true,
      render: (devisItem) => <span className={styles.collaborateurCode}>{devisItem.collaborateur || '—'}</span>
    },
    {
      label: 'Structure',
      key: 'structure',
      sortable: true,
      render: (devisItem) => <span>{devisItem.structure || '—'}</span>
    },
    {
      label: 'Projet',
      key: 'projet',
      sortable: true,
      render: (devisItem) => <span>{devisItem.projet || '—'}</span>
    },
    {
      label: 'Nb',
      key: 'nbRepresentations',
      sortable: true,
      render: (devisItem) => <span className={styles.centeredCell}>{devisItem.nbRepresentations || '1'}</span>
    },
    {
      label: 'Période envisagée',
      key: 'periodeEnvisagee',
      sortable: true,
      render: (devisItem) => <span>{formatPeriodeEnvisagee(devisItem.periodeEnvisagee)}</span>
    },
    {
      label: 'Objet',
      key: 'objet',
      sortable: true,
      render: (devisItem) => <span className={styles.objetCell}>{devisItem.objet || '—'}</span>
    },
    {
      label: 'Validité',
      key: 'dateValidite',
      sortable: true,
      render: (devisItem) => <span>{formatDate(devisItem.dateValidite)}</span>
    },
    {
      label: 'Statut',
      key: 'statut',
      sortable: true,
      render: (devisItem) => getStatutBadge(devisItem.statut)
    },
    {
      label: 'Montant HT',
      key: 'montantHT',
      sortable: true,
      render: (devisItem) => <span className={styles.montant}>{formatMontant(devisItem.montantHT)}</span>
    },
    {
      label: 'Montant TTC',
      key: 'montantTTC',
      sortable: true,
      render: (devisItem) => <span className={styles.montant}>{formatMontant(devisItem.montantTTC)}</span>
    },
    {
      label: 'Devise',
      key: 'devise',
      sortable: true,
      render: (devisItem) => <span>{devisItem.devise || 'EUR'}</span>
    },
    {
      label: '',
      key: 'envoye',
      sortable: false,
      render: (devisItem) => (
        devisItem.envoye ? (
          <span className={styles.checkmark}>✓</span>
        ) : (
          <span className={styles.emptyCheckmark}>□</span>
        )
      )
    },
    {
      label: '',
      key: 'accepte',
      sortable: false,
      render: (devisItem) => (
        devisItem.accepte ? (
          <span className={styles.checkmark}>✓</span>
        ) : devisItem.statut === 'envoye' ? (
          <span className={styles.pendingTriangle}>△</span>
        ) : (
          <span className={styles.emptyCheckmark}>□</span>
        )
      )
    }
  ];

  // Actions par ligne
  const renderActions = (devisItem) => (
    <div className={styles.actionButtons} onClick={e => e.stopPropagation()}>
      <button 
        className={styles.actionButton}
        onClick={() => navigate(`/devis/${devisItem.id}/edit`)} 
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => window.open(`/devis/${devisItem.id}/pdf`, '_blank')} 
        title="PDF"
      >
        <i className="bi bi-download"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => {
          // Logique d'envoi par email
          handleUpdateStatut(devisItem.id, 'envoye');
          console.log('Envoyer devis:', devisItem.id);
        }} 
        title="Envoyer"
      >
        <i className="bi bi-envelope"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => {
          // Logique de duplication
          console.log('Dupliquer devis:', devisItem.id);
        }} 
        title="Dupliquer"
      >
        <i className="bi bi-plus-lg"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => navigate(`/devis/${devisItem.id}`)} 
        title="Ouvrir"
      >
        <i className="bi bi-link-45deg"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => {
          if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
            console.log('Suppression devis:', devisItem.id);
          }
        }} 
        title="Supprimer"
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (devisItem) => {
    navigate(`/devis/${devisItem.id}`);
  };

  return (
    <div className={styles.tableContainer}>
      {/* Barre d'outils */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.pagination}>
            {currentPage} / {totalPages || 1}
          </span>
          
          <button 
            className={styles.refreshButton}
            onClick={handleRefresh}
            title="Rafraîchir"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
          
          <InputGroup className={styles.searchGroup}>
            <Form.Control
              type="text"
              placeholder="(Référence, Structure, Projet)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
          </InputGroup>
        </div>
        
        <div className={styles.toolbarRight}>
          <Button 
            variant="outline-secondary"
            size="sm"
            onClick={handleReset}
            className={styles.toolbarBtn}
          >
            Voir tout
          </Button>
        </div>
      </div>
      
      {/* Tableau */}
      <Table
        columns={columns}
        data={paginatedDevis}
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

export default DevisTable;