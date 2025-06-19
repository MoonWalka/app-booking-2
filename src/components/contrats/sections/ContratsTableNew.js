import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, InputGroup, Dropdown } from 'react-bootstrap';
import Table from '../../ui/Table';
import Badge from '../../ui/Badge';
import styles from './ContratsTableNew.module.css';

/**
 * Table component to display contracts list
 * Tableau des contrats selon spécifications TourCraft
 */
const ContratsTableNew = ({ contrats = [], onUpdateContrat }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateValiditeMin, setDateValiditeMin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [localContrats, setLocalContrats] = useState(contrats);
  const itemsPerPage = 20;

  // Synchroniser les données locales avec les props
  useEffect(() => {
    setLocalContrats(contrats);
  }, [contrats]);

  // Filtrage et pagination des données
  const filteredContrats = useMemo(() => {
    let filtered = localContrats;
    
    // Filtre texte
    if (searchTerm) {
      filtered = filtered.filter(contrat => 
        contrat.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.artiste?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.raisonSociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.projet?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre date de validité
    if (dateValiditeMin) {
      const minDate = new Date(dateValiditeMin);
      filtered = filtered.filter(contrat => {
        if (!contrat.dateValidite) return false;
        const validiteDate = new Date(contrat.dateValidite);
        return validiteDate >= minDate;
      });
    }
    
    return filtered;
  }, [localContrats, searchTerm, dateValiditeMin]);
  
  const totalPages = Math.ceil(filteredContrats.length / itemsPerPage);
  const paginatedContrats = filteredContrats.slice(
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

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Cession':
        return <Badge variant="blue">Cession</Badge>;
      case 'Coréo':
        return <Badge variant="green">Coréo</Badge>;
      case 'Promo':
        return <Badge variant="yellow">Promo</Badge>;
      default:
        return <Badge variant="gray">{type || '—'}</Badge>;
    }
  };
  
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedContrats.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedContrats.map(c => c.id)));
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

  const handleToggleEnvoye = (contratId) => {
    const updatedContrats = localContrats.map(contrat => 
      contrat.id === contratId 
        ? { ...contrat, envoye: true }
        : contrat
    );
    setLocalContrats(updatedContrats);
    
    if (onUpdateContrat) {
      const contrat = updatedContrats.find(c => c.id === contratId);
      onUpdateContrat(contrat);
    }
  };

  const handleToggleSigne = (contratId) => {
    const updatedContrats = localContrats.map(contrat => 
      contrat.id === contratId 
        ? { ...contrat, signe: true, dateSignature: new Date() }
        : contrat
    );
    setLocalContrats(updatedContrats);
    
    if (onUpdateContrat) {
      const contrat = updatedContrats.find(c => c.id === contratId);
      onUpdateContrat(contrat);
    }
  };
  
  const handleReset = () => {
    setSearchTerm('');
    setDateValiditeMin('');
    setCurrentPage(1);
  };

  const handleCalculer = () => {
    console.log('Recalcul des totaux');
  };

  const handleExportXls = () => {
    console.log('Export Excel');
  };

  const handleExportPdf = () => {
    console.log('Export PDF');
  };

  // Colonnes selon spécifications TourCraft
  const columns = [
    // ===== COLONNE SELECTION =====
    // Case à cocher pour sélection multiple des contrats
    {
      label: (
        <Form.Check
          type="checkbox"
          checked={selectedRows.size === paginatedContrats.length && paginatedContrats.length > 0}
          onChange={handleSelectAll}
        />
      ),
      key: 'select',
      sortable: false,
      render: (contrat) => (
        <Form.Check
          type="checkbox"
          checked={selectedRows.has(contrat.id)}
          onChange={() => handleSelectRow(contrat.id)}
        />
      )
    },
    
    // ===== COLONNE REF =====
    // Référence/numéro du contrat (ex: CONT-001)
    {
      label: 'Ref',
      key: 'ref',
      sortable: true,
      render: (contrat) => <span>{contrat.ref || '—'}</span>
    },
    
    // ===== COLONNE ENTR (ENTREPRISE) =====
    // Code/nom abrégé de l'entreprise émettrice du contrat
    // Ex: "TourCraft", "SARL MUSIC", etc.
    {
      label: 'Entr',
      key: 'entreprise',
      sortable: true,
      render: (contrat) => <span className={styles.entrepriseCode}>{contrat.entrepriseCode || '—'}</span>
    },
    
    // ===== COLONNE COLL. (COLLABORATEUR) =====
    // Initiales ou code du collaborateur/booker responsable
    // Ex: "LT", "JD", "AB", etc.
    {
      label: 'Coll.',
      key: 'collaborateur',
      sortable: true,
      render: (contrat) => <span className={styles.collaborateurCode}>{contrat.collaborateurCode || '—'}</span>
    },
    
    // ===== COLONNE TYPE =====
    // Type de contrat utilisé (défini lors de l'association avec les modèles de contrats)
    // Quand on choisit le modèle de contrat, son type doit être affiché ici
    // Ex: "Cession", "Coréo", "Promo", "Standard", etc.
    // IMPORTANT: Ce champ doit être mis à jour depuis la sélection du modèle de contrat
    {
      label: 'Type',
      key: 'type',
      sortable: true,
      render: (contrat) => getTypeBadge(contrat.type)
      // NOTE: contrat.type doit être rempli depuis les modèles de contrats sélectionnés
    },
    
    // ===== COLONNE ARTISTE =====
    // Nom de l'artiste concerné par le contrat
    {
      label: 'Artiste',
      key: 'artiste',
      sortable: true,
      render: (contrat) => <span>{contrat.artiste || '—'}</span>
    },
    
    // ===== COLONNE RAISON SOCIALE =====
    // Nom officiel/raison sociale de la structure contractante
    // C'est le nom légal de l'entité qui signe le contrat côté client
    // Ex: "SARL Les Productions Musicales", "Association Culturelle XYZ", etc.
    {
      label: 'Raison sociale',
      key: 'raisonSociale',
      sortable: true,
      render: (contrat) => <span>{contrat.raisonSociale || '—'}</span>
      // NOTE: Correspond au nom officiel de la structure/contractant
    },
    
    // ===== COLONNE DATE =====
    // Date de l'événement principal du contrat
    {
      label: 'Date',
      key: 'dateEvenement',
      sortable: true,
      render: (contrat) => <span>{formatDate(contrat.dateEvenement)}</span>
    },
    
    // ===== COLONNE ENVOYÉ =====
    // Statut d'envoi du contrat (✓ si envoyé, X cliquable sinon)
    {
      label: 'Envoyé',
      key: 'envoye',
      sortable: true,
      render: (contrat) => (
        contrat.envoye ? (
          <span className={styles.checkmark}>✓</span>
        ) : (
          <Dropdown>
            <Dropdown.Toggle 
              variant="link" 
              id={`dropdown-envoye-${contrat.id}`}
              className={styles.dropdownToggle}
            >
              <span className={styles.crossClickable}>X</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                onClick={() => handleToggleEnvoye(contrat.id)}
                className={styles.dropdownItem}
              >
                <i className="bi bi-check-circle text-success me-2"></i>
                Marquer comme envoyé
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )
      )
    },
    
    // ===== COLONNE SIGNÉ =====
    // Statut de signature du contrat (✓ si signé, X cliquable sinon)
    {
      label: 'Signé',
      key: 'signe',
      sortable: true,
      render: (contrat) => (
        contrat.signe ? (
          <span className={styles.checkmark}>✓</span>
        ) : (
          <Dropdown>
            <Dropdown.Toggle 
              variant="link" 
              id={`dropdown-signe-${contrat.id}`}
              className={styles.dropdownToggle}
            >
              <span className={styles.crossClickable}>X</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                onClick={() => handleToggleSigne(contrat.id)}
                className={styles.dropdownItem}
              >
                <i className="bi bi-check-circle text-success me-2"></i>
                Marquer comme signé
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )
      )
    },
    
    // ===== COLONNE VALIDITÉ =====
    // Date de validité/expiration du contrat
    {
      label: 'Validité',
      key: 'dateValidite',
      sortable: true,
      render: (contrat) => <span>{formatDate(contrat.dateValidite)}</span>
    },
    
    // ===== COLONNE SIGNATURE =====
    // IMPORTANT: Champ DATE de signature du contrat
    // Affiche la date à laquelle le contrat a été signé (pas un texte)
    // Format: JJ/MM/AAAA ou "—" si pas encore signé
    {
      label: 'Signature',
      key: 'dateSignature',
      sortable: true,
      render: (contrat) => <span>{formatDate(contrat.dateSignature) || '—'}</span>
      // NOTE: Utilise contrat.dateSignature (type Date) pour afficher la date de signature
    },
    {
      label: 'Total HT',
      key: 'totalHT',
      sortable: true,
      render: (contrat) => <span className={styles.montant}>{formatMontant(contrat.totalHT)}</span>
    },
    {
      label: 'Montant consolidé HT',
      key: 'montantConsolideHT',
      sortable: true,
      render: (contrat) => <span className={styles.montant}>{formatMontant(contrat.montantConsolideHT)}</span>
    },
    {
      label: 'Reste de TTC',
      key: 'resteTTC',
      sortable: true,
      render: (contrat) => {
        const reste = (contrat.totalTTC || 0) - (contrat.montantPaye || 0);
        return <span className={styles.montant}>{formatMontant(reste)}</span>;
      }
    },
    {
      label: 'Devise',
      key: 'devise',
      sortable: true,
      render: (contrat) => <span>{contrat.devise || 'EUR'}</span>
    },
    // ===== COLONNE ICÔNE CONTRAT =====
    // Icône qui change de couleur selon l'état d'avancement du contrat
    // ÉVOLUTION DES COULEURS SELON L'ÉTAT :
    // - 🔘 Gris (text-muted) : Pas de contrat généré
    // - 🟡 Jaune (text-warning) : Contrat en brouillon/rédaction
    // - 🔵 Bleu (text-primary) : Contrat généré mais pas envoyé
    // - 🟠 Orange (text-info) : Contrat envoyé mais pas signé
    // - 🟢 Vert (text-success) : Contrat signé et complet
    {
      label: 'Contrat',
      key: 'contratIcon',
      sortable: false,
      render: (contrat) => (
        <div className={styles.iconCell}>
          {contrat.contratGenere ? (
            <i 
              className="bi bi-file-earmark-check-fill text-success"
              title="Contrat généré"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/contrats/${contrat.id}`);
              }}
            ></i>
          ) : (
            <i 
              className="bi bi-file-earmark text-muted"
              title="Pas de contrat"
            ></i>
          )}
          {/* TODO: Implémenter la logique des couleurs selon l'état :
              - contrat.statut === 'brouillon' → text-warning (jaune)
              - contrat.statut === 'genere' → text-primary (bleu)
              - contrat.statut === 'envoye' → text-info (orange)
              - contrat.statut === 'signe' → text-success (vert)
          */}
        </div>
      )
    },
    
    // ===== COLONNE ICÔNE DEVIS =====
    // Icône qui change de couleur selon l'état d'avancement du devis
    // ÉVOLUTION DES COULEURS SELON L'ÉTAT :
    // - 🔘 Gris (text-muted) : Pas de devis
    // - 🟡 Jaune (text-warning) : Devis en brouillon
    // - 🔵 Bleu (text-primary) : Devis généré mais pas envoyé
    // - 🟠 Orange (text-info) : Devis envoyé en attente de réponse
    // - 🟢 Vert (text-success) : Devis accepté par le client
    // - 🔴 Rouge (text-danger) : Devis refusé
    {
      label: 'Devis',
      key: 'devisIcon',
      sortable: false,
      render: (contrat) => (
        <div className={styles.iconCell}>
          {contrat.devisId ? (
            <i 
              className="bi bi-file-earmark-check-fill text-primary"
              title="Devis généré"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/devis/${contrat.devisId}`);
              }}
            ></i>
          ) : (
            <i 
              className="bi bi-file-earmark text-muted"
              title="Pas de devis"
            ></i>
          )}
          {/* TODO: Implémenter la logique des couleurs selon l'état du devis :
              - devis.statut === 'brouillon' → text-warning (jaune)
              - devis.statut === 'genere' → text-primary (bleu)
              - devis.statut === 'envoye' → text-info (orange)
              - devis.statut === 'accepte' → text-success (vert)
              - devis.statut === 'refuse' → text-danger (rouge)
          */}
        </div>
      )
    },
    
    // ===== COLONNE ICÔNE FACTURE =====
    // Icône qui change de couleur selon l'état d'avancement de la facture
    // ÉVOLUTION DES COULEURS SELON L'ÉTAT :
    // - 🔘 Gris (text-muted) : Pas de facture
    // - 🟡 Jaune (text-warning) : Facture en brouillon
    // - 🔵 Bleu (text-primary) : Facture générée mais pas envoyée
    // - 🟠 Orange (text-info) : Facture envoyée en attente de paiement
    // - 🟢 Vert (text-success) : Facture payée intégralement
    // - 🔴 Rouge (text-danger) : Facture en retard de paiement
    {
      label: 'Facture',
      key: 'factureIcon',
      sortable: false,
      render: (contrat) => (
        <div className={styles.iconCell}>
          {contrat.factureId ? (
            <i 
              className="bi bi-receipt-cutoff text-warning"
              title="Facture générée"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/factures/${contrat.factureId}`);
              }}
            ></i>
          ) : (
            <i 
              className="bi bi-receipt text-muted"
              title="Pas de facture"
            ></i>
          )}
          {/* TODO: Implémenter la logique des couleurs selon l'état de la facture :
              - facture.statut === 'brouillon' → text-warning (jaune)
              - facture.statut === 'generee' → text-primary (bleu)
              - facture.statut === 'envoyee' → text-info (orange)
              - facture.statut === 'payee' → text-success (vert)
              - facture.statut === 'retard' → text-danger (rouge)
              
              Logique de calcul pour le statut de paiement :
              - Si montantPaye >= montantTotal → 'payee' (vert)
              - Si dateEcheance < aujourd'hui && montantPaye < montantTotal → 'retard' (rouge)
              - Si envoyee && montantPaye < montantTotal → 'envoyee' (orange)
          */}
        </div>
      )
    }
  ];

  // Actions par ligne
  const renderActions = (contrat) => (
    <div className={styles.actionButtons} onClick={e => e.stopPropagation()}>
      <button 
        className={styles.actionButton}
        onClick={() => navigate(`/contrats/${contrat.id}/edit`)} 
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => window.open(`/contrats/${contrat.id}/pdf`, '_blank')} 
        title="PDF"
      >
        <i className="bi bi-file-pdf"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => {
          // Logique d'envoi
          console.log('Envoyer contrat:', contrat.id);
        }} 
        title="Envoyer"
      >
        <i className="bi bi-envelope"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => {
          if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
            console.log('Suppression contrat:', contrat.id);
          }
        }} 
        title="Supprimer"
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (contrat) => {
    navigate(`/contrats/${contrat.id}`);
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
            <Form.Label className={styles.filterLabel}>Date de validité à partir du</Form.Label>
            <Form.Control
              type="date"
              value={dateValiditeMin}
              onChange={(e) => setDateValiditeMin(e.target.value)}
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
        data={paginatedContrats}
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

export default ContratsTableNew;