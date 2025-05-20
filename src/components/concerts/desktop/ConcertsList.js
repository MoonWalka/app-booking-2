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
import ConcertsListHeader from '../sections/ConcertsListHeader';
import ConcertSearchBar from '../sections/ConcertSearchBar';
import ConcertStatusTabs from '../sections/ConcertStatusTabs';
import ConcertsTable from '../sections/ConcertsTable';

// Import styles
import styles from './ConcertsList.module.css';

/**
 * ConcertsList component displays a filterable, searchable list of concerts
 */
const ConcertsList = () => {
  // Use custom hooks for data, filtering, status and actions
  const { 
    concerts, 
    loading, 
    error, 
    hasForm, 
    hasUnvalidatedForm, 
    hasContract,
    getContractStatus
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

  return (
    <div className={`${styles.concertsContainer} p-4 bg-[var(--tc-light-color)]`}>
      <div className="flex items-center justify-between mb-6">
        <ConcertsListHeader />
      </div>

      <div className="mb-4">
        <ConcertSearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
      </div>

      <div className="mb-4">
        <ConcertStatusTabs 
          statusFilter={statusFilter} 
          setStatusFilter={setStatusFilter} 
          statusDetailsMap={statusDetailsMap}
        />
      </div>

      <ConcertsTable
        concerts={filteredConcerts}
        getStatusDetails={getStatusDetails}
        hasForm={hasForm}
        hasUnvalidatedForm={hasUnvalidatedForm}
        hasContract={hasContract}
        getContractStatus={getContractStatus}
        isDatePassed={isDatePassed}
        handleViewConcert={handleViewConcert}
        handleSendForm={handleSendForm}
        handleViewForm={handleViewForm}
        handleGenerateContract={handleGenerateContract}
        handleViewContract={handleViewContract}
      />
    </div>
  );
};

export default ConcertsList;
