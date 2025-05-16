import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OverlayTrigger, Tooltip, Button, Form, InputGroup } from 'react-bootstrap';
import { useProgrammateurSearchOptimized, useDeleteProgrammateurOptimized } from '@/hooks/programmateurs';
import Spinner from '@/components/common/Spinner';
import styles from './ProgrammateursList.module.css';

const ProgrammateursList = ({ onNavigateToDetails }) => {
  const navigate = useNavigate();
  const {
    programmateurs,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    searchFilters,
    setSearchFilters,
    handleSearch,
    resetSearch,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection
  } = useProgrammateurSearchOptimized();
  
  const { 
    handleDelete: handleDeleteProgrammateur,
    isDeleting
  } = useDeleteProgrammateurOptimized(() => {
    resetSearch();
  });
  
  const searchInputRef = React.useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSortClick = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return <Spinner message="Chargement des programmateurs..." contentOnly={true} />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Erreur: {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  return (
    <div className={styles.programmateursList}>
      <div className={styles.header}>
        <h2>Liste des programmateurs</h2>
        <div className={styles.actions}>
          <InputGroup className={styles.searchBox}>
            <Form.Control
              ref={searchInputRef}
              placeholder="Rechercher un programmateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                <i className="bi bi-x"></i>
              </Button>
            )}
            <Button variant="primary" onClick={handleSearch}>
              <i className="bi bi-search"></i>
            </Button>
          </InputGroup>
          <Button
            variant="primary"
            onClick={() => navigate('/programmateurs/nouveau')}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Nouveau programmateur
          </Button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.programmateurTable}>
          <thead>
            <tr>
              <th className={styles.sortableHeader} onClick={() => handleSortClick('nom')}>
                <div className={styles.headerContent}>
                  Nom
                  {sortField === 'nom' && (
                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </div>
              </th>
              <th className={styles.sortableHeader} onClick={() => handleSortClick('structure.nom')}>
                <div className={styles.headerContent}>
                  Structure
                  {sortField === 'structure.nom' && (
                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </div>
              </th>
              <th className={styles.sortableHeader} onClick={() => handleSortClick('email')}>
                <div className={styles.headerContent}>
                  Email
                  {sortField === 'email' && (
                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </div>
              </th>
              <th className={styles.sortableHeader} onClick={() => handleSortClick('telephone')}>
                <div className={styles.headerContent}>
                  Téléphone
                  {sortField === 'telephone' && (
                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {programmateurs.length > 0 ? (
              programmateurs.map(programmateur => (
                <tr key={programmateur.id} onClick={() => onNavigateToDetails(programmateur.id)} className={styles.clickableRow}>
                  <td>
                    <Link to={`/programmateurs/${programmateur.id}`} className={styles.programmateurLink}>
                      {programmateur.nom}
                      {programmateur.prenom && ` ${programmateur.prenom}`}
                    </Link>
                    {programmateur.fonction && (
                      <div className={styles.fonction}>{programmateur.fonction}</div>
                    )}
                  </td>
                  <td>
                    {programmateur.structure?.nom || (
                      <span className="text-muted">Non spécifiée</span>
                    )}
                  </td>
                  <td>
                    {programmateur.email ? (
                      <a href={`mailto:${programmateur.email}`}>{programmateur.email}</a>
                    ) : (
                      <span className="text-muted">Non spécifié</span>
                    )}
                  </td>
                  <td>
                    {programmateur.telephone ? (
                      <a href={`tel:${programmateur.telephone}`}>{programmateur.telephone}</a>
                    ) : (
                      <span className="text-muted">Non spécifié</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Voir les détails</Tooltip>}
                      >
                        <button
                          className={`${styles.actionButton} ${styles.viewButton}`}
                          onClick={() => onNavigateToDetails(programmateur.id)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </OverlayTrigger>
                      
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Modifier</Tooltip>}
                      >
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={() => navigate(`/programmateurs/${programmateur.id}/edit`)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </OverlayTrigger>
                      
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Supprimer</Tooltip>}
                      >
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDeleteProgrammateur(programmateur.id)}
                          disabled={isDeleting}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <div className="mb-3">
                    <i className="bi bi-search fs-1 text-muted"></i>
                  </div>
                  <p className="mb-1 text-muted">Aucun programmateur trouvé</p>
                  {searchTerm && (
                    <Button 
                      variant="link" 
                      onClick={() => setSearchTerm('')}
                      className="p-0 text-decoration-none"
                    >
                      Effacer la recherche
                    </Button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgrammateursList;
