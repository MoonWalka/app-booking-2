import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  orderBy, 
  startAfter, 
  limit, 
  getDocs,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { Modal, Button as BootstrapButton, Form, InputGroup } from 'react-bootstrap';
import Button from '@ui/Button';
import styles from './StructuresList.module.css';

const StructuresList = () => {
  const navigate = useNavigate();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [sortBy, setSortBy] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fonction pour charger les structures
  const fetchStructures = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let q = query(collection(db, 'structures'), orderBy('nom'), limit(20));

      if (lastVisible) {
        q = query(
          collection(db, 'structures'),
          orderBy('nom'),
          startAfter(lastVisible),
          limit(20)
        );
      }

      const structuresSnapshot = await getDocs(q);

      if (structuresSnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const structuresData = structuresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStructures(prev => [...prev, ...structuresData]);

      const lastDoc = structuresSnapshot.docs[structuresSnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(structuresSnapshot.docs.length === 20);
    } catch (error) {
      console.error('Erreur lors du chargement des structures:', error);
      setError('Une erreur est survenue lors du chargement des structures.');
    } finally {
      setLoading(false);
    }
  }, [lastVisible]);

  // Chargement initial
  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  // Fonction pour filtrer les structures - NOUVEAU: Finalisation intelligente avec filtrage temps réel
  const filterStructures = () => {
    let result = [...structures];

    // Filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(structure => 
        structure.nom?.toLowerCase().includes(term) ||
        structure.raisonSociale?.toLowerCase().includes(term) ||
        structure.ville?.toLowerCase().includes(term) ||
        structure.siret?.includes(term)
      );
    }

    // Filtre par type
    if (typeFilter) {
      result = result.filter(structure => structure.type === typeFilter);
    }

    return result;
  };

  // NOUVEAU: Fonction pour trier et filtrer les structures
  const getSortedAndFilteredStructures = () => {
    const filtered = filterStructures();
    
    // Application du tri
    return [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'nom':
          aValue = (a.nom || a.raisonSociale || '').toLowerCase();
          bValue = (b.nom || b.raisonSociale || '').toLowerCase();
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        case 'updatedAt':
          aValue = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
          bValue = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
          break;
        default:
          aValue = '';
          bValue = '';
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Fonction pour charger plus de structures
  const loadMoreStructures = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      fetchStructures();
    }
  };

  // Fonction pour gérer la suppression d'une structure
  const handleDeleteClick = (structure) => {
    setShowDeleteModal(true);
    setStructureToDelete(structure);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setShowDeleteModal(false);

    try {
      await deleteDoc(doc(db, 'structures', structureToDelete.id));
      setStructures(structures.filter(structure => structure.id !== structureToDelete.id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la structure:', error);
      alert('Une erreur est survenue lors de la suppression de la structure');
    } finally {
      setDeleting(false);
    }
  };

  // Fonction pour trier les données
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Rendu des flèches de tri
  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>;
  };

  return (
    <div className={styles.listContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Structures</h2>
        <Link to="/structures/new" className={styles.addButton}>
          <i className="bi bi-plus-circle"></i>
          Ajouter une structure
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.searchBar}>
          <InputGroup className={styles.searchInput}>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Rechercher une structure..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <BootstrapButton 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-x"></i>
              </BootstrapButton>
            )}
          </InputGroup>

          <Form.Select 
            className={styles.typeFilter}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="association">Association</option>
            <option value="entreprise">Entreprise</option>
            <option value="administration">Administration</option>
            <option value="collectivite">Collectivité</option>
            <option value="autre">Autre</option>
          </Form.Select>
        </div>

        <div className={styles.resultsCount}>
          {/* NOUVEAU: Affichage du nombre filtré vs total */}
          {getSortedAndFilteredStructures().length} structure(s) trouvée(s)
          {(searchTerm || typeFilter) && getSortedAndFilteredStructures().length !== structures.length && (
            <span className={styles.filteredCount}>
              {' '}sur {structures.length} au total
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center p-5">
            <div className={styles.spinner} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        ) : getSortedAndFilteredStructures().length === 0 ? (
          <div className={styles.emptyState}>
            <i className={`bi bi-building ${styles.emptyStateIcon}`}></i>
            <p className={styles.emptyStateText}>
              {searchTerm || typeFilter 
                ? "Aucune structure ne correspond à votre recherche"
                : "Aucune structure n'a été créée pour le moment"}
            </p>
            {searchTerm || typeFilter ? (
              <Button variant="outline-secondary" onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
              }}>
                Réinitialiser les filtres
              </Button>
            ) : (
              <Button as={Link} to="/structures/new" variant="primary">
                <i className="bi bi-plus-circle me-2"></i>
                Créer ma première structure
              </Button>
            )}
          </div>
        ) : (
          <>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th className={styles.sortable} onClick={() => handleSort('nom')}>
                    Nom
                    {renderSortIcon('nom')}
                  </th>
                  <th className={styles.sortable} onClick={() => handleSort('type')}>
                    Type
                    {renderSortIcon('type')}
                  </th>
                  <th>Ville</th>
                  <th>Contact</th>
                  <th className={styles.sortable} onClick={() => handleSort('updatedAt')}>
                    Dernière modification
                    {renderSortIcon('updatedAt')}
                  </th>
                  <th className={styles.actionsColumn}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* NOUVEAU: Utilisation des structures filtrées et triées */}
                {getSortedAndFilteredStructures().map((structure) => (
                  <tr 
                    key={structure.id} 
                    className={styles.tableRow}
                    onClick={() => navigate(`/structures/${structure.id}`)}
                  >
                    <td>
                      <div className={styles.iconText}>
                        <i className={`bi bi-building ${styles.rowIcon}`}></i>
                        <span>{structure.nom || structure.raisonSociale || <span className={styles.muted}>Sans nom</span>}</span>
                      </div>
                    </td>
                    <td>
                      {structure.type ? (
                        <span className={`${styles.badge} ${getBadgeClass(structure.type)}`}>
                          {getTypeLabel(structure.type)}
                        </span>
                      ) : (
                        <span className={styles.muted}>Non spécifié</span>
                      )}
                    </td>
                    <td>
                      {structure.ville ? (
                        <div className={styles.iconText}>
                          <i className={`bi bi-geo-alt ${styles.rowIcon}`}></i>
                          <span>{structure.ville}</span>
                        </div>
                      ) : (
                        <span className={styles.muted}>Non spécifié</span>
                      )}
                    </td>
                    <td>
                      {structure.contact?.nom ? (
                        <div className={styles.iconText}>
                          <i className={`bi bi-person ${styles.rowIcon}`}></i>
                          <span>{structure.contact.nom}</span>
                        </div>
                      ) : (
                        <span className={styles.muted}>Aucun contact</span>
                      )}
                    </td>
                    <td>
                      {structure.updatedAt ? (
                        formatDate(structure.updatedAt.toDate())
                      ) : (
                        <span className={styles.muted}>Inconnue</span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className={styles.actionButtons}>
                        <button 
                          className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/structures/${structure.id}/edit`);
                          }}
                          title="Modifier"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(structure);
                          }}
                          title="Supprimer"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasMore && (
              <div className="text-center mt-4">
                <button 
                  className={styles.loadMoreButton}
                  onClick={loadMoreStructures}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <span className={styles.spinner} role="status" aria-hidden="true"></span>
                      Chargement...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-down-circle"></i>
                      Charger plus
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Êtes-vous sûr de vouloir supprimer cette structure ?</p>
          {structureToDelete?.programmateursAssocies?.length > 0 && (
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Cette structure est associée à {structureToDelete.programmateursAssocies.length} programmateur(s).
              La suppression retirera ces associations.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <BootstrapButton variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </BootstrapButton>
          <BootstrapButton 
            variant="danger" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Suppression...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Supprimer
              </>
            )}
          </BootstrapButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Fonction pour obtenir la classe du badge selon le type de structure
const getBadgeClass = (type) => {
  switch (type) {
    case 'association':
      return styles.badgeSuccess;
    case 'entreprise':
      return styles.badgePrimary;
    case 'administration':
      return styles.badgeInfo;
    case 'collectivite':
      return styles.badgeWarning;
    default:
      return styles.badgeSecondary;
  }
};

// Fonction pour obtenir le libellé correspondant au type de structure
const getTypeLabel = (type) => {
  switch (type) {
    case 'association':
      return 'Association';
    case 'entreprise':
      return 'Entreprise';
    case 'administration':
      return 'Administration';
    case 'collectivite':
      return 'Collectivité';
    default:
      return 'Autre';
  }
};

// Fonction pour formater les dates
const formatDate = (date) => {
  if (!date) return '';
  
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
};

export default StructuresList;