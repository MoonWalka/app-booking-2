import React from 'react';
import { Alert } from 'react-bootstrap';
import Spinner from '@/components/common/Spinner';

// Import custom hooks
import { 
  useConcertListData,
  useConcertFilters,
  useConcertStatus,
  useConcertActions 
} from '@/hooks/concerts';

// Import section components
import ConcertsListHeader from '@/components/concerts/sections/ConcertsListHeader';
import ConcertSearchBar from '@/components/concerts/sections/ConcertSearchBar';
import ConcertsTable from '@/components/concerts/sections/ConcertsTable';
import ConcertsLoadMore from '@/components/concerts/sections/ConcertsLoadMore';
import ConcertsEmptyState from '@/components/concerts/sections/ConcertsEmptyState';
import ConcertsStatsCards from '@/components/concerts/sections/ConcertsStatsCards';

// Import styles
import styles from './ConcertsList.module.css';

/**
 * ConcertsList component displays a filterable, searchable list of concerts
 * with pagination support
 */
const ConcertsList = () => {
  // Hooks avec support de pagination
  const { 
    concerts, 
    loading, 
    loadingMore,
    error, 
    hasMore,
    loadMore,
    hasForm, 
    hasUnvalidatedForm, 
    hasContract,
    getContractStatus,
    concertsWithContracts
  } = useConcertListData();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredConcerts,
    isDatePassed
  } = useConcertFilters(concerts);

  const {
    statusDetailsMap,
    getStatusDetails,
    getContractButtonVariant,
    getContractTooltip
  } = useConcertStatus();

  const {
    handleViewConcert,
    handleSendForm,
    handleViewForm,
    handleGenerateContract,
    handleViewContract
  } = useConcertActions();
  // Loading state
  if (loading) {
    return <Spinner message="Chargement des concerts..." contentOnly={true} />;
  }

  // Error state
  if (error) {
    return (
      <div className={styles.concertsContainer}>
        <Alert variant="danger" className="modern-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <Spinner message="Chargement des concerts..." contentOnly={true} />;
  }

  // Error state
  if (error) {
    return (
      <div className={styles.concertsContainer}>
        <Alert variant="danger" className="modern-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      </div>
    );
  }


  return (
    <div className={styles.tableContainer}>
      {/* Section d'en-tête avec titre et bouton d'ajout */}
      <ConcertsListHeader />
      <ConcertsStatsCards stats={{ total: concerts.length, aVenir: concerts.filter(c => !isDatePassed(c.date)).length, passes: concerts.filter(c => isDatePassed(c.date)).length }} />
      
      {/* Barre de recherche et filtres (statuts inclus dans le menu du bouton Filtrer) */}
      <ConcertSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusDetailsMap={statusDetailsMap}
        filteredCount={filteredConcerts.length}
        totalCount={concerts.length}
      />

      {/* Tableau des concerts */}
      {filteredConcerts.length > 0 ? (
        <div className={styles.modernTableContainer}>
          <ConcertsTable
            concerts={filteredConcerts}
            getStatusDetails={getStatusDetails}
            hasForm={hasForm}
            hasUnvalidatedForm={hasUnvalidatedForm}
            hasContract={hasContract}
            getContractStatus={getContractStatus}
            concertsWithContracts={concertsWithContracts}
            getContractButtonVariant={getContractButtonVariant}
            getContractTooltip={getContractTooltip}
            isDatePassed={isDatePassed}
            handleViewConcert={handleViewConcert}
            handleSendForm={handleSendForm}
            handleViewForm={handleViewForm}
            handleGenerateContract={handleGenerateContract}
            handleViewContract={handleViewContract}
          />
        </div>
      ) : (
        <ConcertsEmptyState 
          hasSearchQuery={!!searchTerm}
          hasFilters={statusFilter !== 'all'}
        />
      )}
      
      {/* Bouton "Charger plus" seulement si on n'est pas en train de filtrer */}
      {!searchTerm && statusFilter === 'all' && (
        <ConcertsLoadMore 
          loading={loadingMore} 
          hasMore={hasMore} 
          onLoadMore={loadMore} 
        />
      )}
    </div>
  );
};

export default ConcertsList;
