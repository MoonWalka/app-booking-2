import React from 'react';
import { Alert } from 'react-bootstrap';
import Spinner from '@/components/common/Spinner';
import PerformanceMonitor from '@/components/common/PerformanceMonitor';
import UnifiedDebugDashboard from '@/components/debug/UnifiedDebugDashboard';

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

// 🔧 CONTRÔLE DES OUTILS DE DIAGNOSTIC
// Changer cette valeur à true pour réactiver les outils de diagnostic
const SHOW_DIAGNOSTIC_TOOLS = false;

/**
 * ConcertsList component displays a filterable, searchable list of concerts
 * with pagination support
 */
const ConcertsList = () => {
  // Mesure du temps de montage du composant
  React.useEffect(() => {
    const mountTime = performance.now();
    console.log('⏱️ Début du montage ConcertsList:', mountTime);
    
    return () => {
      console.log('⏱️ Durée de vie du composant ConcertsList:', performance.now() - mountTime, 'ms');
    };
  }, []);
  
  // Hooks avec support de pagination
  console.time('⏱️ Initialisation hooks ConcertsList');
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
  console.timeEnd('⏱️ Initialisation hooks ConcertsList');

  console.time('⏱️ Initialisation ConcertFilters');
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredConcerts,
    isDatePassed
  } = useConcertFilters(concerts);
  console.timeEnd('⏱️ Initialisation ConcertFilters');

  // Mesurer le temps de filtrage
  React.useEffect(() => {
    if (concerts.length > 0) {
      console.time('⏱️ Filtrage des concerts');
      console.log(`Concerts initiaux: ${concerts.length}, Filtrés: ${filteredConcerts.length}`);
      console.timeEnd('⏱️ Filtrage des concerts');
    }
  }, [filteredConcerts, concerts.length]);

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

  // Fonction pour activer le diagnostic de performance
  const activateDiagnostic = () => {
    if (window.performanceDiagnostic) {
      window.performanceDiagnostic.start();
      alert('Diagnostic de performance activé. Utilisez la console et performanceDiagnostic.stop() pour voir les résultats.');
    } else {
      alert('Outil de diagnostic non disponible.');
    }
  };

  return (
    <div className={styles.tableContainer}>
      {/* Moniteurs de performance en mode développement */}
      {SHOW_DIAGNOSTIC_TOOLS && (
        <>
          <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
          <UnifiedDebugDashboard enabled={process.env.NODE_ENV === 'development'} />
        </>
      )}
      
      {/* Bouton de diagnostic (visible uniquement en développement) */}
      {process.env.NODE_ENV === 'development' && SHOW_DIAGNOSTIC_TOOLS && (
        <div className={styles.debugButtonContainer}>
          <button 
            onClick={activateDiagnostic}
            className={styles.debugButton}
          >
            Activer Diagnostic
          </button>
        </div>
      )}
      
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
