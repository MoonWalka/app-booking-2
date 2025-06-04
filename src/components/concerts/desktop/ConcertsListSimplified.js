import React, { useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';

// Import hooks simplifiés
import { useMultiOrgQuery } from '@/hooks/useMultiOrgQuery';

// Import section components (inchangés)
import ConcertsListHeader from '@/components/concerts/sections/ConcertsListHeader';
import ConcertSearchBar from '@/components/concerts/sections/ConcertSearchBar';
import ConcertsTable from '@/components/concerts/sections/ConcertsTable';
import ConcertsLoadMore from '@/components/concerts/sections/ConcertsLoadMore';
import ConcertsEmptyState from '@/components/concerts/sections/ConcertsEmptyState';
import ConcertsStatsCards from '@/components/concerts/sections/ConcertsStatsCards';

// Import styles
import styles from './ConcertsList.module.css';

// Configuration des statuts (au lieu d'un hook complexe)
const STATUS_CONFIG = {
  'contact-etabli': { label: 'Contact établi', color: 'blue' },
  'pre-accord': { label: 'Pré-accord', color: 'orange' },
  'contrat-signe': { label: 'Contrat signé', color: 'green' },
  'acompte-facture': { label: 'Acompte facturé', color: 'purple' },
  'solde-facture': { label: 'Soldé facturé', color: 'success' },
  'annule': { label: 'Annulé', color: 'danger' }
};

/**
 * Version simplifiée de ConcertsList - même UI, code 70% plus simple
 */
const ConcertsListSimplified = () => {
  const navigate = useNavigate();
  
  // Un seul hook pour charger les données avec pagination
  const {
    data: concerts = [],
    loading,
    error,
    loadMore,
    hasMore,
    loadingMore
  } = useMultiOrgQuery('concerts', {
    orderBy: ['date', 'desc'],
    limit: 20
  });

  // États locaux pour les filtres
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  // Mémoisation simple des concerts filtrés
  const filteredConcerts = useMemo(() => {
    if (!concerts.length) return [];

    return concerts.filter(concert => {
      // Filtre par statut
      if (statusFilter !== 'all' && concert.statut !== statusFilter) {
        return false;
      }

      // Filtre par recherche
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const searchableText = [
          concert.titre,
          concert.artiste?.nom,
          concert.lieu?.nom,
          concert.lieu?.ville,
          concert.contact?.nom
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [concerts, searchTerm, statusFilter]);

  // Calcul simple des stats
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: concerts.length,
      aVenir: concerts.filter(c => new Date(c.date) > now).length,
      passes: concerts.filter(c => new Date(c.date) <= now).length
    };
  }, [concerts]);

  // Fonctions d'action simples (pas besoin d'un hook)
  const actions = {
    viewConcert: (id) => navigate(`/concerts/${id}`),
    sendForm: (id) => navigate(`/concerts/${id}/send-form`),
    viewForm: (id) => navigate(`/concerts/${id}/form`),
    generateContract: (id) => navigate(`/contrats/generate/${id}`),
    viewContract: (id) => navigate(`/contrats/${id}`)
  };

  // Fonctions utilitaires simples
  const isDatePassed = (date) => new Date(date) < new Date();
  const getStatusDetails = (status) => STATUS_CONFIG[status] || { label: status, color: 'default' };

  // États de chargement et d'erreur
  if (loading) {
    return <Spinner message="Chargement des concerts..." contentOnly={true} />;
  }

  if (error) {
    return (
      <div className={styles.concertsContainer}>
        <Alert variant="danger" className="modern-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error.message || 'Erreur lors du chargement des concerts'}
        </Alert>
      </div>
    );
  }

  // Rendu principal (exactement le même que l'original)
  return (
    <div className={styles.tableContainer}>
      {/* En-tête avec titre et bouton d'ajout */}
      <ConcertsListHeader />
      
      {/* Cartes de statistiques */}
      <ConcertsStatsCards stats={stats} />
      
      {/* Barre de recherche et filtres */}
      <ConcertSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusDetailsMap={STATUS_CONFIG}
        filteredCount={filteredConcerts.length}
        totalCount={concerts.length}
      />

      {/* Tableau des concerts ou état vide */}
      {filteredConcerts.length > 0 ? (
        <div className={styles.modernTableContainer}>
          <ConcertsTable
            concerts={filteredConcerts}
            getStatusDetails={getStatusDetails}
            hasForm={(concert) => !!concert.formId}
            hasUnvalidatedForm={(concert) => concert.formId && !concert.formValidated}
            hasContract={(concert) => !!concert.contratId}
            getContractStatus={(concert) => concert.contratStatus || 'draft'}
            concertsWithContracts={concerts.filter(c => c.contratId)}
            getContractButtonVariant={(status) => status === 'signed' ? 'success' : 'secondary'}
            getContractTooltip={(concert) => concert.contratId ? 'Voir le contrat' : 'Générer le contrat'}
            isDatePassed={isDatePassed}
            handleViewConcert={actions.viewConcert}
            handleSendForm={actions.sendForm}
            handleViewForm={actions.viewForm}
            handleGenerateContract={actions.generateContract}
            handleViewContract={actions.viewContract}
          />
        </div>
      ) : (
        <ConcertsEmptyState 
          hasSearchQuery={!!searchTerm}
          hasFilters={statusFilter !== 'all'}
        />
      )}
      
      {/* Pagination - uniquement sans filtres actifs */}
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

export default ConcertsListSimplified;