import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import Spinner from '@/components/common/Spinner';
// Migration vers les hooks optimisés maintenant disponibles
import { useLieuxQuery, useLieuxFilters, useLieuDeleteOptimized } from '@/hooks/lieux';
import styles from './LieuxList.module.css';

// Import section components
import LieuxListHeader from './sections/LieuxListHeader';
import LieuxStatsCards from './sections/LieuxStatsCards';
import LieuxListSearchFilter from './sections/LieuxListSearchFilter';
import LieuxResultsTable from './sections/LieuxResultsTable';
import LieuxListEmptyState from './sections/LieuxListEmptyState';

/**
 * LieuxList Component - Desktop version
 * Displays a filterable list of venues with stats
 */
const LieuxList = () => {
  // Use custom hooks to manage data and state
  const { lieux, loading, error, stats, setLieux } = useLieuxQuery();
  const{ 
    searchTerm, 
    setSearchTerm, 
    filterType, 
    setFilterType, 
    sortOption, 
    setSortOption, 
    filteredLieux 
  } = useLieuxFilters(lieux);

  // Handle deletion of lieux
  const { handleDeleteLieu } = useLieuDeleteOptimized((deletedId) => {
    // Remove the deleted lieu from the local state
    setLieux(lieux.filter(lieu => lieu.id !== deletedId));
  });

  // Focus search input with Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) searchInput.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show loading state
  if (loading) {
    return <Spinner message="Chargement des lieux..." contentOnly={true} />;
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="danger" className={styles.modernAlert}>
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </Alert>
    );
  }

  return (
    <div className={styles.lieuxContainer}>
      {/* Title and Add button */}
      <LieuxListHeader />

      {/* Stats cards */}
      {stats && <LieuxStatsCards stats={stats} />}

      {/* Search and filter controls */}
      <LieuxListSearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        sortOption={sortOption}
        setSortOption={setSortOption}
        filteredCount={filteredLieux.length}
        totalCount={lieux.length}
      />

      {/* Table or empty state */}
      {filteredLieux.length > 0 ? (
        <LieuxResultsTable 
          lieux={filteredLieux} 
          onDeleteLieu={handleDeleteLieu} 
        />
      ) : (
        <LieuxListEmptyState 
          hasSearchQuery={searchTerm && typeof searchTerm === 'string' ? searchTerm.trim().length > 0 : false}
          hasFilters={filterType !== 'tous'}
        />
      )}
    </div>
  );
};

export default LieuxList;