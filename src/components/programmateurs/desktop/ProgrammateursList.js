import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OverlayTrigger, Tooltip, Button, Form, InputGroup } from 'react-bootstrap';
import { useProgrammateurSearch, useDeleteProgrammateur } from '@/hooks/programmateurs';
import Spinner from '@/components/common/Spinner';
import styles from './ProgrammateursList.module.css';
import Table from '@/components/ui/Table';
import ProgrammateursListHeader from './sections/ProgrammateursListHeader';
import ProgrammateursStatsCards from './sections/ProgrammateursStatsCards';
import ProgrammateursListSearchFilter from './sections/ProgrammateursListSearchFilter';
import ProgrammateursListEmptyState from './sections/ProgrammateursListEmptyState';
import { collection, getDocs } from '@/firebaseInit';

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
  } = useProgrammateurSearch();
  
  const { 
    handleDelete: handleDeleteProgrammateur,
    isDeleting
  } = useDeleteProgrammateur(() => {
    resetSearch();
  });
  
  const searchInputRef = React.useRef(null);

  // Chargement de toutes les structures pour le filtre
  const [structures, setStructures] = useState([]);
  useEffect(() => {
    const fetchStructures = async () => {
      try {
        const snapshot = await getDocs(collection('structures'));
        setStructures(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        setStructures([]);
      }
    };
    fetchStructures();
  }, []);

  // Filtres avancés
  const [filterStructure, setFilterStructure] = useState('');
  const [sortOption, setSortOption] = useState('nom-asc');

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

  // Définition des colonnes pour le composant Table commun
  const columns = [
    {
      label: 'Nom',
      key: 'nom',
      sortable: true,
      render: (row) => (
        <>
          <Link to={`/programmateurs/${row.id}`} className={styles.programmateurLink} onClick={e => e.stopPropagation()}>
            {row.nom}{row.prenom && ` ${row.prenom}`}
          </Link>
          {row.fonction && <div className={styles.fonction}>{row.fonction}</div>}
        </>
      )
    },
    {
      label: 'Structure',
      key: 'structure',
      sortable: true,
      render: (row) => row.structure?.nom || <span className="text-muted">Non spécifiée</span>
    },
    {
      label: 'Email',
      key: 'email',
      sortable: true,
      render: (row) => row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : <span className="text-muted">Non spécifié</span>
    },
    {
      label: 'Téléphone',
      key: 'telephone',
      sortable: true,
      render: (row) => row.telephone ? <a href={`tel:${row.telephone}`}>{row.telephone}</a> : <span className="text-muted">Non spécifié</span>
    }
  ];

  // Actions par ligne
  const renderActions = (row) => (
    <div className={styles.actionButtons} onClick={e => e.stopPropagation()}>
      <OverlayTrigger placement="top" overlay={<Tooltip>Voir les détails</Tooltip>}>
        <button className={`${styles.actionButton} ${styles.viewButton}`} onClick={() => onNavigateToDetails(row.id)}>
          <i className="bi bi-eye"></i>
        </button>
      </OverlayTrigger>
      <OverlayTrigger placement="top" overlay={<Tooltip>Modifier</Tooltip>}>
        <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => navigate(`/programmateurs/${row.id}/edit`)}>
          <i className="bi bi-pencil"></i>
        </button>
      </OverlayTrigger>
      <OverlayTrigger placement="top" overlay={<Tooltip>Supprimer</Tooltip>}>
        <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteProgrammateur(row.id)} disabled={isDeleting}>
          <i className="bi bi-trash"></i>
        </button>
      </OverlayTrigger>
    </div>
  );

  // Stats réelles
  const stats = {
    total: programmateurs.length,
    actifs: programmateurs.filter(p => p.actif !== false).length,
    inactifs: programmateurs.filter(p => p.actif === false).length,
  };

  // Filtrage et tri harmonisés
  const filteredProgrammateurs = programmateurs
    .filter(p =>
      (!searchTerm || (p.nom + ' ' + (p.prenom || '')).toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filterStructure || (p.structure && String(p.structure.id) === String(filterStructure)))
    )
    .sort((a, b) => {
      if (sortOption === 'nom-asc') return a.nom.localeCompare(b.nom);
      if (sortOption === 'nom-desc') return b.nom.localeCompare(a.nom);
      return 0;
    });

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
    <div className={styles.programmateursListContainer}>
      {/* Title and Add button */}
      <ProgrammateursListHeader />

      {/* Stats cards (placeholder) */}
      {stats && <ProgrammateursStatsCards stats={stats} />}

      {/* Search and filter controls */}
      <ProgrammateursListSearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredCount={filteredProgrammateurs.length}
        totalCount={programmateurs.length}
        filterStructure={filterStructure}
        setFilterStructure={setFilterStructure}
        sortOption={sortOption}
        setSortOption={setSortOption}
        structures={structures}
      />

      {/* Table or empty state */}
      {filteredProgrammateurs.length > 0 ? (
        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            data={filteredProgrammateurs}
            renderActions={renderActions}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSortClick}
            onRowClick={onNavigateToDetails}
          />
        </div>
      ) : (
        <ProgrammateursListEmptyState 
          hasSearchQuery={searchTerm && typeof searchTerm === 'string' ? searchTerm.trim().length > 0 : false}
        />
      )}
    </div>
  );
};

export default ProgrammateursList;
