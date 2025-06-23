import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';
import Table from '@/components/ui/Table';
import AddButton from '@/components/ui/AddButton';
// import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { getPreContratsByConcert } from '@/services/preContratService';
import styles from './TableauDeBordPage.module.css';

/**
 * Page Tableau de bord - Vue d'ensemble des activités
 */
const TableauDeBordPage = () => {
  const navigate = useNavigate();
  const { openPreContratTab, openContratTab, openTab } = useTabs();
  // const { } = useAuth();
  const { currentOrg } = useOrganization();
  
  // Fonction pour ouvrir la page de confirmation
  const openConfirmationPage = (item) => {
    openTab({
      id: `confirmation-${item.id}`,
      title: `Confirmation - ${item.artisteNom || item.titre || 'Concert'}`,
      path: `/confirmation?concertId=${item.id}`,
      component: 'ConfirmationPage',
      params: { concertId: item.id },
      icon: 'bi-check-circle'
    });
  };
  
  // État pour les données
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Charger les données du tableau de bord
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentOrg?.id) return;
      
      try {
        setLoading(true);
        
        // Charger les concerts récents avec leurs informations
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('organizationId', '==', currentOrg.id),
          orderBy('date', 'desc')
        );
        
        const concertsSnapshot = await getDocs(concertsQuery);
        const concertsData = await Promise.all(
          concertsSnapshot.docs.map(async (doc) => {
            const concertData = {
              id: doc.id,
              ...doc.data(),
              type: 'concert'
            };
            
            // Charger les données du pré-contrat pour ce concert
            try {
              const preContrats = await getPreContratsByConcert(doc.id);
              if (preContrats && preContrats.length > 0) {
                // Prendre le plus récent
                const latestPreContrat = preContrats.sort((a, b) => {
                  const dateA = a.createdAt?.toDate() || new Date(0);
                  const dateB = b.createdAt?.toDate() || new Date(0);
                  return dateB - dateA;
                })[0];
                
                // Ajouter les infos de pré-contrat au concert
                concertData.preContratId = latestPreContrat.id;
                concertData.publicFormData = latestPreContrat.publicFormData;
                concertData.publicFormCompleted = latestPreContrat.publicFormCompleted;
                concertData.confirmationValidee = latestPreContrat.confirmationValidee;
              }
            } catch (error) {
              console.error('Erreur chargement pré-contrat pour concert', doc.id, error);
            }
            
            return concertData;
          })
        );

        setData(concertsData);
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentOrg?.id]);

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
          {item.formule || item.projet || '—'}
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
            {item.lieuNom || item.lieu?.nom || 'Non spécifié'}
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
      label: 'Prise d\'option',
      key: 'priseOption',
      sortable: true,
      render: (item) => {
        if (!item.priseOption && !item.datePriseOption) return '—';
        
        const datePriseOption = item.datePriseOption || item.priseOption;
        if (!datePriseOption) return '—';
        
        const date = datePriseOption.toDate ? datePriseOption.toDate() : new Date(datePriseOption);
        return (
          <span className={styles.priseOptionCell}>
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
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
      render: (item) => (
        <div className={styles.montantCell}>
          {item.montant ? (
            <span className={styles.montant}>
              {item.montant.toLocaleString('fr-FR')} €
            </span>
          ) : (
            <span className={styles.noMontant}>—</span>
          )}
        </div>
      )
    },
    {
      label: 'Nb. de dates',
      key: 'nbDates',
      sortable: true,
      render: (item) => (
        <span className={styles.nbDatesCell}>
          {item.nbDates || '1'}
        </span>
      )
    },
    {
      label: 'Devis',
      key: 'devis',
      sortable: false,
      render: (item) => (
        <div className={styles.devisCell}>
          {item.devisId ? (
            <i 
              className="bi bi-file-earmark-check-fill text-success" 
              title="Voir le devis"
              style={{ cursor: 'pointer' }}
              onClick={() => openTab({
                id: `devis-${item.devisId}`,
                title: `Devis - ${item.artisteNom || item.titre || 'Concert'}`,
                path: `/devis/${item.devisId}`,
                component: 'DevisPage',
                params: { devisId: item.devisId },
                icon: 'bi-file-earmark-check'
              })}
            ></i>
          ) : (
            <i 
              className="bi bi-file-earmark text-muted" 
              title="Créer un devis"
              style={{ cursor: 'pointer' }}
              onClick={() => openTab({
                id: `devis-nouveau-${item.id}`,
                title: `Nouveau devis - ${item.artisteNom || item.titre || 'Concert'}`,
                path: `/devis/nouveau?concertId=${item.id}&structureId=${item.structureId}`,
                component: 'DevisPage',
                params: { concertId: item.id, structureId: item.structureId },
                icon: 'bi-file-earmark-plus'
              })}
            ></i>
          )}
        </div>
      )
    },
    {
      label: 'Pré contrat',
      key: 'preContrat',
      sortable: false,
      render: (item) => (
        <div className={styles.preContratCell}>
          {item.preContratId ? (
            <i 
              className="bi bi-file-earmark-text-fill text-warning" 
              title="Pré-contrat existant"
              style={{ cursor: 'pointer' }}
              onClick={() => openPreContratTab(item.id, item.artiste?.nom || item.artisteNom || 'Concert')}
            ></i>
          ) : (
            <i 
              className="bi bi-file-earmark-text text-muted" 
              title="Créer un pré-contrat"
              style={{ cursor: 'pointer' }}
              onClick={() => openPreContratTab(item.id, item.artiste?.nom || item.artisteNom || 'Concert')}
            ></i>
          )}
        </div>
      )
    },
    {
      label: 'Confirmation',
      key: 'confirmation',
      sortable: false,
      render: (item) => {
        // Déterminer l'état de confirmation
        const hasPublicFormData = item.publicFormData || item.publicFormCompleted;
        const isConfirmed = item.confirmationValidee || item.confirmation || item.statut === 'confirme';
        
        let iconClass, colorClass, title, isClickable;
        
        if (isConfirmed) {
          // État 3: Validé (vert)
          iconClass = 'bi-check-circle-fill';
          colorClass = 'text-success';
          title = 'Confirmation validée';
          isClickable = false;
        } else if (hasPublicFormData) {
          // État 2: Complété (orange) - cliquable
          iconClass = 'bi-exclamation-circle-fill';
          colorClass = 'text-warning';
          title = 'Cliquer pour valider la confirmation';
          isClickable = true;
        } else {
          // État 1: À compléter (gris) - non cliquable
          iconClass = 'bi-circle';
          colorClass = 'text-muted';
          title = 'En attente du formulaire public';
          isClickable = false;
        }
        
        return (
          <div 
            className={`${styles.confirmationCell} ${isClickable ? styles.clickable : ''}`}
            onClick={isClickable ? () => openConfirmationPage(item) : undefined}
            title={title}
            style={!isClickable ? { cursor: 'default' } : {}}
          >
            <i className={`bi ${iconClass} ${colorClass}`}></i>
          </div>
        );
      }
    },
    {
      label: 'Contrat',
      key: 'contratFinal',
      sortable: false,
      render: (item) => {
        // Vérifier si le pré-contrat est validé
        const isPreContratValide = item.confirmationValidee || item.confirmation || item.statut === 'confirme';
        const contratStatut = item.contratStatut;
        const hasContrat = item.contratId || contratStatut;
        
        let iconClass, title, action, isClickable;
        
        if (!isPreContratValide) {
          // Pré-contrat non validé - icône grise non cliquable
          iconClass = "bi bi-file-earmark text-muted";
          title = "Valider le pré-contrat avant de créer le contrat";
          isClickable = false;
          action = null;
        } else if (contratStatut === 'redige') {
          // Contrat rédigé et terminé - icône verte
          iconClass = "bi bi-file-earmark-check-fill text-success";
          title = "Contrat rédigé - Voir";
          isClickable = true;
          action = () => openContratTab(item.id, item.artisteNom || item.titre || 'Concert');
        } else if (hasContrat) {
          // Contrat en cours de rédaction - icône orange
          iconClass = "bi bi-file-earmark-text-fill text-warning";
          title = "Contrat en cours - Continuer la rédaction";
          isClickable = true;
          action = () => openContratTab(item.id, item.artisteNom || item.titre || 'Concert');
        } else {
          // Aucun contrat mais pré-contrat validé - icône grise cliquable
          iconClass = "bi bi-file-earmark text-muted";
          title = "Créer un contrat";
          isClickable = true;
          action = () => openContratTab(item.id, item.artisteNom || item.titre || 'Concert');
        }
        
        return (
          <div className={styles.contratFinalCell}>
            <i 
              className={iconClass}
              title={title}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
              onClick={isClickable ? action : undefined}
            ></i>
          </div>
        );
      }
    },
    {
      label: 'Facture',
      key: 'facture',
      sortable: false,
      render: (item) => {
        // Vérifier si le contrat est rédigé
        const isContratRedige = item.contratStatut === 'redige';
        const hasFacture = item.factureId || item.factureStatut;
        
        let iconClass, title, isClickable;
        
        if (!isContratRedige) {
          // Contrat non rédigé - icône grise non cliquable
          iconClass = "bi bi-receipt text-muted";
          title = "Finaliser le contrat avant de créer la facture";
          isClickable = false;
        } else if (item.factureStatut === 'emise' || item.factureStatut === 'payee') {
          // Facture émise ou payée - icône verte
          iconClass = "bi bi-receipt-cutoff text-success";
          title = item.factureStatut === 'payee' ? "Facture payée" : "Facture émise";
          isClickable = true;
        } else if (hasFacture) {
          // Facture en cours - icône orange
          iconClass = "bi bi-receipt text-warning";
          title = "Facture en cours";
          isClickable = true;
        } else {
          // Aucune facture mais contrat rédigé - icône grise cliquable
          iconClass = "bi bi-receipt text-muted";
          title = "Créer une facture";
          isClickable = true;
        }
        
        return (
          <div className={styles.factureCell}>
            <i 
              className={iconClass}
              title={title}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
              onClick={isClickable ? () => {
                // TODO: Ouvrir l'onglet facture
                console.log('Ouvrir facture pour concert', item.id);
              } : undefined}
            ></i>
          </div>
        );
      }
    }
  ];

  // Fonctions utilitaires (pour usage futur)
  // const getTypeIcon = (type) => {
  //   switch (type) {
  //     case 'concert': return 'music-note';
  //     case 'contrat': return 'file-text';
  //     case 'facture': return 'receipt';
  //     case 'projet': return 'folder';
  //     default: return 'circle';
  //   }
  // };

  // const getTypeLabel = (type) => {
  //   switch (type) {
  //     case 'concert': return 'Concert';
  //     case 'contrat': return 'Contrat';
  //     case 'facture': return 'Facture';
  //     case 'projet': return 'Projet';
  //     default: return 'Autre';
  //   }
  // };

  // const getStatusLabel = (statut) => {
  //   switch (statut) {
  //     case 'contact': return 'Contact';
  //     case 'option': return 'Option';
  //     case 'confirme': return 'Confirmé';
  //     case 'annule': return 'Annulé';
  //     case 'reporte': return 'Reporté';
  //     default: return 'Contact';
  //   }
  // };

  // Filtrage et tri des données
  const filteredAndSortedData = React.useMemo(() => {
    let filtered = data;

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.titre?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.artisteNom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.lieuNom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.contactNom?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Tri
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Gestion spéciale pour les dates
        if (sortField === 'date') {
          aValue = aValue?.toDate ? aValue.toDate() : new Date(aValue || 0);
          bValue = bValue?.toDate ? bValue.toDate() : new Date(bValue || 0);
        }

        // Gestion spéciale pour les objets imbriqués
        if (sortField === 'lieu') {
          aValue = a.lieuNom || a.lieu?.nom || '';
          bValue = b.lieuNom || b.lieu?.nom || '';
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

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
  const handleRowClick = (item) => {
    switch (item.type) {
      case 'concert':
        navigate(`/concerts/${item.id}`);
        break;
      case 'contrat':
        navigate(`/contrats/${item.id}`);
        break;
      case 'facture':
        navigate(`/factures/${item.id}`);
        break;
      default:
        console.log('Type non géré:', item.type);
    }
  };

  // Fonction pour supprimer un élément
  const handleDelete = (item) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.titre || item.artisteNom}" ?`)) {
      // TODO: Implémenter la suppression via un service
      console.log('Suppression de l\'élément:', item.id);
      // Ici il faudrait appeler un service de suppression
    }
  };

  // Actions par ligne
  const renderActions = (item) => (
    <div className={styles.actions}>
      <button
        className={`btn btn-sm btn-outline-warning ${styles.actionBtn}`}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/concerts/${item.id}/edit`);
        }}
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
      
      <button
        className={`btn btn-sm btn-outline-danger ${styles.actionBtn}`}
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(item);
        }}
        title="Supprimer"
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  );

  if (loading) {
    return (
      <Container fluid className={styles.container}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className={styles.container}>
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className={styles.container}>
      <Row>
        <Col>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div>
                <h1 className={styles.title}>
                  <i className="bi bi-speedometer2 me-2"></i>
                  Tableau de bord
                </h1>
                <p className={styles.subtitle}>
                  Vue d'ensemble de vos activités • {filteredAndSortedData.length} éléments
                </p>
              </div>
              
              <div className={styles.headerActions}>
                <AddButton
                  onClick={() => navigate('/concerts/nouveau')}
                  label="Nouveau concert"
                />
              </div>
            </div>
          </div>

          <Card className={styles.tableCard}>
            <Card.Header className={styles.cardHeader}>
              <div className={styles.cardHeaderContent}>
                <h5 className={styles.cardTitle}>
                  <i className="bi bi-list-ul me-2"></i>
                  Activités récentes
                </h5>
                
                <div className={styles.searchSection}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher..."
                    className={`form-control ${styles.searchInput}`}
                  />
                </div>
              </div>
            </Card.Header>
            
            <Card.Body className={styles.cardBody}>
              <div className={styles.tableWrapper}>
                <Table
                  columns={columns}
                  data={filteredAndSortedData}
                  renderActions={renderActions}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onRowClick={handleRowClick}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TableauDeBordPage; 