// src/components/concerts/mobile/ConcertsList.js
import React from 'react';
import { Alert } from 'react-bootstrap';
import Spinner from '@/components/common/Spinner';

// Import des mêmes hooks que la version desktop
import { 
  useConcertListData,
  useConcertFilters,
  useConcertStatus,
  useConcertActions 
} from '@/hooks/concerts';

// Import des sections spécifiques mobile (à créer si nécessaire)
import ConcertsListHeader from '@/components/concerts/sections/ConcertsListHeader';
import ConcertSearchBar from '@/components/concerts/sections/ConcertSearchBar';
import ConcertsLoadMore from '@/components/concerts/sections/ConcertsLoadMore';
import ConcertsEmptyState from '@/components/concerts/sections/ConcertsEmptyState';
import ConcertsStatsCards from '@/components/concerts/sections/ConcertsStatsCards';

// Import des styles mobile
import styles from './ConcertsList.module.css';

/**
 * Version mobile de la liste des concerts
 * Utilise la même logique que la version desktop mais avec une présentation mobile (cartes)
 */
const ConcertsList = () => {
  // Mêmes hooks que la version desktop
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
    getStatusDetails
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
      <div className={styles.concertsMobileContainer}>
        <Alert variant="danger" className="modern-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.concertsMobileContainer}>
      {/* En-tête mobile */}
      <ConcertsListHeader />
      
      {/* Statistiques */}
      <ConcertsStatsCards 
        stats={{ 
          total: concerts.length, 
          aVenir: concerts.filter(c => !isDatePassed(c.date)).length, 
          passes: concerts.filter(c => isDatePassed(c.date)).length 
        }} 
      />
      
      {/* Barre de recherche et filtres */}
      <ConcertSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusDetailsMap={statusDetailsMap}
        filteredCount={filteredConcerts.length}
        totalCount={concerts.length}
      />

      {/* Liste des concerts en format cartes mobile */}
      {filteredConcerts.length > 0 ? (
        <div className={styles.concertsListMobile}>
          {filteredConcerts.map((concert) => (
            <ConcertMobileCard
              key={concert.id}
              concert={concert}
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
          ))}
        </div>
      ) : (
        <ConcertsEmptyState 
          hasSearchQuery={!!searchTerm}
          hasFilters={statusFilter !== 'all'}
        />
      )}
      
      {/* Bouton "Charger plus" */}
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

// Composant carte mobile pour un concert
const ConcertMobileCard = ({ 
  concert, 
  getStatusDetails, 
  hasForm, 
  hasUnvalidatedForm, 
  hasContract, 
  getContractStatus, 
  isDatePassed, 
  handleViewConcert,
  handleSendForm,
  handleViewForm,
  handleGenerateContract,
  handleViewContract
}) => {
  const statusDetails = getStatusDetails(concert);
  const concertDate = concert.date ? new Date(concert.date) : null;
  const isPastConcert = concertDate ? isDatePassed(concert.date) : false;

  return (
    <div 
      className={styles.concertCard}
      onClick={() => handleViewConcert(concert.id)}
    >
      {/* Date */}
      <div className={`${styles.concertCardDate} ${isPastConcert ? styles.pastDate : ''}`}>
        {concertDate && (
          <>
            <div className={styles.dateDay}>{concertDate.getDate()}</div>
            <div className={styles.dateMonth}>
              {concertDate.toLocaleDateString('fr-FR', { month: 'short' })}
            </div>
            <div className={styles.dateYear}>{concertDate.getFullYear()}</div>
          </>
        )}
      </div>

      {/* Détails */}
      <div className={styles.concertDetails}>
        <div className={styles.concertCardTitle}>{concert.titre || 'Concert sans titre'}</div>
        
        <div className={styles.concertInfo}>
          {concert.lieuNom && (
            <div className={styles.infoItem}>
              <i className="bi bi-geo-alt"></i>
              <span className={styles.concertVenueName}>{concert.lieuNom}</span>
              {concert.lieuVille && (
                <span className={styles.concertVenueLocation}>({concert.lieuVille})</span>
              )}
            </div>
          )}
          
          {concert.artisteNom && (
            <div className={styles.infoItem}>
              <i className="bi bi-person"></i>
              <span className={styles.artistTag}>{concert.artisteNom}</span>
            </div>
          )}
          
          {concert.montant && (
            <div className={styles.infoItem}>
              <i className="bi bi-currency-euro"></i>
              <span className={styles.montant}>{concert.montant}€</span>
            </div>
          )}
        </div>

        {/* Statut */}
        <div className={styles.concertStatus}>
          <span 
            className={`${styles.concertStatusBadge} badge bg-${statusDetails?.variant || 'secondary'}`}
          >
            {statusDetails?.icon} {statusDetails?.label || 'Contact'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.concertActions}>
        <button 
          className={`${styles.actionBtn} ${styles.view}`}
          onClick={(e) => {
            e.stopPropagation();
            handleViewConcert(concert.id);
          }}
          title="Voir les détails"
        >
          <i className="bi bi-eye"></i>
        </button>
      </div>
    </div>
  );
};

export default ConcertsList;
