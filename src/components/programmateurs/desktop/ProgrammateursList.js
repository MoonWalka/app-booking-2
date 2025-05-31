import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgrammateurSearch, useDeleteProgrammateur } from '@/hooks/programmateurs';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/ui/Alert';
import styles from './ProgrammateursList.module.css';
import Table from '@/components/ui/Table';
import ProgrammateursListHeader from './sections/ProgrammateursListHeader';
import ProgrammateursStatsCards from './sections/ProgrammateursStatsCards';
import ProgrammateursListSearchFilter from './sections/ProgrammateursListSearchFilter';
import ProgrammateursListEmptyState from './sections/ProgrammateursListEmptyState';

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
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    setProgrammateurs
  } = useProgrammateurSearch();
  
  const { 
    handleDelete: handleDeleteProgrammateur,
    isDeleting
  } = useDeleteProgrammateur((deletedId) => {
    // Supprimer le programmateur de la liste locale
    setProgrammateurs(prevProgrammateurs => 
      prevProgrammateurs.filter(p => p.id !== deletedId)
    );
  });
  
  const searchInputRef = React.useRef(null);

  // Filtres avancés
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Gestion des filtres avancés avec le hook sophistiqué
  const handleAdvancedFilterChange = (filterType, value) => {
    const newFilters = {
      ...searchFilters,
      [filterType]: value
    };
    setSearchFilters(newFilters);
    handleSearch(searchTerm, newFilters);
  };

  // Reset des filtres avancés
  const handleResetAdvancedFilters = () => {
    setSearchFilters({});
    handleSearch(searchTerm, {});
  };

  // Vérifier si des filtres avancés sont actifs
  const hasActiveAdvancedFilters = () => {
    return Object.keys(searchFilters).some(key => 
      searchFilters[key] && searchFilters[key] !== '' && searchFilters[key] !== 'all'
    );
  };

  // Calculer le nombre de filtres avancés actifs
  const activeFiltersCount = () => {
    return Object.keys(searchFilters).filter(key => searchFilters[key] && searchFilters[key] !== '' && searchFilters[key] !== 'all').length;
  };

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
          <span className={styles.programmateurName}>
            {row.nom}{row.prenom && ` ${row.prenom}`}
          </span>
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
    <div className={styles.actionButtons}>
      <button 
        className={styles.actionButton}
        onClick={(e) => {
          e.stopPropagation();
          onNavigateToDetails(row.id);
        }}
        title="Voir les détails"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/programmateurs/${row.id}/edit`);
        }}
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteProgrammateur(row.id);
        }} 
        disabled={isDeleting}
        title="Supprimer"
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  );

  // Stats réelles
  const stats = {
    total: programmateurs.length,
    actifs: programmateurs.filter(p => p.actif !== false).length,
    inactifs: programmateurs.filter(p => p.actif === false).length,
  };

  // Filtrage et tri harmonisés - CORRIGÉ avec vérifications de sécurité
  const filteredProgrammateurs = programmateurs
    .filter(p => {
      // Vérifier que l'objet programmateur est valide
      if (!p || typeof p !== 'object') return false;
      
      // Filtrage par terme de recherche
      if (!searchTerm) return true;
      
      const searchTermLower = searchTerm.toLowerCase();
      const nomComplet = `${p.nom || ''} ${p.prenom || ''}`.toLowerCase();
      
      return nomComplet.includes(searchTermLower);
    })
    .sort((a, b) => {
      // Vérifications de sécurité pour le tri
      if (!a || !b) return 0;
      
      if (sortField === 'nom') {
        const nomA = a.nom || '';
        const nomB = b.nom || '';
        
        return sortDirection === 'asc' 
          ? nomA.localeCompare(nomB)
          : nomB.localeCompare(nomA);
      }
      
      return 0;
    });

  if (loading) {
    return <Spinner message="Chargement des programmateurs..." contentOnly={true} />;
  }

  if (error) {
    return (
      <Alert variant="danger">
        Erreur: {error instanceof Error ? error.message : String(error)}
      </Alert>
    );
  }

  return (
    <div className={styles.programmateursListContainer}>
      {/* Title and Add button */}
      <ProgrammateursListHeader />

      {/* Stats cards (placeholder) */}
      {stats && <ProgrammateursStatsCards stats={stats} />}

      {/* Search and filter controls avec filtres avancés sophistiqués */}
      <ProgrammateursListSearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredCount={filteredProgrammateurs.length}
        totalCount={programmateurs.length}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        hasActiveAdvancedFilters={hasActiveAdvancedFilters}
        handleResetAdvancedFilters={handleResetAdvancedFilters}
        activeFiltersCount={activeFiltersCount()}
      />
      
      {/* Panel des filtres avancés */}
      {showAdvancedFilters && (
        <div className={styles.advancedFiltersPanel}>
          <div className={styles.filtersGrid}>
            {/* Filtre par statut d'activité */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Statut d'activité</label>
              <select
                className={styles.filterSelect}
                value={searchFilters.actif || 'all'}
                onChange={(e) => handleAdvancedFilterChange('actif', e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="true">Actifs</option>
                <option value="false">Inactifs</option>
              </select>
            </div>
            
            {/* Filtre par présence d'email */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Contact email</label>
              <select
                className={styles.filterSelect}
                value={searchFilters.hasEmail || 'all'}
                onChange={(e) => handleAdvancedFilterChange('hasEmail', e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="true">Avec email</option>
                <option value="false">Sans email</option>
              </select>
            </div>
            
            {/* Filtre par présence de téléphone */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Contact téléphone</label>
              <select
                className={styles.filterSelect}
                value={searchFilters.hasTelephone || 'all'}
                onChange={(e) => handleAdvancedFilterChange('hasTelephone', e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="true">Avec téléphone</option>
                <option value="false">Sans téléphone</option>
              </select>
            </div>
            
            {/* Filtre par fonction */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Fonction</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Ex: Directeur, Manager..."
                value={searchFilters.fonction || ''}
                onChange={(e) => handleAdvancedFilterChange('fonction', e.target.value)}
              />
            </div>
            
            {/* Filtre par ville */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ville</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Ex: Paris, Lyon..."
                value={searchFilters.ville || ''}
                onChange={(e) => handleAdvancedFilterChange('ville', e.target.value)}
              />
            </div>
            
            {/* Filtre par date de création */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Créé après</label>
              <input
                type="date"
                className={styles.filterInput}
                value={searchFilters.dateCreationApres || ''}
                onChange={(e) => handleAdvancedFilterChange('dateCreationApres', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

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
