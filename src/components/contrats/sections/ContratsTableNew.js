import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, InputGroup, Dropdown } from 'react-bootstrap';
import contratService from '@/services/contratService';
import Table from '../../ui/Table';
import Badge from '../../ui/Badge';
import styles from './ContratsTableNew.module.css';

/**
 * Table component to display contracts list
 * Tableau des contrats selon spécifications TourCraft
 */
const ContratsTableNew = ({ 
  contrats = [], 
  onUpdateContrat,
  // Fonctions directes du contexte (comme DatesTableView)
  openDevisTab,
  openNewDevisTab,
  openContratTab,
  handleViewFacture,
  handleGenerateFacture,
  getStructureName
}) => {
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
        (typeof contrat.artiste === 'string' ? contrat.artiste : contrat.artiste?.nom)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    // Normaliser le type en minuscules pour la comparaison
    const normalizedType = (type || '').toLowerCase();
    
    switch (normalizedType) {
      case 'cession':
        return <Badge variant="blue">Cession</Badge>;
      case 'corealisation':
      case 'coréalisation':
      case 'coréo':
        return <Badge variant="green">Coréalisation</Badge>;
      case 'coproduction':
        return <Badge variant="purple">Coproduction</Badge>;
      case 'residence':
      case 'résidence':
        return <Badge variant="orange">Résidence</Badge>;
      case 'travail':
        return <Badge variant="red">CDD Usage</Badge>;
      case 'promo':
      case 'promotion':
        return <Badge variant="yellow">Promotion</Badge>;
      case 'autre':
        return <Badge variant="gray">Autre</Badge>;
      default:
        // Si le type est présent mais non reconnu, l'afficher avec une majuscule
        return <Badge variant="gray">{type ? type.charAt(0).toUpperCase() + type.slice(1) : '—'}</Badge>;
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
        ? { ...contrat, envoye: !contrat.envoye }
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
        ? { 
            ...contrat, 
            signe: !contrat.signe, 
            dateSignature: !contrat.signe ? new Date() : null 
          }
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
      render: (contrat) => <span>{typeof contrat.artiste === 'string' ? contrat.artiste : contrat.artiste?.nom || '—'}</span>
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
        <Dropdown>
          <Dropdown.Toggle 
            variant="link" 
            id={`dropdown-envoye-${contrat.id}`}
            className={styles.dropdownToggle}
          >
            {contrat.envoye ? (
              <span className={styles.checkmark}>✓</span>
            ) : (
              <span className={styles.crossClickable}>X</span>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item 
              onClick={() => handleToggleEnvoye(contrat.id)}
              className={styles.dropdownItem}
            >
              {contrat.envoye ? (
                <>
                  <i className="bi bi-x-circle text-danger me-2"></i>
                  Marquer comme non envoyé
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Marquer comme envoyé
                </>
              )}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )
    },
    
    // ===== COLONNE SIGNÉ =====
    // Statut de signature du contrat (✓ si signé, X cliquable sinon)
    {
      label: 'Signé',
      key: 'signe',
      sortable: true,
      render: (contrat) => (
        <Dropdown>
          <Dropdown.Toggle 
            variant="link" 
            id={`dropdown-signe-${contrat.id}`}
            className={styles.dropdownToggle}
          >
            {contrat.signe ? (
              <span className={styles.checkmark}>✓</span>
            ) : (
              <span className={styles.crossClickable}>X</span>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item 
              onClick={() => handleToggleSigne(contrat.id)}
              className={styles.dropdownItem}
            >
              {contrat.signe ? (
                <>
                  <i className="bi bi-x-circle text-danger me-2"></i>
                  Marquer comme non signé
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Marquer comme signé
                </>
              )}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
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
      render: (contrat) => {
        let iconClass, title, action;
        
        // Déterminer l'état du contrat selon le statut
        if (contrat.status === 'finalized' || contrat.status === 'signed') {
          iconClass = "bi bi-file-earmark-check-fill text-success";
          title = "Contrat finalisé - Voir";
        } else if (contrat.status === 'sent') {
          iconClass = "bi bi-file-earmark-arrow-up-fill text-info";
          title = "Contrat envoyé - Voir";
        } else if (contrat.status === 'generated') {
          iconClass = "bi bi-file-earmark-text-fill text-primary";
          title = "Contrat généré - Voir";
        } else if (contrat.status === 'draft' || contrat.contratGenere) {
          iconClass = "bi bi-file-earmark-text-fill text-warning";
          title = "Contrat en cours - Continuer";
        } else {
          iconClass = "bi bi-file-earmark text-muted";
          title = "Pas de contrat";
        }

        // Action pour ouvrir le contrat
        if (contrat.status || contrat.contratGenere) {
          action = () => {
            if (openContratTab && contrat.dateId) {
              const titre = `${contrat.artisteNom || 'Date'} - ${contrat.lieu || ''}`;
              const isRedige = contrat.status && contrat.status !== 'draft';
              openContratTab(contrat.dateId, titre, isRedige);
            }
          };
        }

        return (
          <div className={styles.iconCell}>
            <i 
              className={iconClass}
              title={title}
              style={{ cursor: action ? 'pointer' : 'default' }}
              onClick={action ? (e) => {
                e.stopPropagation();
                action();
              } : undefined}
            ></i>
          </div>
        );
      }
    },
    
    // ===== COLONNE ICÔNE DEVIS =====
    // Icône qui change de couleur selon l'état d'avancement du devis
    // ÉVOLUTION DES COULEURS SELON L'ÉTAT :
    // - 🔘 Gris (text-muted) : Pas de devis → Cliquable pour créer
    // - 🟡 Jaune (text-warning) : Devis en brouillon → Cliquable pour continuer
    // - 🔵 Bleu (text-primary) : Devis généré → Cliquable pour voir
    // - 🟠 Orange (text-info) : Devis envoyé → Cliquable pour voir
    // - 🟢 Vert (text-success) : Devis accepté → Cliquable pour voir
    // - 🔴 Rouge (text-danger) : Devis refusé → Cliquable pour voir
    {
      label: 'Devis',
      key: 'devisIcon',
      sortable: false,
      render: (contrat) => {
        console.log('[ContratsTableNew] Rendu devis pour contrat:', {
          id: contrat.id,
          hasDevis: contrat.hasDevis,
          devisId: contrat.devisId,
          devisStatus: contrat.devisStatus,
          dateId: contrat.dateId
        });

        let iconClass, title, action;
        
        if (contrat.hasDevis && contrat.devisId) {
          // Devis existant - déterminer la couleur selon le statut
          switch (contrat.devisStatus) {
            case 'accepte':
              iconClass = "bi bi-file-earmark-check-fill text-success";
              title = "Devis accepté - Voir";
              break;
            case 'envoye':
              iconClass = "bi bi-file-earmark-arrow-up-fill text-info";
              title = "Devis envoyé - Voir";
              break;
            case 'genere':
              iconClass = "bi bi-file-earmark-text-fill text-primary";
              title = "Devis généré - Voir";
              break;
            case 'refuse':
              iconClass = "bi bi-file-earmark-x-fill text-danger";
              title = "Devis refusé - Voir";
              break;
            case 'brouillon':
            default:
              iconClass = "bi bi-file-earmark-text-fill text-warning";
              title = "Devis en cours - Continuer";
              break;
          }
          
          action = () => {
            if (openDevisTab) {
              const devisTitle = `${contrat.devisNumero || 'Devis'} - ${contrat.artisteNom || 'Date'}`;
              openDevisTab(contrat.devisId, devisTitle);
            }
          };
        } else {
          // Pas de devis - icône grise cliquable pour créer
          iconClass = "bi bi-file-earmark text-muted";
          title = "Créer un devis";
          action = () => {
            if (openNewDevisTab && contrat.dateId) {
              const structureName = getStructureName ? getStructureName() : 'Structure';
              const title = `Nouveau Devis - ${structureName}`;
              openNewDevisTab(contrat.dateId, contrat.structureId, title);
            }
          };
        }

        return (
          <div className={styles.iconCell}>
            <i 
              className={iconClass}
              title={title}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                if (action) action();
              }}
            ></i>
          </div>
        );
      }
    },
    
    // ===== COLONNE ICÔNE FACTURE =====
    // Icône qui change de couleur selon l'état d'avancement de la facture
    // ÉVOLUTION DES COULEURS SELON L'ÉTAT :
    // - 🔘 Gris (text-muted) : Pas de facture
    // - 🟡 Jaune (text-warning) : Facture en brouillon ou peut être générée
    // - 🔵 Bleu (text-primary) : Facture générée mais pas envoyée
    // - 🟠 Orange (text-info) : Facture envoyée en attente de paiement
    // - 🟢 Vert (text-success) : Facture payée intégralement
    // - 🔴 Rouge (text-danger) : Facture en retard de paiement
    {
      label: 'Facture',
      key: 'factureIcon',
      sortable: false,
      render: (contrat) => {
        console.log('[ContratsTableNew] Rendu facture pour contrat:', {
          id: contrat.id,
          hasFacture: contrat.hasFacture,
          factureId: contrat.factureId,
          factureStatus: contrat.factureStatus,
          contratStatus: contrat.status,
          dateId: contrat.dateId
        });

        let iconClass, title, action, disabled = false;

        if (contrat.hasFacture && contrat.factureId) {
          // Facture existante - déterminer la couleur selon le statut
          const factureInfo = contrat.factureInfo || {};
          const isPayee = factureInfo.montantPaye >= factureInfo.montantTotal;
          const isEnRetard = factureInfo.dateEcheance && new Date(factureInfo.dateEcheance) < new Date() && !isPayee;

          if (isPayee) {
            iconClass = "bi bi-receipt-cutoff text-success";
            title = "Facture payée";
          } else if (isEnRetard) {
            iconClass = "bi bi-receipt text-danger";
            title = "Facture en retard";
          } else if (factureInfo.envoye) {
            iconClass = "bi bi-receipt text-info";
            title = "Facture envoyée";
          } else {
            iconClass = "bi bi-receipt text-primary";
            title = "Facture générée";
          }
          
          action = () => {
            if (handleViewFacture) {
              handleViewFacture(contrat.factureId);
            }
          };
        } else {
          // Pas de facture - vérifier si on peut en générer une
          const canGenerateFacture = contrat.status && 
            (contrat.status === 'finalized' || 
             contrat.status === 'signed' || 
             contrat.status === 'sent' || 
             contrat.status === 'draft');

          if (canGenerateFacture) {
            iconClass = "bi bi-receipt text-warning";
            title = "Générer une facture";
            action = () => {
              if (handleGenerateFacture && contrat.dateId) {
                handleGenerateFacture(contrat.dateId, contrat.id);
              }
            };
          } else {
            iconClass = "bi bi-receipt text-muted";
            title = "Contrat requis pour facturer";
            disabled = true;
          }
        }

        return (
          <div className={styles.iconCell}>
            <i 
              className={iconClass}
              title={title}
              style={{ cursor: disabled ? 'default' : 'pointer' }}
              onClick={disabled ? undefined : (e) => {
                e.stopPropagation();
                if (action) action();
              }}
            ></i>
          </div>
        );
      }
    }
  ];

  // Actions par ligne
  const renderActions = (contrat) => (
    <div className={styles.actionButtons} onClick={e => e.stopPropagation()}>
      <button 
        className={styles.actionButton}
        onClick={() => {
          if (openContratTab && contrat.dateId) {
            const titre = `${contrat.artisteNom || 'Date'} - ${contrat.lieu || ''}`;
            const isRedige = contrat.status && contrat.status !== 'draft';
            openContratTab(contrat.dateId, titre, isRedige);
          } else {
            navigate(`/contrats/${contrat.id}/edit`);
          }
        }} 
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
        onClick={async () => {
          if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
            try {
              await contratService.deleteContrat(contrat.id);
              // Mettre à jour l'état local immédiatement
              setLocalContrats(prev => prev.filter(c => c.id !== contrat.id));
              console.log('Contrat supprimé avec succès:', contrat.id);
            } catch (error) {
              console.error('Erreur lors de la suppression du contrat:', error);
              alert('Erreur lors de la suppression du contrat');
            }
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
    if (openContratTab && contrat.dateId) {
      const titre = `${contrat.artisteNom || 'Date'} - ${contrat.lieu || ''}`;
      const isRedige = contrat.status && contrat.status !== 'draft';
      openContratTab(contrat.dateId, titre, isRedige);
    } else {
      // Fallback vers navigation classique si handlers non disponibles
      navigate(`/contrats/${contrat.id}`);
    }
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