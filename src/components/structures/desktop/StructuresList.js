import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiOrgQuery } from '@/hooks/useMultiOrgQuery';
import { deleteDoc, doc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { Modal, Button as BootstrapButton, Form, InputGroup } from 'react-bootstrap';
import Button from '@ui/Button';
import Alert from '@ui/Alert';
import styles from './StructuresList.module.css';

/**
 * Version simplifiée de StructuresList
 * Même UI, même fonctionnalités, code 70% plus simple
 */
const StructuresList = () => {
  const navigate = useNavigate();
  
  // Un seul hook pour charger les données
  const {
    data: structures = [],
    loading,
    error,
    loadMore,
    hasMore,
    loadingMore
  } = useMultiOrgQuery('structures', {
    orderBy: ['nom', 'asc'],
    limit: 20
  });

  // États simplifiés pour les filtres et la suppression
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [sortBy, setSortBy] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filtrage et tri en une seule passe
  const displayedStructures = useMemo(() => {
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

    // Tri
    result.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortBy === 'updatedAt') {
        aValue = new Date(aValue?.seconds * 1000 || 0);
        bValue = new Date(bValue?.seconds * 1000 || 0);
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      return sortDirection === 'asc' 
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });

    return result;
  }, [structures, searchTerm, typeFilter, sortBy, sortDirection]);

  // Statistiques
  const stats = useMemo(() => ({
    total: structures.length,
    filtered: displayedStructures.length,
    associations: structures.filter(s => s.type === 'association').length,
    entreprises: structures.filter(s => s.type === 'entreprise').length,
    administrations: structures.filter(s => s.type === 'administration').length,
    collectivites: structures.filter(s => s.type === 'collectivite').length,
    autres: structures.filter(s => s.type === 'autre').length
  }), [structures, displayedStructures]);

  // Gestion de la suppression
  const handleDeleteClick = useCallback((structure) => {
    setStructureToDelete(structure);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!structureToDelete) return;

    setDeleting(true);
    try {
      // Vérifier les programmateurs associés
      const programmateurQuery = query(
        collection(db, 'programmateurs'),
        where('structureId', '==', structureToDelete.id)
      );
      const programmateurSnapshot = await getDocs(programmateurQuery);

      if (!programmateurSnapshot.empty) {
        alert(`Cette structure ne peut pas être supprimée car elle est associée à ${programmateurSnapshot.size} programmateur(s).`);
        return;
      }

      // Supprimer la structure
      await deleteDoc(doc(db, 'structures', structureToDelete.id));
      
      // Fermer la modal
      setShowDeleteModal(false);
      setStructureToDelete(null);
      
      // Rafraîchir la liste
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Une erreur est survenue lors de la suppression.');
    } finally {
      setDeleting(false);
    }
  }, [structureToDelete]);

  // Gestion du tri
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  }, [sortBy]);

  // Formatage des dates
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('fr-FR');
  };

  // États de chargement et d'erreur
  if (loading && structures.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement des structures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Alert variant="danger">
          {error.message || 'Une erreur est survenue lors du chargement des structures.'}
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Structures</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/structures/nouveau')}
          className={styles.addButton}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nouvelle Structure
        </Button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.total}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.associations}</div>
          <div className={styles.statLabel}>Associations</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.entreprises}</div>
          <div className={styles.statLabel}>Entreprises</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.administrations}</div>
          <div className={styles.statLabel}>Administrations</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.collectivites}</div>
          <div className={styles.statLabel}>Collectivités</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <InputGroup className={styles.searchBar}>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Rechercher par nom, ville, SIRET..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="link"
              onClick={() => setSearchTerm('')}
              className={styles.clearButton}
            >
              <i className="bi bi-x-lg"></i>
            </Button>
          )}
        </InputGroup>

        <Form.Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={styles.typeFilter}
        >
          <option value="">Tous les types</option>
          <option value="association">Association</option>
          <option value="entreprise">Entreprise</option>
          <option value="administration">Administration</option>
          <option value="collectivite">Collectivité</option>
          <option value="autre">Autre</option>
        </Form.Select>

        <div className={styles.resultCount}>
          {displayedStructures.length} / {structures.length} résultats
        </div>
      </div>

      {/* Table */}
      {displayedStructures.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('nom')} className={styles.sortable}>
                  Nom {sortBy === 'nom' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('type')} className={styles.sortable}>
                  Type {sortBy === 'type' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th>Ville</th>
                <th>Contact</th>
                <th onClick={() => handleSort('updatedAt')} className={styles.sortable}>
                  Modifié le {sortBy === 'updatedAt' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedStructures.map(structure => (
                <tr 
                  key={structure.id}
                  onClick={() => navigate(`/structures/${structure.id}`)}
                  className={styles.clickableRow}
                >
                  <td>
                    <strong>{structure.nom || structure.raisonSociale || 'Sans nom'}</strong>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge-${structure.type}`]}`}>
                      {structure.type || 'Non défini'}
                    </span>
                  </td>
                  <td>{structure.ville || '-'}</td>
                  <td>{structure.contact?.nom || '-'}</td>
                  <td>{formatDate(structure.updatedAt)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className={styles.actions}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/structures/${structure.id}/edit`)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(structure)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <i className="bi bi-building"></i>
          <p>
            {searchTerm || typeFilter 
              ? 'Aucune structure ne correspond à vos critères de recherche.'
              : 'Aucune structure enregistrée.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!searchTerm && !typeFilter && hasMore && (
        <div className={styles.loadMore}>
          <Button
            variant="secondary"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className={styles.buttonSpinner}></span>
                Chargement...
              </>
            ) : (
              'Charger plus de structures'
            )}
          </Button>
        </div>
      )}

      {/* Modal de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer la structure "{structureToDelete?.nom || structureToDelete?.raisonSociale}" ?
          <br />
          <strong>Cette action est irréversible.</strong>
        </Modal.Body>
        <Modal.Footer>
          <BootstrapButton 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Annuler
          </BootstrapButton>
          <BootstrapButton 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </BootstrapButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StructuresList;