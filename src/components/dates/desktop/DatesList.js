import React, { useState, useMemo } from 'react';
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
import DatesTableControls from '@/components/dates/DatesTableControls';
import DatesTableTotals from '@/components/dates/DatesTableTotals';

// Import styles
import styles from './DatesList.module.css';

/**
 * DatesList component displays a filterable, searchable list of dates
 * with pagination support
 */
const DatesList = () => {
  // États pour la sélection et la pagination
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [dateFilter, setDateFilter] = useState('');
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

  // Filtrage et pagination
  const processedDates = useMemo(() => {
    let filtered = [...filteredDates];
    
    // Filtre par date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(date => {
        const dateValue = date.date?.toDate ? date.date.toDate() : date.date ? new Date(date.date) : null;
        return dateValue && dateValue >= filterDate;
      });
    }
    
    return filtered;
  }, [filteredDates, dateFilter]);

  // Pagination
  const paginatedDates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedDates.slice(startIndex, endIndex);
  }, [processedDates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedDates.length / itemsPerPage);

  // Dates sélectionnées pour le calcul des totaux
  const selectedDates = useMemo(() => {
    return filteredDates.filter(date => selectedIds.has(date.id));
  }, [filteredDates, selectedIds]);

  // Handlers
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCalculate = () => {
    console.log('Calcul des montants sélectionnés...');
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleFilter = () => {
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleAdd = () => {
    // Logique d'ajout existante
  };

  const handleExportExcel = () => {
    console.log('Export Excel...');
  };

  const handleChangeView = () => {
    console.log('Changement de vue...');
  };

  const handleShowMap = () => {
    console.log('Affichage carte...');
  };

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
    <>
      <div className={styles.tableContainer}>
        {/* Section d'en-tête avec titre et bouton d'ajout */}
        <DatesListHeader />
        <DatesStatsCards stats={{ total: dates.length, aVenir: dates.filter(c => !isDatePassed(c.date)).length, passes: dates.filter(c => isDatePassed(c.date)).length }} />
        
        {/* Bandeau de contrôle unifié */}
        <DatesTableControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onRefresh={handleRefresh}
          onCalculate={handleCalculate}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          onFilter={handleFilter}
          onClearFilters={handleClearFilters}
          onAdd={handleAdd}
          onExportExcel={handleExportExcel}
          onChangeView={handleChangeView}
          onShowMap={handleShowMap}
          loading={loading || loadingMore}
        />

        {/* Tableau des dates */}
        {paginatedDates.length > 0 ? (
          <div className={styles.modernTableContainer}>
            <DatesTable
              dates={paginatedDates}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
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
            hasFilters={statusFilter !== 'all' || !!dateFilter}
          />
        )}
        
        {/* Pagination info */}
        {processedDates.length > 0 && (
          <div className={styles.paginationInfo}>
            <p>
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
              {Math.min(currentPage * itemsPerPage, processedDates.length)} sur{' '}
              {processedDates.length} résultats
            </p>
          </div>
        )}
      </div>
      
      {/* Bandeau des totaux */}
      <DatesTableTotals selectedDates={selectedDates} />
    </>
  );
};

export default DatesList;
