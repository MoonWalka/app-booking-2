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
import ConcertStatusTabs from '@/components/concerts/sections/ConcertStatusTabs';
import ConcertsTable from '@/components/concerts/sections/ConcertsTable';

// Import styles
import styles from './ConcertsList.module.css';

/**
 * ConcertsList component displays a filterable, searchable list of concerts
 */
const ConcertsList = () => {
  // Tous vos hooks existants - ne rien changer ici
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

  // Debug: log filtered concerts and current status filter
  console.log('ConcertsList - statusFilter:', statusFilter);
  console.log('ConcertsList - filteredConcerts:', filteredConcerts);

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
    <div className={styles.concertsContainer}>
      {/* Section d'en-tête avec titre et bouton d'ajout */}
      <ConcertsListHeader />
      
      {/* Navigation par onglets de statut */}
      <ConcertStatusTabs 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
        statusDetailsMap={statusDetailsMap}
      />
      
      {/* Barre de recherche et filtres */}
      <ConcertSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

      {/* Tableau des concerts */}
      <div className={styles.tableContainer}>
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
    </div>
  );
};

export default ConcertsList;
