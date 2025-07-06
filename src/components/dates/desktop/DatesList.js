import React from 'react';
import { Alert } from 'react-bootstrap';
import Spinner from '@/components/common/Spinner';

// Import custom hooks
import { 
  useDateListData,
  // useDateFilters,
  useDateStatus,
  useDateActions 
} from '@/hooks/dates';

// Import section components
import DatesListHeader from '@/components/dates/sections/DatesListHeader';
import DateSearchBar from '@/components/dates/sections/DateSearchBar';
import DatesTable from '@/components/dates/sections/DatesTable';
import DatesLoadMore from '@/components/dates/sections/DatesLoadMore';
import DatesEmptyState from '@/components/dates/sections/DatesEmptyState';
import DatesStatsCards from '@/components/dates/sections/DatesStatsCards';

// Import styles
import styles from './DatesList.module.css';

/**
 * DatesList component displays a filterable, searchable list of dates
 * with pagination support
 */
const DatesList = () => {
  // Hooks avec support de pagination
  const { 
    dates, 
    loading, 
    loadingMore,
    error, 
    hasMore,
    loadMore,
    hasForm, 
    hasUnvalidatedForm, 
    hasContract,
    getContractStatus,
    datesWithContracts
  } = useDateListData();

  // const {
  //   searchTerm,
  //   setSearchTerm,
  //   statusFilter,
  //   setStatusFilter,
  //   filteredDates,
  //   isDatePassed
  // } = useDateFilters(dates);

  // Placeholders pour compilation sans hook
  const searchTerm = '';
  const setSearchTerm = () => {};
  const statusFilter = '';
  const setStatusFilter = () => {};
  const filteredDates = dates || [];
  const isDatePassed = () => false;

  const {
    statusDetailsMap,
    getStatusDetails,
    getContractButtonVariant,
    getContractTooltip
  } = useDateStatus();

  const {
    handleViewDate,
    handleSendForm,
    handleViewForm,
    handleGenerateContract,
    handleViewContract
  } = useDateActions();
  // Loading state
  if (loading) {
    return <Spinner message="Chargement des dates..." contentOnly={true} />;
  }

  // Error state
  if (error) {
    return (
      <div className={styles.datesContainer}>
        <Alert variant="danger" className="modern-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <Spinner message="Chargement des dates..." contentOnly={true} />;
  }

  // Error state
  if (error) {
    return (
      <div className={styles.datesContainer}>
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
      <DatesListHeader />
      <DatesStatsCards stats={{ total: dates.length, aVenir: dates.filter(c => !isDatePassed(c.date)).length, passes: dates.filter(c => isDatePassed(c.date)).length }} />
      
      {/* Barre de recherche et filtres (statuts inclus dans le menu du bouton Filtrer) */}
      <DateSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusDetailsMap={statusDetailsMap}
        filteredCount={filteredDates.length}
        totalCount={dates.length}
      />

      {/* Tableau des dates */}
      {filteredDates.length > 0 ? (
        <div className={styles.modernTableContainer}>
          <DatesTable
            dates={filteredDates}
            getStatusDetails={getStatusDetails}
            hasForm={hasForm}
            hasUnvalidatedForm={hasUnvalidatedForm}
            hasContract={hasContract}
            getContractStatus={getContractStatus}
            datesWithContracts={datesWithContracts}
            getContractButtonVariant={getContractButtonVariant}
            getContractTooltip={getContractTooltip}
            isDatePassed={isDatePassed}
            handleViewDate={handleViewDate}
            handleSendForm={handleSendForm}
            handleViewForm={handleViewForm}
            handleGenerateContract={handleGenerateContract}
            handleViewContract={handleViewContract}
          />
        </div>
      ) : (
        <DatesEmptyState 
          hasSearchQuery={!!searchTerm}
          hasFilters={statusFilter !== 'all'}
        />
      )}
      
      {/* Bouton "Charger plus" seulement si on n'est pas en train de filtrer */}
      {!searchTerm && statusFilter === 'all' && (
        <DatesLoadMore 
          loading={loadingMore} 
          hasMore={hasMore} 
          onLoadMore={loadMore} 
        />
      )}
    </div>
  );
};

export default DatesList;
